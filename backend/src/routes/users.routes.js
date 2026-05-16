import express from "express";
import { body, query } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// GET /api/users (exclude password_hash)
router.get("/", async (req, res, next) => {
  try {
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, year, branch_id, reputation_score, created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/users/leaderboard?branch=CSE&year=2&period=all|semester|month
router.get(
  "/leaderboard",
  query("branch").optional().isString(),
  query("year").optional().isInt({ min: 1, max: 4 }),
  query("period").optional().isIn(["all", "semester", "month"]),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { branch: branchCode, year } = req.query;

      let query = supabase
        .from("users")
        .select(
          `
          id,
          name,
          email,
          year,
          branch_id,
          reputation_score,
          role,
          created_at,
          branch:branches(id, name, code)
        `
        )
        .eq("role", "student");

      if (branchCode) {
        const { data: branchRow } = await supabase
          .from("branches")
          .select("id")
          .eq("code", String(branchCode).toUpperCase())
          .maybeSingle();
        if (branchRow) query = query.eq("branch_id", branchRow.id);
      }
      if (year != null) query = query.eq("year", Number(year));

      const { data: users, error } = await query
        .order("reputation_score", { ascending: false })
        .limit(100);

      if (error) throw error;

      const userIds = (users || []).map((u) => u.id);
      const countsByUser = {};
      if (userIds.length) {
        const { data: subs } = await supabase
          .from("submissions")
          .select("contributor_id")
          .eq("status", "approved")
          .in("contributor_id", userIds);
        (subs || []).forEach((s) => {
          countsByUser[s.contributor_id] = (countsByUser[s.contributor_id] || 0) + 1;
        });
      }

      const withBadge = (u) => {
        const score = u.reputation_score || 0;
        let badge = "Newcomer";
        if (score >= 2500) badge = "Legend";
        else if (score >= 1000) badge = "Expert";
        else if (score >= 500) badge = "Scholar";
        else if (score >= 200) badge = "Mentor";
        else if (score >= 50) badge = "Contributor";
        return {
          ...u,
          badge,
          approved_videos_count: countsByUser[u.id] || 0,
          branch_code: u.branch?.code,
          branch_name: u.branch?.name,
        };
      };

      res.json({ success: true, data: (users || []).map(withBadge) });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/users/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        branch:branches(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const notFound = new Error("User not found");
        notFound.status = 404;
        throw notFound;
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// POST /api/users
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("email").isEmail(),
  body("role").optional().isIn(["student", "moderator", "admin"]),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("users")
        .insert(req.body)
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          const conflict = new Error("User with this email already exists");
          conflict.status = 409;
          throw conflict;
        }
        throw error;
      }

      res.status(201).json({ success: true, data });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

export default router;

