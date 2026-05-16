import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios.js";

const RATINGS_KEY = "ratings";

export function useSubmissionRatings(submissionId) {
  return useQuery({
    queryKey: [RATINGS_KEY, "submission", { submissionId }],
    queryFn: async () => {
      const res = await api.get(`/ratings/submission/${submissionId}`);
      return res.data.data;
    },
    enabled: Boolean(submissionId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserRating(userId, submissionId) {
  return useQuery({
    queryKey: [RATINGS_KEY, "user", { userId, submissionId }],
    queryFn: async () => {
      const res = await api.get(
        `/ratings/user/${userId}/submission/${submissionId}`
      );
      return res.data.data;
    },
    enabled: Boolean(userId && submissionId),
    staleTime: 2 * 60 * 1000,
  });
}

