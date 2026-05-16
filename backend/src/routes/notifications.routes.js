import express from "express";
import { ensureSupabase } from "../db/supabase.js";

const router = express.Router();

// GET /api/notifications/:userId
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("read", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// PATCH /api/notifications/:userId/read-all
router.patch("/:userId/read-all", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .select("*");

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const notFound = new Error("Notification not found");
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

export default router;

