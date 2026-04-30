import { TrendingUp, Video, Zap, BarChart2 } from "lucide-react";
import type { SearchResponse } from "../../api/types";
import { formatViews } from "../../lib/format";

interface StatsCardsProps {
  data: SearchResponse;
}

export function StatsCards({ data }: StatsCardsProps) {
  const { results, total, quota_used } = data;

  const maxOutlier = results.reduce(
    (max, v) => (v.outlier_score > max ? v.outlier_score : max),
    0,
  );
  const avgOutlier =
    results.length > 0
      ? results.reduce((sum, v) => sum + v.outlier_score, 0) / results.length
      : 0;
  const mostViralVideo = results.reduce(
    (best, v) => (v.views > (best?.views ?? 0) ? v : best),
    results[0],
  );

  const cards = [
    {
      label: "Videos Found",
      value: total.toString(),
      sub: `${quota_used} API units used`,
      icon: Video,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Avg Outlier Score",
      value: `${avgOutlier.toFixed(1)}x`,
      sub: "vs channel average",
      icon: BarChart2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Most Views",
      value: mostViralVideo ? formatViews(mostViralVideo.views) : "—",
      sub: mostViralVideo ? `${mostViralVideo.title.slice(0, 30)}…` : "—",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Max Outlier",
      value: `${maxOutlier.toFixed(1)}x`,
      sub: "highest viral score",
      icon: Zap,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col gap-3"
          >
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
              <Icon size={16} className={card.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{card.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-zinc-600 mt-1 truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
