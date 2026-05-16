import express from "express";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { ensureSupabase } from "../db/supabase.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();
const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

// POST /api/auth/register
router.post(
  "/register",
  body("name").isString().trim().isLength({ min: 2, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 6, max: 128 }),
  body("year").optional().isInt({ min: 1, max: 4 }),
  body("branch_id").optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, year, branch_id } = req.body;
      const supabase = ensureSupabase();

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        const err = new Error("An account with this email already exists.");
        err.status = 409;
        throw err;
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const { data: user, error } = await supabase
        .from("users")
        .insert({
          name,
          email,
          password_hash,
          role: "student",
          year: year || null,
          branch_id: branch_id || null,
        })
        .select("id, name, email, role, year, branch_id, reputation_score, created_at")
        .single();

      if (error) throw error;

      const { data: branch } = user?.branch_id
        ? await supabase.from("branches").select("id, code, name").eq("id", user.branch_id).single()
        : { data: null };

      res.status(201).json({
        success: true,
        data: {
          ...user,
          branch: branch || null,
        },
      });
    } catch (err) {
      err.status = err.status || 500;
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const supabase = ensureSupabase();

      const { data: user, error } = await supabase
        .from("users")
        .select("id, name, email, role, year, branch_id, reputation_score, created_at, password_hash")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;

      if (!user || !user.password_hash) {
        const err = new Error("Invalid email or password.");
        err.status = 401;
        throw err;
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        const err = new Error("Invalid email or password.");
        err.status = 401;
        throw err;
      }

      const { password_hash, ...safe } = user;

      const { data: branch } = safe.branch_id
        ? await supabase.from("branches").select("id, code, name").eq("id", safe.branch_id).single()
        : { data: null };

      res.json({
        success: true,
        data: {
          ...safe,
          branch: branch || null,
        },
      });
    } catch (err) {
      err.status = err.status || 500;
      next(err);
    }
  }
);

export default router;
