import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import type { SearchRequest, SearchResponse } from "../types";

export function useSearch() {
  return useMutation({
    mutationFn: (req: SearchRequest) =>
      api.post("search", { json: req }).json<SearchResponse>(),
  });
}
