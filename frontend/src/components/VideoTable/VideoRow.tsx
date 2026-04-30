import type { VideoResult } from "../../api/types";
import { OutlierBadge } from "../ui/OutlierBadge";
import { formatViews, formatSubs, formatDuration, formatDate } from "../../lib/format";
import { ExternalLink } from "lucide-react";

interface VideoRowProps {
  video: VideoResult;
  rank: number;
}

export function VideoRow({ video, rank }: VideoRowProps) {
  return (
    <tr className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors group">
      <td className="px-3 py-3 text-xs text-zinc-600 font-mono w-8">{rank}</td>
      <td className="px-3 py-3">
        <div className="flex items-start gap-3 max-w-md">
          {video.thumbnail_url && (
            <img
              src={video.thumbnail_url}
              alt=""
              className="w-16 h-10 object-cover rounded shrink-0 bg-zinc-800"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <a
              href={`https://youtube.com/watch?v=${video.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-100 hover:text-red-400 transition-colors line-clamp-2 font-medium leading-snug"
            >
              {video.title}
            </a>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
              {video.channel_name}
              <ExternalLink size={10} aria-hidden="true" />
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-zinc-300 text-right whitespace-nowrap">
        {formatViews(video.views)}
      </td>
      <td className="px-3 py-3">
        <OutlierBadge
          score={video.outlier_score}
          viralityClass={video.virality_class}
          showBar
        />
      </td>
      <td className="px-3 py-3 text-sm text-zinc-400 text-right whitespace-nowrap">
        {formatSubs(video.subs)}
      </td>
      <td className="px-3 py-3 text-sm text-zinc-500 whitespace-nowrap">
        {formatDuration(video.duration_seconds)}
      </td>
      <td className="px-3 py-3 text-xs text-zinc-500 uppercase tracking-wide">
        {video.language ?? "—"}
      </td>
      <td className="px-3 py-3 text-xs text-zinc-600 whitespace-nowrap">
        {formatDate(video.published_at)}
      </td>
    </tr>
  );
}
