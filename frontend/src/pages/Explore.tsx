import { useState } from "react";
import { TrendingUp, Search } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { VideoGrid } from "../components/VideoGrid";
import { StatsCards } from "../components/ui/StatsCards";
import { Button } from "../components/ui/Button";
import { SelectField } from "../components/ui/SelectField";
import { RangeInput } from "../components/ui/RangeInput";
import { SectionLabel } from "../components/ui/SectionLabel";
import { useExplore } from "../api/hooks/useExplore";
import { useFilterStore } from "../stores/filterStore";
import { LANGUAGES, DURATIONS, DATE_RANGES } from "../lib/constants";
import { buildFilterPayload } from "../lib/filterUtils";
import { getApiErrorMessage } from "../lib/apiError";
import type { SearchResponse } from "../api/types";

export default function Explore() {
  const {
    language, duration, dateRange,
    minDuration, maxDuration, maxDurationLimited,
    minSubs, maxSubs, maxSubsLimited,
    minViews, maxViews, maxViewsLimited,
    setFilter,
  } = useFilterStore();

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: explore, isPending } = useExplore();

  async function handleExplore() {
    setError(null);
    try {
      const data = await explore(
        buildFilterPayload({
          language, duration, dateRange,
          minDuration, maxDuration, maxDurationLimited,
          minSubs, maxSubs, maxSubsLimited,
          minViews, maxViews, maxViewsLimited,
        }),
      );
      setResults(data);
    } catch (e) {
      setError(await getApiErrorMessage(e));
    }
  }

  return (
    <AppShell>
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

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Filtros</h2>

        <SectionLabel>Filtros YouTube · pre-request</SectionLabel>
        <p className="text-xs text-zinc-500 -mt-2">
          Se envían a YouTube al pedir los videos. Solo el idioma aplica como pre-filtro en Explorar.
        </p>

        <SelectField
          label="Idioma / Región"
          value={language}
          onChange={(v) => setFilter("language", v)}
          options={LANGUAGES}
          className="max-w-sm"
        />

        <SectionLabel>Filtros ViralScout · sobre resultados</SectionLabel>
        <p className="text-xs text-zinc-500 -mt-2">
          Se aplican a los videos recibidos de YouTube. Iteramos páginas hasta encontrar {50} resultados.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Categoría de duración"
            value={duration}
            onChange={(v) => setFilter("duration", v as typeof duration)}
            options={DURATIONS}
          />
          <SelectField
            label="Fecha de publicación"
            value={dateRange}
            onChange={(v) => setFilter("dateRange", v as typeof dateRange)}
            options={DATE_RANGES}
          />
        </div>

        <RangeInput
          label="Duración exacta"
          minLabel="Mínimo (min)"
          maxLabel="Máximo (min)"
          minValue={minDuration}
          maxValue={maxDuration}
          maxLimited={maxDurationLimited}
          onMinChange={(v) => setFilter("minDuration", v)}
          onMaxChange={(v) => setFilter("maxDuration", v)}
          onMaxLimitedChange={(v) => setFilter("maxDurationLimited", v)}
          formatValue={(v) => `${v} min`}
        />

        <RangeInput
          label="Suscriptores"
          minValue={minSubs}
          maxValue={maxSubs}
          maxLimited={maxSubsLimited}
          onMinChange={(v) => setFilter("minSubs", v)}
          onMaxChange={(v) => setFilter("maxSubs", v)}
          onMaxLimitedChange={(v) => setFilter("maxSubsLimited", v)}
          formatValue={(v) => v.toLocaleString()}
        />

        <RangeInput
          label="Visitas"
          minValue={minViews}
          maxValue={maxViews}
          maxLimited={maxViewsLimited}
          onMinChange={(v) => setFilter("minViews", v)}
          onMaxChange={(v) => setFilter("maxViews", v)}
          onMaxLimitedChange={(v) => setFilter("maxViewsLimited", v)}
          formatValue={(v) => v.toLocaleString()}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button onClick={handleExplore} isLoading={isPending} size="md">
          <Search size={15} className="mr-2" aria-hidden="true" />
          Explorar videos virales
        </Button>
      </div>

      {results && results.total === 0 && (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-zinc-300 font-medium mb-1">Sin resultados con estos filtros</p>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Se iteraron todas las páginas disponibles de YouTube sin alcanzar 50 resultados.
            Prueba ampliando los filtros ViralScout: sube el mínimo de suscriptores, cambia la
            categoría de duración a "Cualquiera" o elimina el filtro de fecha.
          </p>
        </div>
      )}

      {results && results.total > 0 && (
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
