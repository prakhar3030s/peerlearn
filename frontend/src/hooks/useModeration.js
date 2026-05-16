import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios.js";
import { toastSuccess, toastErrorFromError } from "../lib/toast.js";

const MOD_KEY = "moderation";

export function useModerationQueue({
  status = "pending",
  page = 1,
  limit = 20,
  subject,
  dateRange,
}) {
  return useQuery({
    queryKey: [MOD_KEY, "queue", { status, page, limit, subject, dateRange }],
    queryFn: async () => {
      const res = await api.get("/moderation/queue", {
        params: { status, page, limit, subject, dateRange },
      });
      return res.data;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useModerationSubmission(id) {
  return useQuery({
    queryKey: [MOD_KEY, "submission", { id }],
    queryFn: async () => {
      const res = await api.get(`/moderation/${id}`);
      return res.data.data;
    },
    staleTime: 0,
    enabled: Boolean(id),
  });
}

export function useApproveSubmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const res = await api.patch(`/moderation/${id}/approve`, body);
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      const submissionId = variables.id;
      const contributorId =
        variables?.contributor_id ||
        variables?.contributorId ||
        data?.contributor_id ||
        data?.contributorId;
      toastSuccess("Video approved and published");
      client.invalidateQueries({ queryKey: ["submissions"] });
      client.invalidateQueries({
        queryKey: ["submissions", "single", { id: submissionId }],
      });
      client.invalidateQueries({ queryKey: [MOD_KEY, "queue"] });
      client.invalidateQueries({
        queryKey: [MOD_KEY, "submission", { id: submissionId }],
      });
      if (contributorId) {
        client.invalidateQueries({
          queryKey: ["notifications", { userId: contributorId }],
        });
      }
      client.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toastErrorFromError(err),
  });
}

export function useRejectSubmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const res = await api.patch(`/moderation/${id}/reject`, body);
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      const submissionId = variables.id;
      const contributorId =
        variables?.contributor_id ||
        variables?.contributorId ||
        data?.contributor_id ||
        data?.contributorId;
      toastSuccess("Submission rejected — contributor notified");
      client.invalidateQueries({
        queryKey: ["submissions", "single", { id: submissionId }],
      });
      client.invalidateQueries({ queryKey: [MOD_KEY, "queue"] });
      client.invalidateQueries({
        queryKey: [MOD_KEY, "submission", { id: submissionId }],
      });
      if (contributorId) {
        client.invalidateQueries({
          queryKey: ["notifications", { userId: contributorId }],
        });
      }
    },
    onError: (err) => toastErrorFromError(err),
  });
}

export function useFlagSubmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const res = await api.patch(`/moderation/${id}/flag`, body);
      return res.data.data;
    },
    onSuccess: () => {
      toastSuccess("Submission flagged for re-review");
      client.invalidateQueries({ queryKey: [MOD_KEY, "queue"] });
    },
    onError: (err) => toastErrorFromError(err),
  });
}

export function useRemoveSubmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const res = await api.patch(`/moderation/${id}/remove`, body);
      return res.data.data;
    },
    onSuccess: () => {
      toastSuccess("Submission permanently removed");
      client.invalidateQueries({ queryKey: [MOD_KEY, "queue"] });
    },
    onError: (err) => toastErrorFromError(err),
  });
}

export function useRestoreSubmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const res = await api.patch(`/moderation/${id}/restore`, body);
      return res.data.data;
    },
    onSuccess: () => {
      toastSuccess("Submission restored and live again");
      client.invalidateQueries({ queryKey: [MOD_KEY, "queue"] });
    },
    onError: (err) => toastErrorFromError(err),
  });
}

export function useStartReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, moderator_id }) => {
      const res = await api.patch(`/moderation/${id}/start-review`, {
        moderator_id,
      });
      return res.data.data;
    },
    onSuccess: (_data, { id }) => {
      client.invalidateQueries({ queryKey: [MOD_KEY, "queue"] });
      client.invalidateQueries({ queryKey: [MOD_KEY, "submission", { id }] });
    },
    onError: (err) => toastErrorFromError(err),
  });
}
