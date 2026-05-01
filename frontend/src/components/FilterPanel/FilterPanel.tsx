import { useState } from "react";
import { Search } from "lucide-react";
import { useFilterStore } from "../../stores/filterStore";
import { useSearch } from "../../api/hooks/useSearch";
import { getApiErrorMessage } from "../../lib/apiError";
import { Button } from "../ui/Button";
import type { SearchResponse, DateRange } from "../../api/types";

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

const DATE_RANGES: { value: DateRange | ""; label: string }[] = [
  { value: "", label: "Any time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last year" },
];

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-700";

const selectClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors";

function UnlimitedCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-red-500 w-3.5 h-3.5 cursor-pointer"
      />
      Sin límite
    </label>
  );
}

export function FilterPanel({ niche, selectedKeywords, onResults }: FilterPanelProps) {
  const {
    language,
    minDuration, maxDuration, maxDurationLimited,
    minSubs, maxSubs, maxSubsLimited,
    minViews, maxViews, maxViewsLimited,
    dateRange, setFilter,
  } = useFilterStore();
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
          min_duration: minDuration * 60,
          max_duration: maxDurationLimited ? maxDuration * 60 : null,
          min_subs: minSubs,
          max_subs: maxSubsLimited ? maxSubs : null,
          min_views: minViews,
          max_views: maxViewsLimited ? maxViews : null,
          date_range: (dateRange as DateRange) || null,
        },
      });
      onResults(result);
    } catch (e) {
      setSearchError(await getApiErrorMessage(e));
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Language</label>
          <select
            value={language}
            onChange={(e) => setFilter("language", e.target.value)}
            className={selectClass}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
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
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">
          Duración:{" "}
          <span className="text-zinc-400 font-normal">
            {minDuration} min –{" "}
            {maxDurationLimited ? `${maxDuration} min` : "Sin límite"}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">Mínimo (min)</span>
            <input
              type="number"
              min={0}
              value={minDuration}
              onChange={(e) => setFilter("minDuration", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Máximo (min)</span>
              <UnlimitedCheckbox
                checked={!maxDurationLimited}
                onChange={(v) => setFilter("maxDurationLimited", !v)}
              />
            </div>
            <input
              type="number"
              min={0}
              value={maxDuration}
              disabled={!maxDurationLimited}
              onChange={(e) => setFilter("maxDuration", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Subscribers */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">
          Suscriptores:{" "}
          <span className="text-zinc-400 font-normal">
            {minSubs.toLocaleString()} –{" "}
            {maxSubsLimited ? maxSubs.toLocaleString() : "Sin límite"}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">Mínimo</span>
            <input
              type="number"
              min={0}
              value={minSubs}
              onChange={(e) => setFilter("minSubs", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Máximo</span>
              <UnlimitedCheckbox
                checked={!maxSubsLimited}
                onChange={(v) => setFilter("maxSubsLimited", !v)}
              />
            </div>
            <input
              type="number"
              min={0}
              value={maxSubs}
              disabled={!maxSubsLimited}
              onChange={(e) => setFilter("maxSubs", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Views */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">
          Visitas:{" "}
          <span className="text-zinc-400 font-normal">
            {minViews.toLocaleString()} –{" "}
            {maxViewsLimited ? maxViews.toLocaleString() : "Sin límite"}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">Mínimo</span>
            <input
              type="number"
              min={0}
              value={minViews}
              onChange={(e) => setFilter("minViews", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Máximo</span>
              <UnlimitedCheckbox
                checked={!maxViewsLimited}
                onChange={(v) => setFilter("maxViewsLimited", !v)}
              />
            </div>
            <input
              type="number"
              min={0}
              value={maxViews}
              disabled={!maxViewsLimited}
              onChange={(e) => setFilter("maxViews", Number(e.target.value))}
              className={inputClass}
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
