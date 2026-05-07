import { AppShell } from "../components/layout/AppShell";
import { useSearchHistory } from "../api/hooks/useSearchHistory";
import { Clock, Search } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const { data, isLoading, error } = useSearchHistory();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Historial de búsquedas</h1>
        <p className="text-sm text-zinc-500 mt-1">Tus últimas búsquedas de videos virales</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-sm text-red-400">
          Error al cargar el historial. Intenta de nuevo.
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search size={40} className="text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium">Sin búsquedas aún</p>
          <p className="text-zinc-600 text-sm mt-1">
            Tus búsquedas aparecerán aquí después de usar el Dashboard.
          </p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100 truncate">{item.niche}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.keywords.slice(0, 4).map((kw: string) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400"
                      >
                        {kw}
                      </span>
                    ))}
                    {item.keywords.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">
                        +{item.keywords.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                    <Clock size={11} />
                    {formatDate(item.created_at)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {item.video_count} videos · {item.quota_used} quota
                  </p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-zinc-600 text-center pt-2">
            {data.total} búsqueda{data.total !== 1 ? "s" : ""} en total
          </p>
        </div>
      )}
    </AppShell>
  );
}
