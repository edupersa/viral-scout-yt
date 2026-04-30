import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useGenerateKeywords } from "../../api/hooks/useKeywords";
import { Button } from "../ui/Button";
import { KeywordPill } from "./KeywordPill";

interface KeywordGeneratorProps {
  onComplete: (niche: string, keywords: string[]) => void;
}

export function KeywordGenerator({ onComplete }: KeywordGeneratorProps) {
  const [niche, setNiche] = useState("");
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
      const result = await generate(niche.trim());
      setKeywords(result.keywords);
      setSelected(result.keywords);
    } catch {
      setError("Failed to generate keywords. Please try again.");
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
    onComplete(niche.trim(), selected);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Describe your niche</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Briefly describe the content niche you want to research.
        </p>
      </div>

      <div className="flex gap-3">
        <textarea
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. personal finance for Gen Z, cooking shortcuts, home gym workouts…"
          rows={3}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors"
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
