# Architecture — Design rules

## Layered architecture

This project follows a **clean layered architecture** with strict dependency direction:

```
┌──────────────────────────────────┐
│  Frontend (React SPA)            │  ← Presentation layer
│  Communicates via REST API only  │
└──────────────┬───────────────────┘
               │ HTTP/JSON
┌──────────────▼───────────────────┐
│  API layer (FastAPI routes)      │  ← Interface adapters
│  Input validation + auth check   │
│  Thin: validate → delegate → respond
└──────────────┬───────────────────┘
               │ method calls
┌──────────────▼───────────────────┐
│  Service layer                   │  ← Business logic (core)
│  Orchestrates repos + external   │
│  Domain rules + calculations     │
└──────────┬───────────┬───────────┘
           │           │
┌──────────▼──┐  ┌─────▼──────────┐
│ Repositories│  │ External APIs  │  ← Data access
│ (PostgreSQL)│  │ (YouTube, AI)  │
└─────────────┘  └────────────────┘
```

### Rules
- **Never skip layers**: routes must not call repositories directly
- **Dependencies flow inward**: services don't import from api/, routes don't import from models/
- **External services are wrapped**: YouTube API and Claude API each get a service class that handles retries, errors, rate limits. The rest of the app never touches raw API clients.

## API design

### RESTful conventions
```
POST   /api/v1/auth/register     # Create user
POST   /api/v1/auth/login        # Authenticate
GET    /api/v1/auth/me           # Current user

POST   /api/v1/keywords/generate # Generate keywords from niche
POST   /api/v1/search            # Execute video search
GET    /api/v1/search/history    # User's past searches (paginated)
GET    /api/v1/videos/:id        # Single video details
```

### Consistent response format
```json
// Success
{
  "results": [...],
  "total": 42,
  "quota_used": 150
}

// Error — always same shape
{
  "detail": "YouTube API daily quota exceeded",
  "code": "QUOTA_EXCEEDED"
}

// Paginated
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### Versioning
- All endpoints under `/api/v1/`
- When breaking changes are needed, create `/api/v2/` alongside v1
- v1 stays working until frontend is migrated

### Auth
- JWT Bearer token in `Authorization` header
- Token contains: `sub` (user_id), `exp` (expiration), `iat` (issued at)
- Refresh tokens are out of scope for MVP — re-login on expiration
- Protected routes use `Depends(get_current_user)` — returns User or raises 401

## Database design

### Naming conventions
- Table names: plural, snake_case (`users`, `videos`, `search_videos`)
- Column names: snake_case (`youtube_id`, `published_at`)
- Foreign keys: `{referenced_table_singular}_id` (`user_id`)
- Indexes: `ix_{table}_{column}` (auto-named by SQLAlchemy is fine)
- Unique constraints: `uq_{table}_{column}`

### Required columns on every table
- `id`: auto-incrementing integer primary key
- `created_at`: timestamp with timezone, server default `now()`
- `updated_at`: timestamp with timezone, on update (where applicable)

### Indexing strategy
- Index every foreign key column
- Index columns used in WHERE clauses: `youtube_id`, `email`, `channel_id`
- Composite index on `(search_id, video_id)` for the junction table
- EXPLAIN ANALYZE queries that touch >1000 rows

### Migration discipline
- ONE migration per logical change
- Migration message describes WHAT changed: `"add language column to videos"`
- NEVER edit a migration that's already been applied
- ALWAYS test `alembic upgrade head` + `alembic downgrade -1` + `alembic upgrade head`
- Review auto-generated migrations — they sometimes miss things or create unnecessary ops

## Docker best practices

### Multi-stage builds
```dockerfile
# ── Stage 1: builder ──
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: runner ──
FROM python:3.12-slim AS runner
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=builder /install /usr/local
COPY app/ ./app/
USER app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Rules
- Non-root user in ALL production containers
- .dockerignore excludes: `.git`, `node_modules`, `__pycache__`, `.env`, `tests/`
- Health checks on every service in docker-compose
- Named volumes for database persistence
- Environment variables — never bake secrets into images
- Pin base image versions: `python:3.12-slim`, not `python:latest`

### Docker Compose structure
```yaml
services:
  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U viralscout"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  backend:
    build: ./backend
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    env_file: .env

  frontend:
    build: ./frontend
    depends_on: [backend]
```

## Caching strategy

### Three levels
1. **PostgreSQL** — persistent cache. Videos and channel data stored permanently. Check DB before calling YouTube API.
2. **Redis** — short-lived cache. Quota counters (TTL 24h), recent search results (TTL 1h), rate limiting counters.
3. **TanStack Query** — client-side cache. API responses cached in memory with staleTime/gcTime config.

### Cache invalidation
- Video data: refresh if older than 24 hours
- Channel stats: refresh if older than 7 days
- Search results: re-execute if filters changed
- Quota counter: auto-expires daily at midnight Pacific (YouTube's reset)

## Security

- CORS: restrict origins to frontend domain only (not `*` in production)
- Rate limiting on AI endpoints: max 10 keyword generations per hour per user
- Input validation on ALL endpoints via Pydantic
- SQL injection: impossible with SQLAlchemy parameterized queries — but never use raw SQL strings
- XSS: React escapes by default. Never use `dangerouslySetInnerHTML`.
- Secrets: env vars only. Never in code, never in Docker images, never in git.
- Dependencies: keep updated. Use `pip-audit` and `npm audit` in CI.

## Error handling philosophy

- **Be specific**: custom exception classes, not generic `HTTPException(400)`
- **Fail fast**: validate at the boundary (API layer), not deep in services
- **Don't swallow errors**: every `except` must log, re-raise, or convert to a domain error
- **User-facing errors must be helpful**: "YouTube quota exceeded, try again tomorrow" not "Internal server error"
- **External service failures are expected**: always have a fallback or clear error
