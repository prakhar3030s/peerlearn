import { ensureSupabase } from "../db/supabase.js";

/**
 * Get complete progress data for a student including:
 * - Overall completion percentage
 * - Progress by subject/unit
 * - Streak information
 * - Topic-level details
 */
export async function getStudentProgress(userId) {
  const supabase = ensureSupabase();

  // Get user info
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, email, branch_id, year")
    .eq("id", userId)
    .single();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  // Get user's branch and year filtered topics
  let { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select(
      `
      id,
      name,
      is_important,
      unit_id,
      units!inner(
        id,
        name,
        number,
        subject_id,
        subjects!inner(
          id,
          name,
          code,
          year,
          branch_id,
          branches!inner(
            id,
            code,
            name
          )
        )
      )
    `
    )
    .eq("units.subjects.branch_id", user.branch_id)
    .eq("units.subjects.year", user.year);

  if (topicsError) throw topicsError;

  // Get progress for these topics
  const topicIds = topics.map((t) => t.id);
  const { data: progress, error: progressError } = await supabase
    .from("topic_progress")
    .select("*")
    .eq("user_id", userId)
    .in("topic_id", topicIds);

  if (progressError) throw progressError;

  // Build progress map
  const progressMap = {};
  (progress || []).forEach((p) => {
    progressMap[p.topic_id] = {
      status: p.status,
      updated_at: p.updated_at,
    };
  });

  // Calculate statistics
  const stats = calculateProgressStats(topics, progressMap);

  return {
    user,
    topics,
    progress: progressMap,
    stats,
  };
}

/**
 * Calculate comprehensive progress statistics
 */
function calculateProgressStats(topics, progressMap) {
  // Initialize counters
  const stats = {
    total_topics: topics.length,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    completion_percentage: 0,
    by_subject: {},
    by_unit: {},
    important_topics: {
      total: 0,
      completed: 0,
      completion_percentage: 0,
    },
    streak_days: 0,
  };

  // Count by topic status
  topics.forEach((topic) => {
    const progress = progressMap[topic.id];
    const status = progress?.status || "not_started";

    if (status === "completed") stats.completed += 1;
    else if (status === "in_progress") stats.in_progress += 1;
    else stats.not_started += 1;

    // Track important topics
    if (topic.is_important) {
      stats.important_topics.total += 1;
      if (status === "completed") stats.important_topics.completed += 1;
    }

    // Group by subject
    const subject = topic.units?.subjects;
    if (subject) {
      if (!stats.by_subject[subject.id]) {
        stats.by_subject[subject.id] = {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          total: 0,
          completed: 0,
          in_progress: 0,
          not_started: 0,
          completion_percentage: 0,
        };
      }
      stats.by_subject[subject.id].total += 1;
      if (status === "completed") stats.by_subject[subject.id].completed += 1;
      else if (status === "in_progress")
        stats.by_subject[subject.id].in_progress += 1;
      else stats.by_subject[subject.id].not_started += 1;
    }

    // Group by unit
    const unit = topic.units;
    if (unit) {
      if (!stats.by_unit[unit.id]) {
        stats.by_unit[unit.id] = {
          id: unit.id,
          name: unit.name,
          number: unit.number,
          subject_id: subject?.id,
          total: 0,
          completed: 0,
          in_progress: 0,
          not_started: 0,
          completion_percentage: 0,
        };
      }
      stats.by_unit[unit.id].total += 1;
      if (status === "completed") stats.by_unit[unit.id].completed += 1;
      else if (status === "in_progress")
        stats.by_unit[unit.id].in_progress += 1;
      else stats.by_unit[unit.id].not_started += 1;
    }
  });

  // Calculate percentages
  if (stats.total_topics > 0) {
    stats.completion_percentage = Math.round(
      (stats.completed / stats.total_topics) * 100
    );
  }

  if (stats.important_topics.total > 0) {
    stats.important_topics.completion_percentage = Math.round(
      (stats.important_topics.completed / stats.important_topics.total) * 100
    );
  }

  // Calculate percentages for subjects
  Object.values(stats.by_subject).forEach((subject) => {
    if (subject.total > 0) {
      subject.completion_percentage = Math.round(
        (subject.completed / subject.total) * 100
      );
    }
  });

  // Calculate percentages for units
  Object.values(stats.by_unit).forEach((unit) => {
    if (unit.total > 0) {
      unit.completion_percentage = Math.round(
        (unit.completed / unit.total) * 100
      );
    }
  });

  return stats;
}

/**
 * Mark a topic as started by a student
 */
export async function markTopicInProgress(userId, topicId) {
  const supabase = ensureSupabase();

  const { data, error } = await supabase
    .from("topic_progress")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a topic as completed by a student
 */
export async function markTopicCompleted(userId, topicId) {
  const supabase = ensureSupabase();

  const { data, error } = await supabase
    .from("topic_progress")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        status: "completed",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reset a topic to not started
 */
export async function resetTopicProgress(userId, topicId) {
  const supabase = ensureSupabase();

  const { data, error } = await supabase
    .from("topic_progress")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        status: "not_started",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get progress comparison for multiple users
 */
export async function getClassProgress(branchId, year) {
  const supabase = ensureSupabase();

  // Get all students in this branch/year
  const { data: students, error: studentError } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("branch_id", branchId)
    .eq("year", year)
    .eq("role", "student");

  if (studentError) throw studentError;

  // Get progress for all students
  const progressData = [];
  for (const student of students) {
    const progress = await getStudentProgress(student.id);
    progressData.push({
      student: student.name,
      email: student.email,
      completion_percentage: progress.stats.completion_percentage,
      completed: progress.stats.completed,
      total_topics: progress.stats.total_topics,
    });
  }

  // Sort by completion percentage descending
  progressData.sort((a, b) => b.completion_percentage - a.completion_percentage);

  return progressData;
}
