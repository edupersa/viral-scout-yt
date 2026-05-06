# Changelog

All notable changes to ViralScout are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- CI/CD pipeline (GitHub Actions) — backend lint + test, frontend lint + build + test
- MIT License
- Frontend unit tests (filterUtils, Button, KeywordPill)
- `docs/api.md` — full endpoint reference
- `docs/architecture.md` — Architecture Decision Records
- `docs/deployment.md` — Railway + Vercel deploy guide

### Changed
- Frontend refactor: extracted shared `constants.ts`, `filterUtils.ts`, `utils.ts`
- New reusable UI components: `SelectField`, `RangeInput`, `SectionLabel`
- `useVideoSort` hook shared between VideoGrid and VideoTable
- `Explore` page migrated from local `useState` to Zustand filter store

---

## [0.3.0] - 2026-05-06

### Added
- **Market Explorer** (`/explore`) — browse trending YouTube videos without keywords
  - Iterative pagination fetching up to 200 videos per request
  - Batched `videos.list` calls to minimize quota usage
- **Free-tier search quota** — `searches_used` / `search_limit` columns on users
  - Blocked banner shown when limit is reached
  - Admin endpoints to adjust and reset limits per user
- **Advanced filters** — min/max range inputs with "unlimited" toggle for subscribers and views
- Language selector on keyword generation step
- Min views filter for both search and explore
- Pre-commit hook blocking direct commits to `main`
- Timeout fix: `ky` client raised to 30 s, Nginx `proxy_read_timeout` set to 60 s

---

## [0.2.0] - 2026-04-30

### Added
- **Filter Modal** — re-run search with different filters from results view
- Active filters context bar in results (language badge, keyword pills)
- Duration filter (short / medium / long + custom minute range)
- Date range filter (7d / 30d / 90d / 365d)
- Subscriber range filter (min / max)
- `VideoTable` component with sortable columns as alternative to card grid
- `StatsCards` component showing aggregate stats for search results
- Virality badges (ultra viral / very viral / normal) on video cards

---

## [0.1.0] - 2026-04-20

### Added
- **Phase 1** — Project scaffolding: Docker Compose, FastAPI skeleton, React + Vite + Tailwind shell
- **Phase 2** — Backend: User model, JWT auth (register / login / me), PostgreSQL + Alembic migrations
- **Phase 3** — YouTube Data API v3 integration, Gemini keyword generation, search endpoint with outlier score calculation
- **Phase 4** — Full React frontend: Login, Register, Dashboard wizard (keywords → filters → results), VideoGrid with sort
- Outlier score formula: `video_views / channel_avg_views_last_30`
- Virality classification: ≥10x ultra viral, ≥5x very viral, <5x normal
- Redis caching for quota counters and recent results
- Zustand global filter store
- TanStack Query for server state
