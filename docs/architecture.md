# Architecture Decision Records

## ADR-001: FastAPI over Django for backend

**Status:** Accepted | **Date:** 2026-04-15

**Context:** Need a Python web framework for a REST API backend that calls YouTube and Gemini APIs concurrently.

**Decision:** FastAPI.

**Reasons:**
- Native `async/await` — critical for IO-bound workloads (YouTube API, Gemini, PostgreSQL)
- Automatic OpenAPI docs at `/docs`
- Pydantic integration for request/response validation with zero boilerplate
- Benchmarks show 2–3× higher throughput than Django REST Framework on IO-bound endpoints

**Consequences:**
- No built-in admin panel (not needed for this scope)
- Smaller ecosystem than Django — acceptable tradeoff for a greenfield API project

---

## ADR-002: PostgreSQL + SQLAlchemy 2.0 async for persistence

**Status:** Accepted | **Date:** 2026-04-15

**Context:** Need persistent storage for users, searches, and video cache.

**Decision:** PostgreSQL 16 with SQLAlchemy 2.0 (fully async via `asyncpg`).

**Reasons:**
- SQLAlchemy 2.0 `Mapped[]` annotations give compile-time type safety on ORM models
- `asyncpg` is the fastest PostgreSQL driver for Python async
- PostgreSQL's ON CONFLICT (upsert) simplifies the video cache idempotency logic
- Alembic provides version-controlled schema migrations

**Consequences:**
- More setup than SQLite for local dev — mitigated by Docker Compose

---

## ADR-003: Redis for quota tracking and rate limiting

**Status:** Accepted | **Date:** 2026-04-15

**Context:** YouTube API has a 10,000 unit/day quota. Need to track usage across requests and rate-limit AI endpoints.

**Decision:** Redis 7 with TTL-based counters.

**Reasons:**
- Atomic `INCR` + `EXPIRE` gives quota tracking without race conditions
- 24-hour TTL aligns with YouTube's daily quota reset at midnight Pacific
- Sub-millisecond reads don't add latency to the request path

**Consequences:**
- Added infrastructure dependency — justified by the correctness guarantee

---

## ADR-004: React 19 + Vite for frontend

**Status:** Accepted | **Date:** 2026-04-15

**Context:** Need a fast, maintainable SPA for the search dashboard.

**Decision:** React 19, Vite, TypeScript strict mode.

**Reasons:**
- Vite's HMR is significantly faster than webpack-based setups during development
- React 19 concurrent features enable better UX for long-running searches
- TypeScript strict mode catches API contract mismatches at compile time

**Consequences:**
- React 19 is newer — some third-party libraries may lag behind (monitored)

---

## ADR-005: TanStack Query + Zustand for state management

**Status:** Accepted | **Date:** 2026-04-15

**Context:** Need to manage server state (API responses) and client UI state (filters, wizard step) separately.

**Decision:** TanStack Query for server state, Zustand for global UI state, `useState` for component-local state.

**Reasons:**
- TanStack Query handles caching, loading states, and refetching with minimal boilerplate
- Zustand is ~1KB and avoids the ceremony of Redux for simple global state
- Clear separation prevents the "everything in global state" antipattern

**Consequences:**
- Three state mechanisms to understand — tradeoff for clear separation of concerns

---

## ADR-006: Tailwind CSS 4 for styling

**Status:** Accepted | **Date:** 2026-04-15

**Context:** Need a styling solution that works well with component-based UI and produces minimal CSS bundle.

**Decision:** Tailwind CSS 4 utility-first.

**Reasons:**
- Tailwind's purging eliminates unused CSS — final bundle is ~5KB gzip
- Utility classes co-located with JSX reduce context-switching
- Design system constraints (spacing scale, color palette) prevent visual inconsistency
- Tailwind 4's Vite plugin has zero-config integration

**Consequences:**
- Long className strings in JSX — mitigated by `clsx` + extracted component variants

---

## ADR-007: Outlier score as primary viral signal

**Status:** Accepted | **Date:** 2026-04-20

**Context:** Need a metric to identify videos that outperform their channel's baseline.

**Decision:** `outlier_score = video_views / channel_avg_views_last_30`

**Reasons:**
- Absolute view counts favor large channels — a video with 500K views on a 10M-subscriber channel is not viral
- Ratio to channel average normalizes for channel size, surfacing true outliers
- Simple to explain to non-technical users
- Thresholds (≥10× ultra viral, ≥5× very viral) were chosen empirically from YouTube creator community benchmarks

**Consequences:**
- Requires an extra `channels.list` API call per unique channel ID (batched to minimize quota usage)
- Channels with <3 videos in the window fall back to the global average — edge case documented in `ExploreService`
