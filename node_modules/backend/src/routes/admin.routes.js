import express from "express";
import { body, param } from "express-validator";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// GET /api/admin/syllabus - full tree
router.get("/syllabus", async (req, res, next) => {
  try {
    const supabase = ensureSupabase();
    const { data, error } = await supabase
      .from("branches")
      .select(
        `
        *,
        subjects:subjects(
          *,
          units:units(
            *,
            topics:topics(*)
          )
        )
      `
      )
      .order("name", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

// POST /api/admin/branches
router.post(
  "/branches",
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("branches")
        .insert(req.body)
        .select("*")
        .single();
      if (error) throw error;
      res.status(201).json({ success: true, data });
    } catch (err) {
      if (err.code === "23505") {
        err.status = 409;
        err.message = "Branch with this code already exists";
      } else {
        err.status ||= 500;
      }
      next(err);
    }
  }
);

// POST /api/admin/subjects
router.post(
  "/subjects",
  body("branch_id").isUUID(),
  body("year").isInt({ min: 1, max: 4 }),
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("subjects")
        .insert(req.body)
        .select("*")
        .single();
      if (error) throw error;
      res.status(201).json({ success: true, data });
    } catch (err) {
      if (err.code === "23505") {
        err.status = 409;
      } else {
        err.status ||= 500;
      }
      next(err);
    }
  }
);

// POST /api/admin/units
router.post(
  "/units",
  body("subject_id").isUUID(),
  body("number").isInt(),
  body("name").isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("units")
        .insert(req.body)
        .select("*")
        .single();
      if (error) throw error;
      res.status(201).json({ success: true, data });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// POST /api/admin/topics
router.post(
  "/topics",
  body("unit_id").isUUID(),
  body("name").isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("topics")
        .insert(req.body)
        .select("*")
        .single();
      if (error) throw error;
      res.status(201).json({ success: true, data });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PUT /api/admin/topics/:id
router.put(
  "/topics/:id",
  param("id").isUUID(),
  body("name").optional().isString(),
  body("is_important").optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("topics")
        .update(req.body)
        .eq("id", id)
        .select("*")
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
  }
);

// DELETE /api/admin/topics/:id
router.delete(
  "/topics/:id",
  param("id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const supabase = ensureSupabase();
      const { error } = await supabase.from("topics").delete().eq("id", id);
      if (error) throw error;
      res.status(204).send();
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// PUT /api/admin/units/:id
router.put(
  "/units/:id",
  param("id").isUUID(),
  body("name").optional().isString(),
  body("number").optional().isInt(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const supabase = ensureSupabase();
      const { data, error } = await supabase
        .from("units")
        .update(req.body)
        .eq("id", id)
        .select("*")
        .single();
      if (error) {
        if (error.code === "PGRST116") {
          const notFound = new Error("Unit not found");
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
  }
);

// DELETE /api/admin/units/:id
router.delete(
  "/units/:id",
  param("id").isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const supabase = ensureSupabase();
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
      res.status(204).send();
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// POST /api/admin/bulk-import
router.post(
  "/bulk-import",
  (req, res, next) => {
    const raw = req.body;
    if (Array.isArray(raw)) req.body = { items: raw };
    else if (!raw || !Array.isArray(raw.items)) req.body = { items: [] };
    next();
  },
  body("items").isArray(),
  validate,
  async (req, res, next) => {
    try {
      const supabase = ensureSupabase();
      const items = req.body.items || [];
      let created = 0;
      let skipped = 0;

      for (const row of items) {
        const { branch, year, subject, unit, unitName, topic, isImportant } = row;
        if (!branch || !year || !subject || unit == null || !unitName || !topic) continue;

        let branchData = (await supabase.from("branches").select("*").eq("code", branch).maybeSingle()).data;
        if (!branchData) {
          const { data: newBranch, error: eb } = await supabase.from("branches").insert({ code: branch, name: branch }).select("*").single();
          if (eb) throw eb;
          branchData = newBranch;
        }

        const subCode = `${branch}-${subject}-${year}`.replace(/\s/g, "").slice(0, 32);
        let subjectData = (await supabase.from("subjects").select("*").eq("branch_id", branchData.id).eq("year", year).eq("name", subject).maybeSingle()).data;
        if (!subjectData) {
          const { data: newSub, error: es } = await supabase.from("subjects").insert({ branch_id: branchData.id, year, name: subject, code: subCode }).select("*").single();
          if (es) throw es;
          subjectData = newSub;
        }

        let unitData = (await supabase.from("units").select("*").eq("subject_id", subjectData.id).eq("number", unit).maybeSingle()).data;
        if (!unitData) {
          const { data: newUnit, error: eu } = await supabase.from("units").insert({ subject_id: subjectData.id, number: unit, name: unitName }).select("*").single();
          if (eu) throw eu;
          unitData = newUnit;
        }

        const existing = (await supabase.from("topics").select("id").eq("unit_id", unitData.id).eq("name", topic).maybeSingle()).data;
        if (existing) {
          skipped += 1;
          continue;
        }
        const { error: et } = await supabase.from("topics").insert({ unit_id: unitData.id, name: topic, is_important: !!isImportant });
        if (et) throw et;
        created += 1;
      }

      res.json({ success: true, data: { created, skipped } });
    } catch (err) {
      err.status ||= 500;
      next(err);
    }
  }
);

// GET /api/admin/library?q=...
router.get("/library", async (req, res, next) => {
  try {
    const { q } = req.query;
    const supabase = ensureSupabase();

    let base = supabase
      .from("submissions")
      .select(
        `
        id,
        youtube_title,
        youtube_url,
        status,
        created_at,
        contributor:users!submissions_contributor_id_fkey(id, name, email),
        topic:topics(
          name,
          unit:units(
            name,
            subject:subjects(
              name,
              year,
              branch:branches(
                code,
                name
              )
            )
          )
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (q) {
      const like = `%${q}%`;
      base = base.or(
        [
          `youtube_title.ilike.${like}`,
          `contributor.name.ilike.${like}`,
          `topic.unit.subject.name.ilike.${like}`,
          `topic.unit.name.ilike.${like}`,
        ].join(",")
      );
    }

    const { data, error, count } = await base;
    if (error) throw error;

    res.json({
      success: true,
      data,
      total: count ?? data?.length ?? 0,
    });
  } catch (err) {
    err.status ||= 500;
    next(err);
  }
});

export default router;

