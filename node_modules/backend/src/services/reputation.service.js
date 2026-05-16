import { ensureSupabase } from "../db/supabase.js";

/**
 * Add or subtract reputation points for a user. Enforces floor of 0.
 * @param {string} userId - user id (contributor)
 * @param {number} delta - points to add (positive) or subtract (negative)
 */
export async function addReputation(userId, delta) {
  if (!userId || delta === 0) return;
  const supabase = ensureSupabase();
  const { data: user, error: fetchErr } = await supabase
    .from("users")
    .select("reputation_score")
    .eq("id", userId)
    .single();
  if (fetchErr || !user) return;
  const current = Number(user.reputation_score) || 0;
  const next = Math.max(0, current + delta);
  await supabase
    .from("users")
    .update({ reputation_score: next })
    .eq("id", userId);
}

/**
 * Points for a single rating given to a submission (for the submission's contributor).
 * 5 star → +5, 4 star → +3, Like (any rating) → +1.
 * So: overall 5 => 5, overall 4 => 3, else 1.
 */
export function pointsForRating(clarityScore, usefulnessScore) {
  const c = Number(clarityScore) || 0;
  const u = Number(usefulnessScore) || 0;
  const overall = Math.round((c * 0.6 + u * 0.4) * 10) / 10;
  if (overall >= 4.5) return 5;
  if (overall >= 3.5) return 3;
  return 1;
}
