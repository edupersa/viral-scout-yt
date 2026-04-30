import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { SearchHistoryResponse } from "../types";

export function useSearchHistory(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["search", "history", limit, offset],
    queryFn: () =>
      api
        .get("search/history", { searchParams: { limit, offset } })
        .json<SearchHistoryResponse>(),
  });
}
