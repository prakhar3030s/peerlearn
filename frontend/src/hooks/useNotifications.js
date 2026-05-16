import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios.js";

const NOTIFICATIONS_KEY = "notifications";

export function useNotifications(userId) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, { userId }],
    queryFn: async () => {
      const res = await api.get(`/notifications/${userId}`);
      return res.data.data || [];
    },
    enabled: Boolean(userId),
    refetchInterval: 30 * 1000,
  });
}

export function useMarkAllRead(userId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/notifications/${userId}/read-all`);
      return res.data.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, { userId }] });
    },
  });
}

export function useMarkRead(notificationId, userId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      return res.data.data;
    },
    onSuccess: () => {
      if (userId) {
        client.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, { userId }] });
      }
    },
  });
}

