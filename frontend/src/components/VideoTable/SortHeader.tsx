import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

interface SortHeaderProps {
  label: string;
  sortKey: string;
  currentKey: string;
  direction: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export function SortHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  className,
}: SortHeaderProps) {
  const isActive = sortKey === currentKey;

  return (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap ${className ?? ""}`}
    >
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded"
        aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        {isActive ? (
          direction === "desc" ? (
            <ChevronDown size={12} aria-hidden="true" />
          ) : (
            <ChevronUp size={12} aria-hidden="true" />
          )
        ) : (
          <ChevronsUpDown size={12} className="opacity-40" aria-hidden="true" />
        )}
      </button>
    </th>
  );
}
