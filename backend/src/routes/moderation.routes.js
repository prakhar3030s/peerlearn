import express from "express";
import { body, param, query } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";
import {
  sendSubmissionApproved,
  sendSubmissionRejected,
  sendSubmissionFlagged,
} from "../services/email.service.js";
import { createNotification } from "../services/notification.service.js";
import { addReputation } from "../services/reputation.service.js";

const router = express.Router();

// GET /api/moderation/queue
router.get(
  "/queue",
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  validate,
  async (req, res, next) => {
    try {
      const { status = "pending", page = 1, limit = 10 } = req.query;
      const supabase = ensureSupabase();
      const pageNum = Number(page);
      const pageSize = Number(limit);
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("submissions")
        .select(
          `
          *,
          topic:topics(name, unit:units(subject:subjects(name))),
          contributor:users!submissions_contributor_id_fkey(name)
        `,
          { count: "exact" }
        )
        .eq("status", status)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) throw error;

      const submissionIds = (data || []).map((s) => s.id);
      let flagsBySubmission = {};
      if (submissionIds.length) {
        const { data: flags, error: flagsError } = await supabase
          .from("flags")
          .select("submission_id")
          .in("submission_id", submissionIds);
        if (flagsError) throw flagsError;
        flagsBySubmission = flags.reduce((acc, f) => {
          acc[f.submission_id] = (acc[f.submission_id] || 0) + 1;
          return acc;
        }, {});
      }

      const withFlagCounts = (data || []).map((s) => ({
        ...s,
        flag_count: flagsBySubmission[s.id] || 0,
      }));

      res.json({
        success: true,
        data: withFlagCounts,
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

// GET /api/moderation/:id
router.get(
  "/:id",
  param("id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const supabase = ensureSupabase();

      const { data: submission, error } = await supabase
        .from("submissions")
        .select(
          `
          *,
          contributor:users!submissions_contributor_id_fkey(*),
          topic:topics(
            *,
            unit:units(
              *,
              subject:subjects(
                *,
                branch:branches(*)
              )
            )
          )
        `
        )
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

      const { data: ratings, error: ratingsError } = await supabase
        .from("ratings")
        .select("*")
        .eq("submission_id", id);
      if (ratingsError) throw ratingsError;

      const { data: flags, error: flagsError } = await supabase
        .from("flags")
        .select("*")
        .eq("submission_id", id);
      if (flagsError) throw flagsError;

      const { data: revisions, error: revError } = await supabase
        .from("submissions")
        .select("*")
        .eq("contributor_id", submission.contributor_id)
        .eq("topic_id", submission.topic_id)
        .neq("id", submission.id)
        .order("created_at", { ascending: false });
      if (revError) throw revError;

      res.json({
        success: true,
        data: {
          submission,
          ratings,
          flags,
          revision_history: revisions,
        },
      });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

async function transitionStatus(id, status, extra = {}) {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from("submissions")
    .update({ status, ...extra })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// PATCH /api/moderation/:id/approve
router.patch(
  "/:id/approve",
  param("id").isUUID(),
  body("moderator_id").optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { moderator_id } = req.body;
      const supabase = ensureSupabase();

      const submission = await transitionStatus(id, "approved", {
        reviewed_by: moderator_id || null,
        reviewed_at: new Date().toISOString(),
      });

      await addReputation(submission.contributor_id, 20);

      const { data: contributor, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", submission.contributor_id)
        .single();
      if (!userError && contributor) {
        await sendSubmissionApproved(contributor, submission);
        await createNotification(
          contributor.id,
          "submission_approved",
          "Your video was approved",
          "Your video has been approved by a moderator and is now live for students."
        );
      }

      res.json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PATCH /api/moderation/:id/reject
router.patch(
  "/:id/reject",
  param("id").isUUID(),
  body("rejection_reason").isString().isLength({ min: 20 }),
  body("moderator_id").optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rejection_reason, moderator_id } = req.body;
      const supabase = ensureSupabase();

      const submission = await transitionStatus(id, "rejected", {
        rejection_reason,
        reviewed_by: moderator_id || null,
        reviewed_at: new Date().toISOString(),
      });

      await addReputation(submission.contributor_id, -5);

      const { data: contributor, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", submission.contributor_id)
        .single();
      if (!userError && contributor) {
        await sendSubmissionRejected(contributor, submission, rejection_reason);
        await createNotification(
          contributor.id,
          "submission_rejected",
          "Your video was rejected",
          rejection_reason
        );
      }

      res.json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PATCH /api/moderation/:id/flag
router.patch(
  "/:id/flag",
  param("id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const supabase = ensureSupabase();
      const submission = await transitionStatus(id, "flagged");

      const { data: contributor, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", submission.contributor_id)
        .single();
      if (!userError && contributor) {
        await sendSubmissionFlagged(contributor, submission);
        await createNotification(
          contributor.id,
          "submission_flagged",
          "Your video has been flagged",
          "Your video has been flagged and is waiting for moderator review."
        );
      }

      res.json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PATCH /api/moderation/:id/remove
router.patch(
  "/:id/remove",
  param("id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const submission = await transitionStatus(id, "removed");
      res.json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PATCH /api/moderation/:id/restore
router.patch(
  "/:id/restore",
  param("id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const submission = await transitionStatus(id, "approved");
      res.json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PATCH /api/moderation/:id/start-review
router.patch(
  "/:id/start-review",
  param("id").isUUID(),
  body("moderator_id").optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { moderator_id } = req.body;
      const submission = await transitionStatus(id, "under_review", {
        reviewed_by: moderator_id || null,
      });
      res.json({ success: true, data: submission });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

export default router;

