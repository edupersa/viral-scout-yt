# ViralScout — YouTube Viral Video Research Tool

## Project overview

ViralScout is a SaaS tool that helps YouTube creators discover viral video opportunities. Users describe a niche, the AI generates optimized keywords, and the system searches YouTube to find videos with high "outlier scores" (views relative to channel average). Built as a fullstack portfolio project demonstrating production-grade practices.

**Target audience**: YouTube creators, content strategists, digital marketers.

## Tech stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic, Celery, Redis
- **Frontend**: React 19, TypeScript strict, Vite, Tailwind CSS 4, TanStack Query, Zustand
- **Infra**: Docker, PostgreSQL 16, Redis 7, GitHub Actions CI/CD
- **APIs**: YouTube Data API v3, Google Gemini API

## Detailed skill docs

IMPORTANT: Before writing code, read the relevant skill doc. These contain the actual coding standards.

- Backend standards: @docs/skills/backend-python.md
- Frontend standards: @docs/skills/frontend-react.md
- Architecture rules: @docs/skills/architecture.md
- Documentation & repo standards: @docs/skills/documentation.md

## Project structure

```
viralscout/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app factory
│   │   ├── config.py           # pydantic-settings
│   │   ├── database.py         # async engine + session
│   │   ├── dependencies.py     # shared FastAPI dependencies
│   │   ├── exceptions.py       # custom exception classes
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response DTOs
│   │   ├── api/                # route handlers (thin controllers)
│   │   ├── services/           # business logic layer
│   │   ├── repositories/       # data access layer (DB queries)
│   │   └── tasks/              # Celery background jobs
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── api/                # HTTP client + typed hooks
│   │   ├── components/         # UI components
│   │   ├── pages/              # route-level components
│   │   ├── stores/             # Zustand global state
│   │   ├── hooks/              # shared custom hooks
│   │   ├── types/              # shared TypeScript types
│   │   └── lib/                # utilities, constants, helpers
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── skills/                 # coding standards (read by Claude)
│   ├── api.md                  # endpoint documentation
│   ├── architecture.md         # ADRs + system design
│   └── deployment.md           # deploy guide
├── .github/workflows/
├── docker-compose.yml
├── CLAUDE.md                   # this file
└── README.md
```

## Commands

```bash
docker compose up --build           # start all services
docker compose down -v              # stop + remove volumes

cd backend && ruff check . && ruff format .  # lint + format python
cd backend && pytest --cov=app               # test with coverage
cd backend && alembic upgrade head           # apply migrations

cd frontend && npm run dev          # vite dev server
cd frontend && npm run build        # production build
cd frontend && npm run lint         # eslint
cd frontend && npm run test         # vitest
```

## Key algorithms

```
outlier_score = video_views / channel_avg_views_last_30
```
- ≥ 10x → ultra viral (red) | 5–10x → very viral (amber) | < 5x → normal (green)

## Critical constraints

- YouTube API: 10,000 units/day free. search.list = 100 units. videos.list = 1 unit. ALWAYS cache.
- Gemini API: use gemini-2.0-flash for keyword gen. Charge per token.
- NEVER expose API keys in frontend. NEVER log secrets. NEVER commit .env.
- All DB queries via SQLAlchemy parameterized statements.
- Git: conventional commits, feature branches, squash merge PRs.
- NEVER add Co-Authored-By or any AI attribution lines to commit messages.
