# Frontend React — Coding standards

## Component architecture

### Folder structure convention
```
components/
  ui/                  # Primitive, reusable building blocks (Button, Input, Badge, Card)
  layout/              # Shell, Sidebar, Header — structural wrappers
  KeywordGenerator/
    KeywordGenerator.tsx
    KeywordPill.tsx     # Sub-component only used here
    useKeywordState.ts  # Hook scoped to this feature
    index.ts            # Re-export
  VideoTable/
    VideoTable.tsx
    VideoRow.tsx
    SortHeader.tsx
    index.ts
```

- Co-locate sub-components and hooks with their parent feature component
- `ui/` components are context-free — they don't know about the app domain
- Feature components import from `ui/` and compose them

### Component patterns

#### Explicit prop typing — always
```tsx
// ✅ CORRECT — explicit interface, destructured props
interface VideoRowProps {
  video: VideoResult;
  rank: number;
  onSelect?: (videoId: string) => void;
}

export function VideoRow({ video, rank, onSelect }: VideoRowProps) {
  return (/* ... */);
}

// ❌ WRONG — inline types, no name
export default function ({ data }: { data: any }) { /* ... */ }
```

#### Named exports only — no default exports (except pages)
```tsx
// ✅ components/VideoTable/index.ts
export { VideoTable } from "./VideoTable";

// ❌ WRONG
export default function VideoTable() { /* ... */ }
```

Pages are the only exception: React Router lazy loading works cleanest with default exports.

#### Composition over configuration
```tsx
// ✅ CORRECT — composable card
<Card>
  <Card.Header>
    <Card.Title>Search Results</Card.Title>
  </Card.Header>
  <Card.Body>
    <VideoTable videos={videos} />
  </Card.Body>
</Card>

// ❌ WRONG — prop soup
<Card
  title="Search Results"
  headerAction={<Button>Export</Button>}
  bodyPadding="lg"
  footer={<Pagination />}
  children={<VideoTable videos={videos} />}
/>
```

#### Conditional rendering — clean patterns
```tsx
// ✅ Early returns for loading/error/empty states
export function SearchResults({ query }: SearchResultsProps) {
  const { data, isLoading, error } = useSearch(query);

  if (isLoading) return <SearchSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.results.length) return <EmptyState message="No videos found" />;

  return (
    <div>
      <StatsCards data={data} />
      <VideoTable videos={data.results} />
    </div>
  );
}
```

## State management rules

### TanStack Query for ALL server state
```tsx
// ✅ CORRECT — server state in TanStack Query
export function useSearch(request: SearchRequest) {
  return useMutation({
    mutationFn: (req: SearchRequest) => api.post("search", { json: req }).json<SearchResponse>(),
    onSuccess: (data) => {
      queryClient.setQueryData(["search", "latest"], data);
    },
  });
}

// ❌ WRONG — server state in useState
const [videos, setVideos] = useState<Video[]>([]);
useEffect(() => {
  fetch("/api/search").then(r => r.json()).then(setVideos);
}, []);
```

### Zustand for global UI state only
```tsx
// stores/filterStore.ts
interface FilterState {
  language: string;
  duration: string;
  minSubs: number;
  maxSubs: number;
  dateRange: string;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  language: "all",
  duration: "all",
  minSubs: 0,
  maxSubs: 1_000_000,
  dateRange: "all",
};

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULT_FILTERS,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(DEFAULT_FILTERS),
}));
```

### useState for component-local UI state
```tsx
// ✅ local state — only this component cares
const [isExpanded, setIsExpanded] = useState(false);
const [sortColumn, setSortColumn] = useState<SortKey>("outlierScore");
```

## Custom hooks

### API hooks — one file per resource
```tsx
// api/hooks/useKeywords.ts
export function useGenerateKeywords() {
  return useMutation({
    mutationFn: (niche: string) =>
      api.post("keywords/generate", { json: { niche } }).json<KeywordResponse>(),
  });
}
```

