import express from "express";
import { body, param, query } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";
import { fetchVideoMetadata } from "../services/youtube.service.js";
import { createNotification } from "../services/notification.service.js";
import {
  sendSubmissionReceived,
} from "../services/email.service.js";

const router = express.Router();

function calculateScore(clarity, usefulness) {
  const c = Number(clarity) || 0;
  const u = Number(usefulness) || 0;
  return Math.round((c * 0.6 + u * 0.4) * 10) / 10;
}

// Helper to attach rating aggregates
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

// GET /api/submissions — returns contributor and topic for cards; sort: rating | recent | views
router.get(
  "/",
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("sort").optional().isIn(["rating", "recent", "views"]),
  validate,
  async (req, res, next) => {
    try {
      const {
        topicId,
        status = "approved",
        sort = "rating",
        page = 1,
        limit = 10,
      } = req.query;
      const supabase = ensureSupabase();

      const pageNum = Number(page);
      const pageSize = Number(limit);
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;

      const select =
        "*, contributor:users!submissions_contributor_id_fkey(id, name), topic:topics(id, name)";
      let baseQuery = supabase
        .from("submissions")
        .select(select, { count: "exact" });

      if (topicId) {
        baseQuery = baseQuery.eq("topic_id", topicId);
      }
      if (status) {
        baseQuery = baseQuery.eq("status", status);
      }

      if (sort === "recent") {
        baseQuery = baseQuery.order("created_at", { ascending: false });
      } else if (sort === "views") {
        baseQuery = baseQuery.order("view_count", { ascending: false });
      } else {
        // rating sort applied in-memory after we attach ratings
        baseQuery = baseQuery.order("created_at", { ascending: false });
      }

      const { data, error, count } = await baseQuery.range(from, to);
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
      });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/submissions/stats
router.get("/stats", async (req, res, next) => {
  try {
    const supabase = ensureSupabase();

    const [
      { count: approvedCount, error: approvedError },
      { count: subjectsCount, error: subjectsError },
      { count: topicsCount, error: topicsError },
      { data: contributorRows, error: contributorsError },
    ] = await Promise.all([
      supabase
        .from("submissions")
        .select("id", { head: true, count: "exact" })
        .eq("status", "approved"),
      supabase
        .from("subjects")
        .select("id", { head: true, count: "exact" }),
      supabase
        .from("topics")
        .select("id", { head: true, count: "exact" }),
      supabase
        .from("submissions")
        .select("contributor_id", { count: "exact" }),
    ]);

    if (approvedError) throw approvedError;
    if (subjectsError) throw subjectsError;
    if (topicsError) throw topicsError;
    if (contributorsError) throw contributorsError;

    // Distinct contributor ids
    const contributorSet = new Set(
      (contributorRows || []).map((row) => row.contributor_id)
    );

    res.json({
      success: true,
      data: {
        totalApproved: approvedCount || 0,
        totalSubjects: subjectsCount || 0,
        totalContributors: contributorSet.size,
        totalTopics: topicsCount || 0,
      },
    });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/submissions/mine/:userId — for contributor dashboard (topic + unit/subject for display)
router.get("/mine/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const supabase = ensureSupabase();
    const selectMine =
      "*, topic:topics(id, name, unit:units(id, number, name, subject:subjects(id, name)))";
    const { data, error } = await supabase
      .from("submissions")
      .select(selectMine)
      .eq("contributor_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/submissions/:id — full embed for video page: contributor (with badge/branch), topic hierarchy
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = ensureSupabase();
    const selectSingle =
      "*, " +
      "contributor:users!submissions_contributor_id_fkey(id, name, reputation_score, year, branch:branches(id, code, name)), " +
      "topic:topics(id, name, is_important, unit:units(id, number, name, subject:subjects(id, name, year, branch:branches(id, code, name))))";
    const { data, error } = await supabase
      .from("submissions")
      .select(selectSingle)
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        const notFound = new Error("Submission not found");
        notFound.status = 404;
        throw notFound;
      }
      throw error;
    }

    const [withRatings] = await attachRatings(supabase, [data]);

    res.json({ success: true, data: withRatings });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// POST /api/submissions
router.post(
  "/",
  submissionLimiter,
  body("youtube_url").isString().notEmpty(),
  body("topic_id").isUUID(),
  body("description").isString().isLength({ min: 10 }),
  body("contributor_id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const {
        youtube_url,
        topic_id,
        description,
        contributor_id,
        drive_url,
        language,
      } = req.body;

      const supabase = ensureSupabase();

      const meta = await fetchVideoMetadata(youtube_url);

      const { data: submission, error } = await supabase
        .from("submissions")
        .insert({
          youtube_url,
          topic_id,
          description,
          contributor_id,
          drive_url: drive_url || null,
          language: language || "English",
          youtube_title: meta.title,
          youtube_thumbnail: meta.thumbnail,
          youtube_duration: meta.duration,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) throw error;

      // Find contributor
      const { data: contributor, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", contributor_id)
        .single();
      if (!userError && contributor) {
        await sendSubmissionReceived(contributor, submission);
      }

      // Notify all moderators about new submission
      const { data: moderators, error: modError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "moderator");
      if (!modError && moderators) {
        await Promise.all(
          moderators.map((m) =>
            createNotification(
              m.id,
              "submission_pending",
              "New submission pending review",
              "A new student submission is waiting in the moderation queue."
            )
          )
        );
      }

      res.status(201).json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

export default router;

