# Documentation & Repository — Standards

## What makes a portfolio repo impressive

Recruiters and clients evaluate in this order:
1. **README** — first 10 seconds decide if they keep reading
2. **Code quality** — clean, consistent, well-structured
3. **Git history** — tells a story of professional workflow
4. **Documentation** — shows you think beyond just "it works"
5. **CI/CD** — proves you care about reliability
6. **Deploy** — a live link is worth 1000 lines of code

## README.md structure

The README is the landing page of the project. It must contain ALL of the following sections in this order:

```markdown
# 🔍 ViralScout

> Discover viral YouTube video opportunities with AI-powered keyword generation and outlier analysis.

![CI](https://github.com/USER/viralscout/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.12-blue)
![React](https://img.shields.io/badge/react-19-blue)
![TypeScript](https://img.shields.io/badge/typescript-strict-blue)

[screenshot or demo GIF here — VERY important for portfolio]

## Features

- 🤖 AI-powered keyword generation from niche descriptions
- 📊 Outlier score analysis (views vs channel average)
- 🎯 Advanced filters: language, duration, subscribers, date
- 📈 Real-time YouTube data via official API
- 🔐 JWT authentication with secure password hashing
- 🐳 Fully containerized with Docker

## Quick start

[3-step setup with docker compose]

## Architecture

[Mermaid diagram of system components]

## Tech stack

[Table with technology + why it was chosen]

## API documentation

[Link to /docs or summary of endpoints]

## Development

[How to set up dev environment, run tests, contribute]

## Deployment

[How it's deployed, link to live demo]

## License

MIT
```

### Rules for README
- ALWAYS include a screenshot or GIF. A visual demo is mandatory for portfolio projects. Use a placeholder with instructions if not available yet.
- Badges at the top: CI status, license, key tech versions
- Quick start must work in 3 commands or less
- Mermaid diagram for architecture — GitHub renders it natively
- Explain WHY each tech was chosen, not just list them

## Git workflow

### Branch naming
```
feat/keyword-generation     # new feature
fix/quota-tracking-reset    # bug fix
docs/api-documentation      # documentation
chore/docker-optimization   # maintenance
refactor/service-layer      # code restructure
test/search-integration     # adding tests
```

### Commit messages — Conventional Commits
```
feat: add keyword generation endpoint with Claude AI
fix: reset YouTube quota counter at midnight Pacific
docs: add architecture decision records
chore: upgrade FastAPI to 0.115.6
refactor: extract YouTube service from search handler
test: add integration tests for auth flow

# Multi-line for complex changes:
feat: implement outlier score calculation

- Add AnalyzerService with score formula
- Classify videos into ultra_viral/very_viral/normal
- Cache channel averages in Redis (TTL 7 days)

Closes #12
```

### Rules
- NEVER commit to main directly
- One feature = one branch = one PR
- Squash merge PRs to keep main history clean
- Delete feature branches after merge
- PR description must explain WHAT and WHY

### PR description template
```markdown
## What

Brief description of the change.

## Why

Why this change is needed. Link to issue if applicable.

## How

Technical approach taken. Key decisions made.

## Testing

How this was tested. Commands to verify.

## Screenshots

If UI changes, include before/after screenshots.
```

## Code documentation

### Python docstrings — Google style
```python
async def execute_search(
    self,
    user_id: int,
    keywords: list[str],
    filters: SearchFilters,
) -> SearchResponse:
    """Execute a video search across YouTube and compute outlier scores.

    Checks the local cache first. If no recent results exist, queries the
    YouTube Data API, enriches videos with channel statistics, and computes
    outlier scores.

    Args:
        user_id: The authenticated user's ID, used to record search history.
        keywords: List of search terms to query YouTube.
        filters: Filtering criteria (language, duration, subscribers, date).

    Returns:
        SearchResponse with ranked video results, total count, and quota used.

    Raises:
        QuotaExceededException: If YouTube API daily quota is exhausted.
        ExternalServiceException: If YouTube API returns an unexpected error.
    """
```

### When to write docstrings
- ALL public functions and classes — no exceptions
- Private functions only if the logic is non-obvious
- Module-level docstring for files with non-trivial purpose

### TypeScript JSDoc — for exported functions
```tsx
/**
 * Calculates the visual width percentage for the outlier score bar.
 * Caps at 100% for scores above the max threshold.
 */
export function scoreToPercent(score: number, maxScore = 20): number {
  return Math.min((score / maxScore) * 100, 100);
}
```

## docs/ folder structure

```
docs/
├── skills/              # Coding standards (read by Claude Code)
│   ├── backend-python.md
│   ├── frontend-react.md
│   ├── architecture.md
│   └── documentation.md  # This file
├── api.md               # Complete API endpoint documentation
├── architecture.md      # Architecture Decision Records (ADRs)
└── deployment.md        # How to deploy to production
```

### docs/api.md — endpoint documentation
Document every endpoint with:
- Method + path
- Description
- Auth required?
- Request body (with example)
- Response (with example)
- Error cases
- Rate limits

### docs/architecture.md — ADRs (Architecture Decision Records)
Each major technical decision gets an ADR:
```markdown
## ADR-001: FastAPI over Django for backend

**Status**: Accepted
**Date**: 2026-04-29

**Context**: We need a Python web framework for a REST API backend.

**Decision**: Use FastAPI because:
- Native async support (critical for YouTube API calls)
- Automatic OpenAPI docs
- Pydantic integration for validation
- Better performance than Django REST Framework for IO-bound workloads

**Consequences**:
- No built-in admin panel (not needed for this project)
- Smaller ecosystem than Django (acceptable tradeoff)
```

### docs/deployment.md
- Prerequisites (accounts, API keys)
- Step-by-step deploy to Railway/Render + Vercel
- Environment variables checklist
- Post-deploy verification steps
- Monitoring setup (Sentry, health endpoints)

## CI/CD pipeline documentation

The GitHub Actions workflows must include comments explaining each step:
```yaml
# ci.yml — Runs on every PR and push to main
# Ensures code quality and test coverage before merge
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## CHANGELOG

Maintain a CHANGELOG.md following Keep a Changelog format:
```markdown
# Changelog

## [1.0.0] - 2026-05-XX

### Added
- AI-powered keyword generation from niche descriptions
- YouTube video search with outlier score analysis
- Advanced filtering (language, duration, subscribers, date)
- JWT authentication
- Docker Compose development environment
- GitHub Actions CI/CD pipeline

### Infrastructure
- PostgreSQL 16 for persistent storage
- Redis 7 for caching and rate limiting
- Multi-stage Docker builds
```

## LICENSE

Use MIT for portfolio projects — it's the most permissive and recruiter-friendly:
```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

## Final checklist before showing to anyone

- [ ] README has screenshot/GIF
- [ ] README badges are green (CI passing)
- [ ] Live demo link works
- [ ] `docker compose up --build` works from clean clone
- [ ] All tests pass
- [ ] No secrets in git history (check with `git log --all -p | grep -i "api_key"`)
- [ ] No TODO/FIXME/HACK comments left in code
- [ ] No console.log or print() debugging statements
- [ ] Consistent code formatting (ruff + prettier)
- [ ] All endpoints documented in docs/api.md
- [ ] CHANGELOG is up to date
- [ ] License file exists
