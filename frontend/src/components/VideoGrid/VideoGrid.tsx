import type { VideoResult } from "../../api/types";
import { VideoCard } from "./VideoCard";
import { useVideoSort } from "../../hooks/useVideoSort";
import type { SortKey } from "../../hooks/useVideoSort";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "outlier_score", label: "Outlier" },
  { key: "views", label: "Views" },
  { key: "subs", label: "Subs" },
  { key: "published_at", label: "Recent" },
];

interface VideoGridProps {
  videos: VideoResult[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  const { sorted, sortBy, sortDir, handleSort } = useVideoSort(videos);

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
        <p className="text-zinc-500">No videos found. Try different keywords or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-500">Sort by:</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              sortBy === key
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            {label}
            {sortBy === key && (
              <span className="ml-1 opacity-80">{sortDir === "desc" ? "↓" : "↑"}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((video, idx) => (
          <VideoCard key={video.youtube_id} video={video} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}
