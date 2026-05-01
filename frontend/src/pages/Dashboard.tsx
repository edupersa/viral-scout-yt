import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { KeywordGenerator } from "../components/KeywordGenerator";
import { FilterPanel } from "../components/FilterPanel";
import { FilterModal } from "../components/FilterModal";
import { VideoGrid } from "../components/VideoGrid";
import { StatsCards } from "../components/ui/StatsCards";
import { useFilterStore } from "../stores/filterStore";
import type { SearchResponse } from "../api/types";

type Step = 1 | 2 | 3;

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
};

const MAX_VISIBLE_KEYWORDS = 4;

export default function Dashboard() {
  const [step, setStep] = useState<Step>(1);
  const [niche, setNiche] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const language = useFilterStore((s) => s.language);

  function handleKeywordsReady(resolvedNiche: string, keywords: string[]) {
    setNiche(resolvedNiche);
    setSelectedKeywords(keywords);
    setStep(2);
  }

  function handleResults(data: SearchResponse) {
    setResults(data);
    setStep(3);
  }

  function restart() {
    setStep(1);
    setNiche("");
    setSelectedKeywords([]);
    setResults(null);
  }

  const visibleKeywords = selectedKeywords.slice(0, MAX_VISIBLE_KEYWORDS);
  const hiddenCount = selectedKeywords.length - MAX_VISIBLE_KEYWORDS;

  return (
    <AppShell>
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {(["1. Keywords", "2. Filters", "3. Results"] as const).map((label, i) => {
          const s = (i + 1) as Step;
          return (
            <span key={label} className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full font-medium text-xs ${
                  step === s
                    ? "bg-red-600 text-white"
                    : step > s
                      ? "bg-zinc-700 text-zinc-300"
                      : "bg-zinc-800 text-zinc-600"
                }`}
              >
                {label}
              </span>
              {i < 2 && <span className="text-zinc-700">→</span>}
            </span>
          );
        })}
        {step > 1 && (
          <button
            onClick={restart}
            className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            Start over
          </button>
        )}
      </div>

      {/* Step 1: Keyword Generation */}
      {step === 1 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <KeywordGenerator onComplete={handleKeywordsReady} />
        </div>
      )}

      {/* Step 2: Filters + keyword summary */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Selected keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <FilterPanel
              niche={niche}
              selectedKeywords={selectedKeywords}
              onResults={handleResults}
            />
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-xl font-bold text-zinc-100">
            Resultados
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {results.total} videos
            </span>
          </h2>

          {/* Context bar: language · keywords  |  Filtros button */}
          <div className="flex items-center gap-2 flex-wrap">
            {language && (
              <>
                <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  {LANGUAGE_LABELS[language] ?? language.toUpperCase()}
                </span>
                <span className="text-zinc-600">·</span>
              </>
            )}
            {visibleKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-full border border-zinc-600 bg-zinc-800 text-xs text-zinc-300 max-w-40 truncate"
                title={kw}
              >
                {kw}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="px-2.5 py-1 rounded-full border border-zinc-600 bg-zinc-800 text-xs text-zinc-400">
                +{hiddenCount}
              </span>
            )}

            <button
              onClick={() => setFilterModalOpen(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-600 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0"
            >
              <SlidersHorizontal size={15} />
              Filtros
            </button>
          </div>

          <StatsCards data={results} />
          <VideoGrid videos={results.results} />
        </div>
      )}

      {/* Filter modal */}
      {filterModalOpen && (
        <FilterModal
          niche={niche}
          selectedKeywords={selectedKeywords}
          onResults={handleResults}
          onClose={() => setFilterModalOpen(false)}
        />
      )}
    </AppShell>
  );
}
