import { useState, useMemo, useCallback } from "react";
import type { VideoResult } from "../api/types";

export type SortKey = "views" | "outlier_score" | "subs" | "published_at" | "duration_seconds";

export function useVideoSort(videos: VideoResult[], initialKey: SortKey = "outlier_score") {
  const [sortBy, setSortBy] = useState<SortKey>(initialKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...videos].sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      const aVal = sortBy === "published_at" ? new Date(a[sortBy]).getTime() : a[sortBy];
      const bVal = sortBy === "published_at" ? new Date(b[sortBy]).getTime() : b[sortBy];
      return (aVal - bVal) * mul;
    });
  }, [videos, sortBy, sortDir]);

  const handleSort = useCallback(
    (key: SortKey | string) => {
      const k = key as SortKey;
      if (k === sortBy) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortBy(k);
        setSortDir("desc");
      }
    },
    [sortBy],
  );

  return { sorted, sortBy, sortDir, handleSort };
}
