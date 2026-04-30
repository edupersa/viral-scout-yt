import { useState } from "react";
import { Eye, TrendingUp, Gem, ChevronRight, BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import type { VideoResult } from "../../api/types";
import {
  formatViews,
  formatSubs,
  formatDuration,
  formatDate,
  timeAgo,
  computeViewsPerHour,
  formatViewsPerHour,
} from "../../lib/format";

interface VideoCardProps {
  video: VideoResult;
  rank: number;
}

export function VideoCard({ video, rank }: VideoCardProps) {
  const [expanded, setExpanded] = useState(false);

  const vph = computeViewsPerHour(video.views, video.published_at);

  const outlierColor =
    video.virality_class === "ultra_viral"
      ? "text-red-400 bg-red-500/15"
      : video.virality_class === "very_viral"
        ? "text-amber-400 bg-amber-500/15"
        : "text-emerald-400 bg-emerald-500/15";

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800 overflow-hidden flex flex-col hover:border-zinc-500 transition-colors">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-zinc-900 shrink-0">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {formatDuration(video.duration_seconds)}
        </span>
        <span className="absolute top-2 left-2 bg-black/70 text-zinc-300 text-xs px-1.5 py-0.5 rounded font-mono">
          #{rank}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <a
          href={`https://youtube.com/watch?v=${video.youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-zinc-100 hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
        >
          {video.title}
        </a>

        {/* Channel + subs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5 min-w-0">
            <a
              href={`https://youtube.com/channel/${video.channel_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 truncate transition-colors"
            >
              {video.channel_name}
            </a>
            <ChevronRight size={12} className="text-blue-400 shrink-0" />
          </div>
          <span className="text-xs text-zinc-400 whitespace-nowrap shrink-0">
            {formatSubs(video.subs)} subs
          </span>
        </div>

        {/* Views + time ago */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Eye size={13} className="text-zinc-400 shrink-0" />
          <span>{formatViews(video.views)}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">{timeAgo(video.published_at)}</span>
        </div>

        {/* Metric badges */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-700 text-xs text-zinc-300 font-medium">
            <TrendingUp size={11} />
            {formatViewsPerHour(vph)}
          </span>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${outlierColor}`}
          >
            <Gem size={11} />
            {video.outlier_score.toFixed(1)}x
          </span>
        </div>

        {/* Stats toggle button */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-auto flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-zinc-600 text-xs text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <BarChart2 size={13} />
          Ver Estadísticas Avanzadas
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Expanded stats */}
        {expanded && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-zinc-700">
            <StatItem label="Duración" value={formatDuration(video.duration_seconds)} />
            <StatItem label="Idioma" value={video.language?.toUpperCase() ?? "—"} />
            <StatItem label="Publicado" value={formatDate(video.published_at)} />
            <StatItem label="Suscriptores" value={formatSubs(video.subs)} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-xs text-zinc-200 font-medium">{value}</p>
    </div>
  );
}
