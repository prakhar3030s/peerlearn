import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios.js";
import { toastError, toastSuccess, toastErrorFromError } from "../lib/toast.js";

const SUBMISSIONS_KEY = "submissions";
const DRAFT_KEY = "peerlearn-submit-draft";

export function getSubmitDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSubmitDraft(data) {
  if (typeof window === "undefined") return;
  try {
    if (data == null) {
      window.localStorage.removeItem(DRAFT_KEY);
    } else {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }
  } catch {
    // ignore storage errors
  }
}

export function useSubmissions(params = {}) {
  return useQuery({
    queryKey: [SUBMISSIONS_KEY, "list", params],
    queryFn: async () => {
      const res = await api.get("/submissions", {
        params: {
          status: "approved",
          ...params,
        },
      });
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubmission(id) {
  return useQuery({
    queryKey: [SUBMISSIONS_KEY, "single", { id }],
    queryFn: async () => {
      const res = await api.get(`/submissions/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRelatedSubmissions(topicId, excludeId) {
  return useQuery({
    queryKey: [SUBMISSIONS_KEY, "related", { topicId, excludeId }],
    queryFn: async () => {
      const res = await api.get("/submissions", {
        params: {
          topicId,
          status: "approved",
          sort: "rating",
          limit: 4,
        },
      });
      const list = res.data?.data || [];
      return list.filter((s) => s.id !== excludeId);
    },
    enabled: Boolean(topicId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMySubmissions(userId) {
  return useQuery({
    queryKey: [SUBMISSIONS_KEY, "mine", { userId }],
    queryFn: async () => {
      const res = await api.get(`/submissions/mine/${userId}`);
      return res.data.data || [];
    },
    enabled: Boolean(userId),
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateSubmission(options = {}) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/submissions", payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: (data, variables, context) => {
      setSubmitDraft(null);
      const userId =
        variables?.contributor_id ||
        variables?.contributorId ||
        data?.contributor_id ||
        data?.contributorId;
      if (userId) {
        client.invalidateQueries({
          queryKey: [SUBMISSIONS_KEY, "mine", { userId }],
        });
      } else {
        client.invalidateQueries({
          queryKey: [SUBMISSIONS_KEY, "mine"],
        });
      }
      client.invalidateQueries({ queryKey: ["moderation", "queue"] });
      toastSuccess("Your video has been submitted for review!");
      if (typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (err, variables, context) => {
      toastErrorFromError(err);
      if (typeof options.onError === "function") {
        options.onError(err, variables, context);
      }
    },
  });
}

export function useCreateRating(submissionId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/ratings", payload);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      toastSuccess("Thanks for rating!");
      client.invalidateQueries({
        queryKey: ["ratings", "submission", { submissionId }],
      });
      client.invalidateQueries({
        queryKey: [SUBMISSIONS_KEY, "single", { id: submissionId }],
      });
      const userId = variables?.student_id;
      if (userId) {
        client.invalidateQueries({
          queryKey: ["ratings", "user", { userId, submissionId }],
        });
      }
    },
    onError: (err) => toastErrorFromError(err),
  });
}

export function useCreateFlag(submissionId, userId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/flags", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toastSuccess("Thank you. Your report has been submitted.");
      client.invalidateQueries({
        queryKey: [SUBMISSIONS_KEY, "single", { id: submissionId }],
      });
      client.invalidateQueries({
        queryKey: ["flags", { submissionId }],
      });
    },
    onError: (error) => {
      if (error?.response?.status === 409) {
        toastError("You have already reported this video.");
      } else {
        toastErrorFromError(error);
      }
    },
  });
}

