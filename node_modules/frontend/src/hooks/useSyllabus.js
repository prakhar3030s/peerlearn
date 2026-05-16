import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios.js";

const SYLLABUS_KEY = "syllabus";

export function useBranches() {
  return useQuery({
    queryKey: [SYLLABUS_KEY, "branches"],
    queryFn: async () => {
      const res = await api.get("/syllabus/branches");
      return res.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubjectsByBranch(branchId, year) {
  return useQuery({
    queryKey: [SYLLABUS_KEY, "subjects", { branchId, year }],
    queryFn: async () => {
      const params = {};
      if (year) params.year = year;
      const res = await api.get(`/syllabus/branches/${branchId}/subjects`, {
        params,
      });
      return res.data.data || [];
    },
    enabled: Boolean(branchId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUnitsBySubject(subjectId) {
  return useQuery({
    queryKey: [SYLLABUS_KEY, "units", { subjectId }],
    queryFn: async () => {
      const res = await api.get(`/syllabus/subjects/${subjectId}/units`);
      return res.data.data || [];
    },
    enabled: Boolean(subjectId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTopicsByUnit(unitId) {
  return useQuery({
    queryKey: [SYLLABUS_KEY, "topics", { unitId }],
    queryFn: async () => {
      const res = await api.get(`/syllabus/units/${unitId}/topics`);
      return res.data.data || [];
    },
    enabled: Boolean(unitId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTopic(topicId) {
  return useQuery({
    queryKey: [SYLLABUS_KEY, "topic", { topicId }],
    queryFn: async () => {
      const res = await api.get(`/syllabus/topics/${topicId}`);
      return res.data.data;
    },
    enabled: Boolean(topicId),
    staleTime: 10 * 60 * 1000,
  });
}

