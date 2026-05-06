import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { SearchFilters, SearchResponse } from "../types";

export function useExplore() {
  return useMutation({
    mutationFn: (filters: SearchFilters) =>
      api.post("explore", { json: { filters } }).json<SearchResponse>(),
  });
}
