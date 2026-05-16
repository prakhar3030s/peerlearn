import express from "express";
import { body, param } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";
import {
  addReputation,
  pointsForRating,
} from "../services/reputation.service.js";

const router = express.Router();

function calculateScore(clarity, usefulness) {
  const c = Number(clarity) || 0;
  const u = Number(usefulness) || 0;
  return Math.round((c * 0.6 + u * 0.4) * 10) / 10;
}

// POST /api/ratings — upsert rating and update contributor reputation (5★ +5, 4★ +3, like +1)
router.post(
  "/",
  body("student_id").isUUID(),
  body("submission_id").isUUID(),
  body("clarity_score").isInt({ min: 1, max: 5 }),
  body("usefulness_score").isInt({ min: 1, max: 5 }),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { student_id, submission_id, clarity_score, usefulness_score } =
        req.body;

      const { data: oldRating } = await supabase
        .from("ratings")
        .select("clarity_score, usefulness_score")
        .eq("student_id", student_id)
        .eq("submission_id", submission_id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("ratings")
        .upsert(
          {
            student_id,
            submission_id,
            clarity_score,
            usefulness_score,
          },
          { onConflict: "student_id,submission_id" }
        )
        .select("*")
        .single();

      if (error) throw error;

      const { data: submission } = await supabase
        .from("submissions")
        .select("contributor_id")
        .eq("id", submission_id)
        .single();

      if (submission?.contributor_id) {
        const newPoints = pointsForRating(clarity_score, usefulness_score);
        const oldPoints = oldRating
          ? pointsForRating(
              oldRating.clarity_score,
              oldRating.usefulness_score
            )
          : 0;
        const delta = newPoints - oldPoints;
        if (delta !== 0) {
          await addReputation(submission.contributor_id, delta);
        }
      }

      const overall = calculateScore(clarity_score, usefulness_score);
      res.status(201).json({ success: true, data: { ...data, overall } });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/ratings/submission/:submissionId
router.get(
  "/submission/:submissionId",
  param("submissionId").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("submission_id", submissionId);
      if (error) throw error;

      const count = data.length;
      const sumClarity = data.reduce(
        (acc, r) => acc + Number(r.clarity_score || 0),
        0
      );
      const sumUsefulness = data.reduce(
        (acc, r) => acc + Number(r.usefulness_score || 0),
        0
      );

      const avgClarity = count ? sumClarity / count : 0;
      const avgUsefulness = count ? sumUsefulness / count : 0;
      const overall = calculateScore(avgClarity, avgUsefulness);

      res.json({
        success: true,
        data: {
          ratings: data,
          count,
          averages: {
            clarity: Number(avgClarity.toFixed(2)),
            usefulness: Number(avgUsefulness.toFixed(2)),
            overall: count >= 3 ? overall : null,
          },
        },
      });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/ratings/user/:userId/submission/:submissionId
router.get(
  "/user/:userId/submission/:submissionId",
  param("userId").isUUID(),
  param("submissionId").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { userId, submissionId } = req.params;
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("student_id", userId)
        .eq("submission_id", submissionId)
        .maybeSingle();

      if (error) throw error;

      res.json({ success: true, data });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

export default router;

