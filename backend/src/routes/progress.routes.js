import express from "express";
import { body, query } from "express-validator";
import { validate } from "../middleware/validate.js";
import {
  getStudentProgress,
  markTopicInProgress,
  markTopicCompleted,
  resetTopicProgress,
  getClassProgress,
} from "../services/progress.service.js";

const router = express.Router();

// GET /api/progress/student/:user_id — comprehensive progress data for a student
router.get(
  "/student/:user_id",
  query("user_id").isUUID().optional(),
  validate,
  async (req, res, next) => {
    try {
      const userId = req.params.user_id;
      const progressData = await getStudentProgress(userId);
      res.json({ success: true, data: progressData });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/progress?user_id= — topic progress for a user (keyed by topic_id)
router.get(
  "/",
  query("user_id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { user_id } = req.query;
      const progressData = await getStudentProgress(user_id);
      const byTopic = {};
      Object.entries(progressData.progress).forEach(([topicId, progress]) => {
        byTopic[topicId] = {
          status: progress.status,
          updated_at: progress.updated_at,
        };
      });
      res.json({ success: true, data: { byTopic } });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PATCH /api/progress — set topic progress (upsert)
router.patch(
  "/",
  body("user_id").isUUID(),
  body("topic_id").isUUID(),
  body("status").isIn(["not_started", "in_progress", "completed"]),
  validate,
  async (req, res, next) => {
    try {
      const { user_id, topic_id, status } = req.body;
      let data;
      if (status === "in_progress") {
        data = await markTopicInProgress(user_id, topic_id);
      } else if (status === "completed") {
        data = await markTopicCompleted(user_id, topic_id);
      } else {
        data = await resetTopicProgress(user_id, topic_id);
      }
      res.json({ success: true, data });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// POST /api/progress/mark-started — mark topic as started
router.post(
  "/mark-started",
  body("user_id").isUUID(),
  body("topic_id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { user_id, topic_id } = req.body;
      const data = await markTopicInProgress(user_id, topic_id);
      res.json({ success: true, data, message: "Topic marked as started" });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// POST /api/progress/mark-completed — mark topic as completed
router.post(
  "/mark-completed",
  body("user_id").isUUID(),
  body("topic_id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { user_id, topic_id } = req.body;
      const data = await markTopicCompleted(user_id, topic_id);
      res.json({ success: true, data, message: "Topic marked as completed" });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// POST /api/progress/reset — reset topic progress
router.post(
  "/reset",
  body("user_id").isUUID(),
  body("topic_id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { user_id, topic_id } = req.body;
      const data = await resetTopicProgress(user_id, topic_id);
      res.json({ success: true, data, message: "Progress reset" });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/progress/class — get progress for all students in a class
router.get(
  "/class",
  query("branch_id").isUUID(),
  query("year").isInt({ min: 1, max: 4 }),
  validate,
  async (req, res, next) => {
    try {
      const { branch_id, year } = req.query;
      const classProgress = await getClassProgress(branch_id, parseInt(year));
      res.json({ success: true, data: classProgress });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

export default router;
