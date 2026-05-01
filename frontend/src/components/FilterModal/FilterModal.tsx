import { useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { FilterPanel } from "../FilterPanel";
import type { SearchResponse } from "../../api/types";

interface FilterModalProps {
  niche: string;
  selectedKeywords: string[];
  onResults: (data: SearchResponse) => void;
  onClose: () => void;
}

export function FilterModal({ niche, selectedKeywords, onResults, onClose }: FilterModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleResults(data: SearchResponse) {
    onResults(data);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Modificar filtros"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Modificar filtros</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <FilterPanel niche={niche} selectedKeywords={selectedKeywords} onResults={handleResults} />
      </div>
    </div>
  );
}
