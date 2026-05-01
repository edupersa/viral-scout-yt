import { useState } from "react";
import { Sparkles, Globe } from "lucide-react";
import { useGenerateKeywords } from "../../api/hooks/useKeywords";
import { getApiErrorMessage } from "../../lib/apiError";
import { Button } from "../ui/Button";
import { KeywordPill } from "./KeywordPill";

const LANGUAGES = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

interface KeywordGeneratorProps {
  onComplete: (niche: string, keywords: string[], language: string) => void;
}

export function KeywordGenerator({ onComplete }: KeywordGeneratorProps) {
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("en");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: generate, isPending } = useGenerateKeywords();

  async function handleGenerate() {
    if (niche.trim().length < 3) {
      setError("Describe your niche in at least 3 characters.");
      return;
    }
    setError(null);
    try {
      const result = await generate({ niche: niche.trim(), language: language || null });
      setKeywords(result.keywords);
      setSelected(result.keywords);
    } catch (e) {
      setError(await getApiErrorMessage(e));
    }
  }

  function toggleKeyword(kw: string) {
    setSelected((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );
  }

  function handleContinue() {
    if (selected.length === 0) {
      setError("Select at least one keyword to search.");
      return;
    }
    onComplete(niche.trim(), selected, language);
  }

  const selectedLangLabel = LANGUAGES.find((l) => l.value === language)?.label ?? "Any language";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Describe your niche</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Briefly describe the content niche you want to research.
        </p>
      </div>

      {/* Language selector — shown first, sets the context for everything */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
          <Globe size={14} className="text-zinc-400" />
          Language of results
        </label>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setKeywords([]);
            setSelected([]);
          }}
          className="w-full sm:w-56 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        {language && (
          <p className="text-xs text-zinc-500">
            Keywords and search results will be in{" "}
            <span className="text-zinc-300 font-medium">{selectedLangLabel}</span>.
          </p>
        )}
      </div>

      <div>
        <textarea
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. personal finance for Gen Z, cooking shortcuts, home gym workouts…"
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors"
        />
      </div>

      <Button
        onClick={handleGenerate}
        isLoading={isPending}
        disabled={niche.trim().length < 3}
        size="md"
      >
        <Sparkles size={15} className="mr-2" aria-hidden="true" />
        Generate Keywords with AI
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {keywords.length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-3">
              Select keywords to search ({selected.length} selected)
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <KeywordPill
                  key={kw}
                  keyword={kw}
                  selected={selected.includes(kw)}
                  onToggle={toggleKeyword}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleContinue} disabled={selected.length === 0}>
            Search Videos →
          </Button>
        </div>
      )}
    </div>
  );
}
