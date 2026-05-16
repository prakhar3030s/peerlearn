import express from "express";
import { ensureSupabase } from "../db/supabase.js";

const router = express.Router();

// GET /api/syllabus/branches
router.get("/branches", async (req, res, next) => {
  try {
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/syllabus/branches/:branchId/subjects?year=
router.get("/branches/:branchId/subjects", async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { year } = req.query;
    const supabase = ensureSupabase();
    let query = supabase
      .from("subjects")
      .select("*")
      .eq("branch_id", branchId)
      .order("year", { ascending: true })
      .order("name", { ascending: true });

    if (year) {
      query = query.eq("year", Number(year));
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/syllabus/subjects/:subjectId/units
router.get("/subjects/:subjectId/units", async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("units")
      .select("*, topics(*)")
      .eq("subject_id", subjectId)
      .order("number", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/syllabus/units/:unitId/topics
router.get("/units/:unitId/topics", async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("unit_id", unitId)
      .order("name", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// GET /api/syllabus/topics/:topicId
router.get("/topics/:topicId", async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("topics")
      .select(
        `
        *,
        unit:units (
          *,
          subject:subjects (
            *,
            branch:branches(*)
          )
        )
      `
      )
      .eq("id", topicId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const notFound = new Error("Topic not found");
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

