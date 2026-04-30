import { clsx } from "clsx";
import { X } from "lucide-react";

interface KeywordPillProps {
  keyword: string;
  selected: boolean;
  onToggle: (keyword: string) => void;
}

export function KeywordPill({ keyword, selected, onToggle }: KeywordPillProps) {
  return (
    <button
      onClick={() => onToggle(keyword)}
      aria-pressed={selected}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none",
        selected
          ? "bg-red-600 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700",
      )}
    >
      {keyword}
      {selected && <X size={12} aria-hidden="true" />}
    </button>
  );
}
