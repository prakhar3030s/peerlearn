import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios.js";

const PROGRESS_KEY = "progress";
const STUDENT_PROGRESS_KEY = "student-progress";

/**
 * Get simple topic progress (backward compatible)
 */
export function useProgress(userId) {
  return useQuery({
    queryKey: [PROGRESS_KEY, userId],
    queryFn: async () => {
      const res = await api.get("/progress", {
        params: { user_id: userId },
      });
      return res.data?.data?.byTopic ?? {};
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get comprehensive student progress with analytics
 */
export function useStudentProgress(userId) {
  return useQuery({
    queryKey: [STUDENT_PROGRESS_KEY, userId],
    queryFn: async () => {
      const res = await api.get(`/progress/student/${userId}`);
      return res.data?.data ?? {};
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSetProgress(userId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ topic_id, status }) => {
      const res = await api.patch("/progress", {
        user_id: userId,
        topic_id,
        status,
      });
      return res.data.data;
    },
    onSuccess: (data, { topic_id, status }) => {
      if (userId) {
        // Update the simple progress cache
        client.setQueryData([PROGRESS_KEY, userId], (oldData = {}) => {
          return {
            ...oldData,
            [topic_id]: {
              status: status,
              updated_at: new Date().toISOString(),
            },
          };
        });

        // Invalidate student progress to refetch full analytics
        client.invalidateQueries({ queryKey: [STUDENT_PROGRESS_KEY, userId] });
      }
    },
  });
}

/**
 * Mark a topic as started
 */
export function useMarkTopicStarted(userId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (topicId) => {
      const res = await api.post("/progress/mark-started", {
        user_id: userId,
        topic_id: topicId,
      });
      return res.data.data;
    },
    onSuccess: (_data, topicId) => {
      if (userId) {
        // Update cache
        client.setQueryData([PROGRESS_KEY, userId], (oldData = {}) => {
          return {
            ...oldData,
            [topicId]: {
              status: "in_progress",
              updated_at: new Date().toISOString(),
            },
          };
        });
        client.invalidateQueries({ queryKey: [STUDENT_PROGRESS_KEY, userId] });
      }
    },
  });
}

/**
 * Mark a topic as completed
 */
export function useMarkTopicCompleted(userId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (topicId) => {
      const res = await api.post("/progress/mark-completed", {
        user_id: userId,
        topic_id: topicId,
      });
      return res.data.data;
    },
    onSuccess: (_data, topicId) => {
      if (userId) {
        // Update cache
        client.setQueryData([PROGRESS_KEY, userId], (oldData = {}) => {
          return {
            ...oldData,
            [topicId]: {
              status: "completed",
              updated_at: new Date().toISOString(),
            },
          };
        });
        client.invalidateQueries({ queryKey: [STUDENT_PROGRESS_KEY, userId] });
      }
    },
  });
}

/**
 * Get class progress (all students in a branch/year)
 */
export function useClassProgress(branchId, year) {
  return useQuery({
    queryKey: ["class-progress", branchId, year],
    queryFn: async () => {
      const res = await api.get("/progress/class", {
        params: { branch_id: branchId, year },
      });
      return res.data?.data ?? [];
    },
    enabled: Boolean(branchId && year),
    staleTime: 5 * 60 * 1000,
  });
}
