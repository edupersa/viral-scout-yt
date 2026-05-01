import { useState } from "react";
import { SlidersHorizontal, AlertCircle, Mail } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { KeywordGenerator } from "../components/KeywordGenerator";
import { FilterPanel } from "../components/FilterPanel";
import { FilterModal } from "../components/FilterModal";
import { VideoGrid } from "../components/VideoGrid";
import { StatsCards } from "../components/ui/StatsCards";
import { useFilterStore } from "../stores/filterStore";
import { useCurrentUser } from "../api/hooks/useAuth";
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
  const { data: currentUser } = useCurrentUser();

  const searchesUsed = currentUser?.searches_used ?? 0;
  const searchLimit = currentUser?.search_limit ?? 5;
  const searchesRemaining = Math.max(0, searchLimit - searchesUsed);
  const isBlocked = searchesUsed >= searchLimit;

  function handleKeywordsReady(resolvedNiche: string, keywords: string[], language: string) {
    setNiche(resolvedNiche);
    setSelectedKeywords(keywords);
    useFilterStore.getState().setFilter("language", language);
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

  const quotaBadgeColor =
    searchesRemaining === 0
      ? "bg-red-500/15 text-red-400 border-red-800"
      : searchesRemaining <= 2
        ? "bg-amber-500/15 text-amber-400 border-amber-800"
        : "bg-zinc-800 text-zinc-400 border-zinc-700";

  return (
    <AppShell>
      {/* Stepper + quota badge */}
      <div className="flex items-center gap-2 mb-8 text-sm flex-wrap">
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

        {/* Quota badge */}
        {currentUser && (
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border ${quotaBadgeColor}`}
          >
            {searchesRemaining}/{searchLimit} búsquedas restantes
          </span>
        )}

        {step > 1 && (
          <button
            onClick={restart}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            Start over
          </button>
        )}
      </div>

      {/* Blocked banner — shown in all steps when limit is reached */}
      {isBlocked && step < 3 && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-900/20 p-5 flex gap-4 items-start">
          <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-300">
              Límite de búsquedas alcanzado
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Has utilizado las {searchLimit} búsquedas gratuitas. Contacta al
              administrador para ampliar tu acceso o esperar a que te lo reactiven.
            </p>
          </div>
          <a
            href="mailto:leperazas@gmail.com"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-700 text-xs text-red-300 hover:bg-red-800/30 transition-colors"
          >
            <Mail size={13} />
            Contactar
          </a>
        </div>
      )}

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
