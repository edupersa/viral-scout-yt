import { useState } from "react";
import { Search } from "lucide-react";
import { useFilterStore } from "../../stores/filterStore";
import { useSearch } from "../../api/hooks/useSearch";
import { Button } from "../ui/Button";
import type { SearchResponse, Duration, DateRange } from "../../api/types";

interface FilterPanelProps {
  niche: string;
  selectedKeywords: string[];
  onResults: (data: SearchResponse) => void;
}

const LANGUAGES = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

const DURATIONS: { value: Duration | ""; label: string }[] = [
  { value: "", label: "Any duration" },
  { value: "short", label: "Short (< 4 min)" },
  { value: "medium", label: "Medium (4–20 min)" },
  { value: "long", label: "Long (> 20 min)" },
];

const DATE_RANGES: { value: DateRange | ""; label: string }[] = [
  { value: "", label: "Any time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last year" },
];

const selectClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors";

export function FilterPanel({ niche, selectedKeywords, onResults }: FilterPanelProps) {
  const { language, duration, minSubs, maxSubs, dateRange, setFilter } = useFilterStore();
  const { mutateAsync: searchVideos, isPending } = useSearch();
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSearch() {
    setSearchError(null);
    try {
      const result = await searchVideos({
        niche,
        keywords: selectedKeywords,
        filters: {
          language: language || null,
          duration: (duration as Duration) || null,
          min_subs: minSubs,
          max_subs: maxSubs,
          date_range: (dateRange as DateRange) || null,
        },
      });
      onResults(result);
    } catch {
      setSearchError("Search failed. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Configure Filters</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Narrow down results by language, duration, and channel size.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Language</label>
          <select
            value={language}
            onChange={(e) => setFilter("language", e.target.value)}
            className={selectClass}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Duration</label>
          <select
            value={duration}
            onChange={(e) => setFilter("duration", e.target.value as Duration | "")}
            className={selectClass}
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setFilter("dateRange", e.target.value as DateRange | "")}
            className={selectClass}
          >
            {DATE_RANGES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-300">
          Subscriber Range:{" "}
          <span className="text-zinc-400 font-normal">
            {minSubs.toLocaleString()} – {maxSubs.toLocaleString()}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">Minimum</span>
            <input
              type="number"
              min={0}
              value={minSubs}
              onChange={(e) => setFilter("minSubs", Number(e.target.value))}
              className={selectClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">Maximum</span>
            <input
              type="number"
              min={0}
              value={maxSubs}
              onChange={(e) => setFilter("maxSubs", Number(e.target.value))}
              className={selectClass}
            />
          </div>
        </div>
      </div>

      {searchError && <p className="text-sm text-red-400">{searchError}</p>}

      <Button onClick={handleSearch} isLoading={isPending} size="md">
        <Search size={15} className="mr-2" aria-hidden="true" />
        Search Videos
      </Button>
    </div>
  );
}