### Extract complex logic into hooks
```tsx
// hooks/useVideoSort.ts
export function useVideoSort(videos: VideoResult[]) {
  const [sortBy, setSortBy] = useState<SortKey>("outlierScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...videos].sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      return (a[sortBy] - b[sortBy]) * mul;
    });
  }, [videos, sortBy, sortDir]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(key); setSortDir("desc"); }
  }, [sortBy]);

  return { sorted, sortBy, sortDir, toggleSort };
}
```

## TypeScript strict patterns

### Shared API types — mirror backend schemas exactly
```tsx
// api/types.ts
export interface VideoResult {
  id: number;
  youtube_id: string;
  title: string;
  channel_name: string;
  views: number;
  subs: number;
  outlier_score: number;
  virality_class: "ultra_viral" | "very_viral" | "normal";
  duration_seconds: number;
  language: string;
  published_at: string;  // ISO 8601
  thumbnail_url: string;
}

export interface SearchResponse {
  results: VideoResult[];
  total: number;
  quota_used: number;
}
```

### Use discriminated unions for state
```tsx
type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SearchResponse }
  | { status: "error"; error: string };
```

### Avoid `any` — use `unknown` and narrow
```tsx
// ✅ CORRECT
function parseApiError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

// ❌ WRONG
function parseApiError(error: any): string {
  return error.message;  // runtime crash if no .message
}
```

## API client setup

```tsx
// api/client.ts
import ky from "ky";

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL || "/api/v1",
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
      },
    ],
  },
});
```

## Styling with Tailwind

### Utility-first — no CSS modules, no styled-components
```tsx
// ✅ Tailwind utilities directly
<div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">

// ❌ WRONG — CSS modules
import styles from "./Card.module.css";
<div className={styles.card}>
```

### Conditional classes with template literals (or clsx for complex cases)
```tsx
// Simple conditions — template literal
<span className={`px-2 py-1 text-xs font-semibold rounded ${
  score >= 10 ? "bg-red-500/15 text-red-400" :
  score >= 5 ? "bg-amber-500/15 text-amber-400" :
  "bg-emerald-500/15 text-emerald-400"
}`}>

// Complex — use clsx
import { clsx } from "clsx";
<button className={clsx(
  "px-4 py-2 rounded-lg font-medium transition-all",
  variant === "primary" && "bg-red-600 text-white hover:bg-red-500",
  variant === "ghost" && "bg-transparent text-zinc-400 hover:text-white",
  disabled && "opacity-50 cursor-not-allowed",
)}>
```

## Loading & error states

Every data-fetching component MUST handle all 4 states:
1. **Loading** — skeleton or spinner (prefer skeletons)
2. **Error** — clear message + retry action
3. **Empty** — helpful message + suggested action
4. **Success** — the actual content

```tsx
// Create reusable skeletons that match the real layout
function VideoTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-zinc-800/50 animate-pulse" />
      ))}
    </div>
  );
}
```

## Accessibility baseline

- All interactive elements must be keyboard-accessible
- Use semantic HTML: `button` for actions, `a` for navigation, `table` for tabular data
- `img` tags need `alt` text
- Form inputs need associated `label` elements
- Color is never the only way to convey information (add text/icons alongside)
- Focus styles must be visible: `focus-visible:ring-2 focus-visible:ring-red-500`

## Performance

- Use `React.lazy()` + `Suspense` for route-level code splitting
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to child components with `useCallback`
- Do NOT prematurely optimize — only memoize when you measure a problem
- Use `key` prop correctly in lists — never use array index as key for dynamic lists

## Testing

- Vitest + Testing Library for component tests
- Test user behavior, not implementation details
- Query by role, label, or text — never by class name or test ID (unless no alternative)
```tsx
// ✅ CORRECT — tests what the user sees
const button = screen.getByRole("button", { name: /buscar videos/i });
await userEvent.click(button);
expect(screen.getByText(/resultados/i)).toBeInTheDocument();

// ❌ WRONG — tests implementation
const button = container.querySelector(".search-btn");
expect(wrapper.state().isLoading).toBe(true);
```
