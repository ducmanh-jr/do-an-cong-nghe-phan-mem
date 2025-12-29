import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useStats(limit?: number) {
  return useQuery({
    queryKey: [api.stats.list.path, limit],
    queryFn: async () => {
      const url = limit 
        ? `${api.stats.list.path}?limit=${limit}` 
        : api.stats.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      
      return api.stats.list.responses[200].parse(await res.json());
    },
  });
}

export function useSeedStats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.stats.seed.path, {
        method: api.stats.seed.method,
      });
      if (!res.ok) throw new Error("Failed to seed stats");
      return api.stats.seed.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stats.list.path] });
    },
  });
}
