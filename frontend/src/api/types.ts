export interface UserResponse {
  id: number;
  email: string;
  is_active: boolean;
  searches_used: number;
  search_limit: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface KeywordResponse {
  keywords: string[];
  niche: string;
}

export type Duration = "short" | "medium" | "long";
export type DateRange = "7d" | "30d" | "90d" | "365d";
export type ViralityClass = "ultra_viral" | "very_viral" | "normal";

export interface SearchFilters {
  language: string | null;
  duration: Duration | null;   // YouTube API pre-filter (short/medium/long)
  min_duration: number;        // seconds, app-level post-filter
  max_duration: number | null; // seconds, null = no limit
  min_subs: number;
  max_subs: number | null;
  min_views: number;
  max_views: number | null;
  date_range: DateRange | null;
}

export interface SearchRequest {
  niche: string;
  keywords: string[];
  filters: SearchFilters;
}

export interface VideoResult {
  id: number;
  youtube_id: string;
  title: string;
  channel_name: string;
  channel_id: string;
  views: number;
  subs: number;
  outlier_score: number;
  virality_class: ViralityClass;
  duration_seconds: number;
  language: string | null;
  published_at: string;
  thumbnail_url: string;
}

export interface SearchResponse {
  results: VideoResult[];
  total: number;
  quota_used: number;
}

export interface SearchHistoryItem {
  id: number;
  niche: string;
  keywords: string[];
  filters: Record<string, unknown>;
  quota_used: number;
  created_at: string;
  video_count: number;
}

export interface SearchHistoryResponse {
  items: SearchHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}
