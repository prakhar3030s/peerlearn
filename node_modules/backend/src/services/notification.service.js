import { ensureSupabase } from "../db/supabase.js";

export async function createNotification(userId, type, title, message = "") {
  const supabase = ensureSupabase();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[Notification] Failed to create notification", error);
    const err = new Error("Failed to create notification");
    err.status = 500;
    throw err;
  }

  return data;
}

