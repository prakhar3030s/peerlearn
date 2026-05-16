import express from "express";
import { query } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

function calculateScore(clarity, usefulness) {
  const c = Number(clarity) || 0;
  const u = Number(usefulness) || 0;
  return Math.round((c * 0.6 + u * 0.4) * 10) / 10;
}

async function attachRatings(supabase, submissions) {
  if (!submissions.length) return [];
  const ids = submissions.map((s) => s.id);
  const { data: ratings, error } = await supabase
    .from("ratings")
    .select("*")
    .in("submission_id", ids);
  if (error) throw error;

  const grouped = {};
  ratings.forEach((r) => {
    if (!grouped[r.submission_id]) grouped[r.submission_id] = [];
    grouped[r.submission_id].push(r);
  });

  return submissions.map((s) => {
    const rs = grouped[s.id] || [];
    const count = rs.length;
    const sumClarity = rs.reduce(
      (acc, r) => acc + Number(r.clarity_score || 0),
      0
    );
    const sumUsefulness = rs.reduce(
      (acc, r) => acc + Number(r.usefulness_score || 0),
      0
    );
    const avgClarity = count ? sumClarity / count : 0;
    const avgUsefulness = count ? sumUsefulness / count : 0;
    const overall = calculateScore(avgClarity, avgUsefulness);
    return {
      ...s,
      ratings: {
        count,
        avgClarity: Number(avgClarity.toFixed(2)),
        avgUsefulness: Number(avgUsefulness.toFixed(2)),
        overall: count >= 3 ? overall : null,
      },
    };
  });
}

// GET /api/search
router.get(
  "/",
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  validate,
  async (req, res, next) => {
    try {
      const {
        q,
        branch,
        year,
        subject,
        sort = "rating",
        page = 1,
        limit = 10,
      } = req.query;

      const supabase = ensureSupabase();
      const pageNum = Number(page);
      const pageSize = Number(limit);
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;

      // Filter approved submissions first
      let base = supabase
        .from("submissions")
        .select(
          `
          *,
          topic:topics(
            name,
            unit:units(
              name,
              subject:subjects(
                id,
                name,
                year,
                branch:branches(
                  id,
                  code
                )
              )
            )
          )
        `,
          { count: "exact" }
        )
        .eq("status", "approved");

      if (branch) {
        base = base.eq("topic.unit.subject.branch.code", branch);
      }
      if (year) {
        base = base.eq("topic.unit.subject.year", Number(year));
      }
      if (subject) {
        base = base.ilike("topic.unit.subject.name", `%${subject}%`);
      }
      if (q) {
        // Use ilike on description and youtube_title; topic/subject filters already applied above
        base = base.or(
          `description.ilike.%${q}%,youtube_title.ilike.%${q}%`
        );
      }

      base = base.order("created_at", { ascending: false });

      const { data, error, count } = await base.range(from, to);
      if (error) throw error;

      let withRatings = await attachRatings(supabase, data || []);
      if (sort === "rating") {
        withRatings = withRatings.sort((a, b) => {
          const aScore = a.ratings.overall ?? 0;
          const bScore = b.ratings.overall ?? 0;
          return bScore - aScore;
        });
      }

      res.json({
        success: true,
        data: withRatings,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total: count || 0,
        },
        filters: {
          q: q || null,
          branch: branch || null,
          year: year ? Number(year) : null,
          subject: subject || null,
          sort,
        },
      });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

export default router;

