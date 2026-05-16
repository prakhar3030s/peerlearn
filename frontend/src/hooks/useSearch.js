import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "../lib/axios.js";

const SEARCH_KEY = "search";

export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function useSearch(params = {}) {
  const debounced = useDebouncedValue(params.q || "", 400);

  return useQuery({
    queryKey: [SEARCH_KEY, { ...params, q: debounced }],
    queryFn: async () => {
      const res = await api.get("/search", {
        params: { ...params, q: debounced },
      });
      return res.data;
    },
    enabled: debounced && debounced.length >= 2,
    staleTime: 30 * 1000,
  });
}

