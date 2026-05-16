import express from "express";
import { body } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";
import { createNotification } from "../services/notification.service.js";

const router = express.Router();

// POST /api/flags
router.post(
  "/",
  body("student_id").isUUID(),
  body("submission_id").isUUID(),
  body("reason").isString().isLength({ min: 5 }),
  validate,
  async (req, res, next) => {
    try {
      const { student_id, submission_id, reason } = req.body;
      const supabase = ensureSupabase();

      const existing = await supabase
        .from("flags")
        .select("id")
        .eq("student_id", student_id)
        .eq("submission_id", submission_id)
        .maybeSingle();

      if (existing.error) throw existing.error;
      if (existing.data) {
        const conflict = new Error(
          "You have already flagged this submission."
        );
        conflict.status = 409;
        throw conflict;
      }

      const { data: flag, error } = await supabase
        .from("flags")
        .insert({ student_id, submission_id, reason })
        .select("*")
        .single();
      if (error) throw error;

      // Count total unique flags
      const { data: allFlags, error: countError } = await supabase
        .from("flags")
        .select("id, student_id")
        .eq("submission_id", submission_id);
      if (countError) throw countError;

      const uniqueStudentIds = new Set(allFlags.map((f) => f.student_id));
      const flagCount = uniqueStudentIds.size;

      if (flagCount >= 2) {
        // Auto flag submission
        const { data: updated, error: updateError } = await supabase
          .from("submissions")
          .update({ status: "flagged" })
          .eq("id", submission_id)
          .select("id, contributor_id")
          .single();
        if (updateError) throw updateError;

        // Notify contributor
        if (updated?.contributor_id) {
          await createNotification(
            updated.contributor_id,
            "submission_flagged",
            "Your video has been flagged",
            "Your video has been flagged by multiple students and is now queued for moderator review."
          );
        }
      }

      res.status(201).json({
        success: true,
        data: { flag, flagCount },
      });
    } catch (err) {
      err.status ||= err.status || 500;
      next(err);
    }
  }
);

export default router;

