import { useState } from "react";
import { Search } from "lucide-react";
import { useFilterStore } from "../../stores/filterStore";
import { useSearch } from "../../api/hooks/useSearch";
import { getApiErrorMessage } from "../../lib/apiError";
import { LANGUAGES, DURATIONS, DATE_RANGES } from "../../lib/constants";
import { buildFilterPayload } from "../../lib/filterUtils";
import { Button } from "../ui/Button";
import { SelectField } from "../ui/SelectField";
import { RangeInput } from "../ui/RangeInput";
import { SectionLabel } from "../ui/SectionLabel";
import type { SearchResponse } from "../../api/types";

interface FilterPanelProps {
  niche: string;
  selectedKeywords: string[];
  onResults: (data: SearchResponse) => void;
}

export function FilterPanel({ niche, selectedKeywords, onResults }: FilterPanelProps) {
  const {
    language, duration, dateRange,
    minDuration, maxDuration, maxDurationLimited,
    minSubs, maxSubs, maxSubsLimited,
    minViews, maxViews, maxViewsLimited,
    setFilter,
  } = useFilterStore();

  const { mutateAsync: searchVideos, isPending } = useSearch();
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSearch() {
    setSearchError(null);
    try {
      const result = await searchVideos({
        niche,
        keywords: selectedKeywords,
        filters: buildFilterPayload({
          language, duration, dateRange,
          minDuration, maxDuration, maxDurationLimited,
          minSubs, maxSubs, maxSubsLimited,
          minViews, maxViews, maxViewsLimited,
        }),
      });
      onResults(result);
    } catch (e) {
      setSearchError(await getApiErrorMessage(e));
    }
  }

  return (
    <div className="space-y-5">
      <SectionLabel>Filtros YouTube · pre-búsqueda</SectionLabel>
      <p className="text-xs text-zinc-500 -mt-2">
        Se envían a YouTube antes de recibir resultados. Reducen el pool de videos al origen.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField
          label="Idioma"
          value={language}
          onChange={(v) => setFilter("language", v)}
          options={LANGUAGES}
        />
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

      <SectionLabel>Filtros ViralScout · sobre resultados</SectionLabel>
      <p className="text-xs text-zinc-500 -mt-2">
        Se aplican a los videos ya recibidos. Permiten rangos exactos que YouTube no soporta.
      </p>

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

      {searchError && <p className="text-sm text-red-400">{searchError}</p>}

      <Button onClick={handleSearch} isLoading={isPending} size="md">
        <Search size={15} className="mr-2" aria-hidden="true" />
        Search Videos
      </Button>
    </div>
  );
}
