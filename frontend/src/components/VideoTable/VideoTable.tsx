import type { VideoResult } from "../../api/types";
import { SortHeader } from "./SortHeader";
import { VideoRow } from "./VideoRow";
import { useVideoSort } from "../../hooks/useVideoSort";

interface VideoTableProps {
  videos: VideoResult[];
}

export function VideoTable({ videos }: VideoTableProps) {
  const { sorted, sortBy, sortDir, handleSort } = useVideoSort(videos);

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
        <p className="text-zinc-500">No videos found. Try different keywords or filters.</p>
      </div>
    );
  }

  const sortProps = { currentKey: sortBy, direction: sortDir, onSort: handleSort };

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full bg-zinc-900/50 text-sm">
          <thead>
            <tr className="bg-zinc-900">
              <th scope="col" className="px-3 py-3 w-8" />
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Video
              </th>
              <SortHeader label="Views" sortKey="views" {...sortProps} />
              <SortHeader label="Outlier" sortKey="outlier_score" {...sortProps} />
              <SortHeader label="Subs" sortKey="subs" {...sortProps} />
              <SortHeader label="Duration" sortKey="duration_seconds" {...sortProps} />
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Lang
              </th>
              <SortHeader label="Published" sortKey="published_at" {...sortProps} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((video, idx) => (
              <VideoRow key={video.youtube_id} video={video} rank={idx + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
