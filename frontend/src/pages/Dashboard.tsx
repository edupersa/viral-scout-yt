import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { KeywordGenerator } from "../components/KeywordGenerator";
import { FilterPanel } from "../components/FilterPanel";
import { VideoTable } from "../components/VideoTable";
import { StatsCards } from "../components/ui/StatsCards";
import type { SearchResponse } from "../api/types";

type Step = 1 | 2 | 3;

export default function Dashboard() {
  const [step, setStep] = useState<Step>(1);
  const [niche, setNiche] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResponse | null>(null);

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
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Search Results
              <span className="ml-2 text-sm font-normal text-zinc-500">
                {results.total} videos found
              </span>
            </h2>
          </div>
          <StatsCards data={results} />
          <VideoTable videos={results.results} />
        </div>
      )}
    </AppShell>
  );
}
