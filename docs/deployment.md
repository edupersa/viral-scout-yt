# Deployment Guide

ViralScout deploys the backend + database + Redis to **Railway** and the frontend to **Vercel**.

---

## Prerequisites

- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account
- YouTube Data API v3 key ([console.cloud.google.com](https://console.cloud.google.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

---

## Backend — Railway

### 1. Create a new project

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
```

### 2. Add services

In the Railway dashboard, add:
- **PostgreSQL** plugin — Railway provisions it automatically
- **Redis** plugin — Railway provisions it automatically
- **Backend service** — point to the `./backend` directory

### 3. Set environment variables

In the Railway backend service settings, add:

```
DATABASE_URL=<auto-filled by Railway PostgreSQL plugin>
REDIS_URL=<auto-filled by Railway Redis plugin>
YOUTUBE_API_KEY=your-youtube-api-key
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=<generate with: openssl rand -hex 32>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
ADMIN_EMAIL=your-admin@email.com
```

### 4. Set start command

In Railway service settings → Deploy:
```
./entrypoint.sh
```

The `entrypoint.sh` runs Alembic migrations then starts Uvicorn.

### 5. Deploy

```bash
railway up
```

Railway detects the `backend/Dockerfile` automatically. Note the generated URL (e.g. `https://viralscout-backend.up.railway.app`).

---

## Frontend — Vercel

### 1. Import repository

Go to [vercel.com/new](https://vercel.com/new) → Import Git Repository → select `viral-scout-yt`.

### 2. Configure build settings

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 |

### 3. Set environment variables

```
VITE_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
```

### 4. Deploy

Click **Deploy**. Vercel builds and publishes automatically on every push to `main`.

---

## Post-deploy verification

```bash
# Health check
curl https://your-railway-backend-url.up.railway.app/health
# Expected: {"status":"ok"}

# Register a user
curl -X POST https://your-railway-backend-url.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Then open the Vercel frontend URL and confirm:
- [ ] Login and register work
- [ ] Keyword generation returns results
- [ ] Search returns videos with outlier scores
- [ ] Explore page loads trending videos

---

## Monitoring

- **Railway** provides built-in metrics (CPU, memory, request count) in the dashboard
- Add [Sentry](https://sentry.io) by setting `SENTRY_DSN` and installing `sentry-sdk[fastapi]`
- Backend health endpoint at `/health` can be used as an uptime monitor target

---

## Keeping API keys safe

- Never commit `.env` — it is in `.gitignore`
- Rotate the `JWT_SECRET` if it is ever exposed — all existing sessions will be invalidated
- YouTube quota resets daily at midnight Pacific — monitor usage in Google Cloud Console
