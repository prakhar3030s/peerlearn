import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios.js";

/**
 * When implementing the Browse page with a topic sidebar: use this hook for each
 * topic row and attach onMouseEnter/onMouseLeave. After 300ms hover, the topic's
 * submissions are prefetched so the topic page feels instant when clicked.
 *
 * Usage:
 *   const { onMouseEnter, onMouseLeave } = useTopicPrefetch(topicId);
 *   <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>...</div>
 */
export function useTopicPrefetch(topicId) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef(null);

  const onMouseEnter = useCallback(() => {
    if (!topicId) return;
    timeoutRef.current = window.setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ["submissions", "list", { topicId, status: "approved" }],
        queryFn: async () => {
          const res = await api.get("/submissions", {
            params: { topicId, status: "approved", limit: 20 },
          });
          return res.data;
        },
        staleTime: 2 * 60 * 1000,
      });
    }, 300);
  }, [topicId, queryClient]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { onMouseEnter, onMouseLeave };
}
