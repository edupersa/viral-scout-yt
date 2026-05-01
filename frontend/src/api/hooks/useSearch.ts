import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { SearchRequest, SearchResponse } from "../types";

export function useSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SearchRequest) =>
      api.post("search", { json: req }).json<SearchResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
