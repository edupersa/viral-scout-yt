import { clsx } from "clsx";
import type { ViralityClass } from "../../api/types";
import { scoreToPercent } from "../../lib/format";

interface OutlierBadgeProps {
  score: number;
  viralityClass: ViralityClass;
  showBar?: boolean;
}

export function OutlierBadge({ score, viralityClass, showBar = false }: OutlierBadgeProps) {
  const isUltra = viralityClass === "ultra_viral";
  const isVery = viralityClass === "very_viral";

  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <span
        className={clsx(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold w-fit",
          isUltra && "bg-red-500/15 text-red-400",
          isVery && "bg-amber-500/15 text-amber-400",
          !isUltra && !isVery && "bg-emerald-500/15 text-emerald-400",
        )}
      >
        {score.toFixed(1)}x
      </span>
      {showBar && (
        <div className="w-full h-1 rounded-full bg-zinc-800">
          <div
            className={clsx(
              "h-1 rounded-full transition-all",
              isUltra && "bg-red-500",
              isVery && "bg-amber-500",
              !isUltra && !isVery && "bg-emerald-500",
            )}
            style={{ width: `${scoreToPercent(score)}%` }}
          />
        </div>
      )}
    </div>
  );
}
