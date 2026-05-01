import { useState } from "react";
import { TrendingUp, Search } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { VideoGrid } from "../components/VideoGrid";
import { StatsCards } from "../components/ui/StatsCards";
import { Button } from "../components/ui/Button";
import { useExplore } from "../api/hooks/useExplore";
import { getApiErrorMessage } from "../lib/apiError";
import type { SearchResponse, Duration, DateRange } from "../api/types";

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

export default function Explore() {
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState<Duration | "">("");
  const [dateRange, setDateRange] = useState<DateRange | "">("");
  const [minSubs, setMinSubs] = useState(0);
  const [maxSubs, setMaxSubs] = useState(10_000_000);
  const [minViews, setMinViews] = useState(0);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: explore, isPending } = useExplore();

  async function handleExplore() {
    setError(null);
    try {
      const data = await explore({
        language: language || null,
        duration: (duration as Duration) || null,
        min_subs: minSubs,
        max_subs: maxSubs,
        min_views: minViews,
        date_range: (dateRange as DateRange) || null,
      });
      setResults(data);
    } catch (e) {
      setError(await getApiErrorMessage(e));
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={22} className="text-red-500" />
          <h1 className="text-2xl font-bold text-zinc-100">Explorar</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Descubre los videos más virales del momento sin necesidad de un nicho específico.
          Ajusta los filtros para ver qué está funcionando ahora mismo.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Filtros
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Idioma</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
            <label className="text-sm font-medium text-zinc-300">Duración</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as Duration | "")}
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
            <label className="text-sm font-medium text-zinc-300">Publicación</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange | "")}
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
            Suscriptores:{" "}
            <span className="text-zinc-400 font-normal">
              {minSubs.toLocaleString()} – {maxSubs.toLocaleString()}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-500">Mínimo</span>
              <input
                type="number"
                min={0}
                value={minSubs}
                onChange={(e) => setMinSubs(Number(e.target.value))}
                className={selectClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-500">Máximo</span>
              <input
                type="number"
                min={0}
                value={maxSubs}
                onChange={(e) => setMaxSubs(Number(e.target.value))}
                className={selectClass}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            Visitas mínimas:{" "}
            <span className="text-zinc-400 font-normal">{minViews.toLocaleString()}</span>
          </label>
          <input
            type="number"
            min={0}
            value={minViews}
            onChange={(e) => setMinViews(Number(e.target.value))}
            className={selectClass}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button onClick={handleExplore} isLoading={isPending} size="md">
          <Search size={15} className="mr-2" aria-hidden="true" />
          Explorar videos virales
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold text-zinc-100">
            Resultados
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {results.total} videos
            </span>
          </h2>
          <StatsCards data={results} />
          <VideoGrid videos={results.results} />
        </div>
      )}
    </AppShell>
  );
}
