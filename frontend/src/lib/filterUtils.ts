import type { SearchFilters, Duration, DateRange } from "../api/types";

export interface FilterValues {
  language: string;
  duration: string;
  minDuration: number;
  maxDuration: number;
  maxDurationLimited: boolean;
  minSubs: number;
  maxSubs: number;
  maxSubsLimited: boolean;
  minViews: number;
  maxViews: number;
  maxViewsLimited: boolean;
  dateRange: string;
}

export function buildFilterPayload(f: FilterValues): SearchFilters {
  return {
    language: f.language || null,
    duration: (f.duration as Duration) || null,
    min_duration: f.minDuration * 60,
    max_duration: f.maxDurationLimited ? f.maxDuration * 60 : null,
    min_subs: f.minSubs,
    max_subs: f.maxSubsLimited ? f.maxSubs : null,
    min_views: f.minViews,
    max_views: f.maxViewsLimited ? f.maxViews : null,
    date_range: (f.dateRange as DateRange) || null,
  };
}
