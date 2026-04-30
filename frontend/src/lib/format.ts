export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatSubs(n: number): string {
  return formatViews(n);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function scoreToPercent(score: number, maxScore = 20): number {
  return Math.min((score / maxScore) * 100, 100);
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2_592_000) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 31_536_000) return `${Math.floor(seconds / 2_592_000)} months ago`;
  return `${Math.floor(seconds / 31_536_000)} years ago`;
}

export function computeViewsPerHour(views: number, publishedAt: string): number {
  const hours = Math.max(1, (Date.now() - new Date(publishedAt).getTime()) / 3_600_000);
  return views / hours;
}

export function formatViewsPerHour(vph: number): string {
  if (vph >= 1_000_000) return `${(vph / 1_000_000).toFixed(1)}M/h`;
  if (vph >= 1_000) return `${(vph / 1_000).toFixed(1)}K/h`;
  return `${Math.round(vph)}/h`;
}
