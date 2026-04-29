# ViralScout — Prompt maestro para Claude Code

## Cómo usar este documento

Este archivo contiene los prompts que debes pegar en Claude Code (extensión de VS Code) en orden secuencial. Cada fase construye sobre la anterior. No saltes fases.

---

## REQUISITOS PREVIOS

Antes de empezar, necesitas:

### 1. Cuentas y API keys
- **GitHub**: cuenta creada + repositorio `viralscout` creado (vacío)
- **Google Cloud**: proyecto creado + YouTube Data API v3 habilitada + API key generada
- **Anthropic**: cuenta + API key para Claude (para el feature de generación de keywords)
- **Node.js**: v20+ instalado
- **Python**: 3.12+ instalado
- **Docker Desktop**: instalado y corriendo

### 2. Instalar Claude Code en VS Code
1. Abre VS Code
2. `Ctrl+Shift+X` → busca "Claude Code" → instala la de **Anthropic** (publisher oficial)
3. Click en el icono Spark (⚡) en la barra lateral
4. Autentícate con tu cuenta Anthropic (necesitas plan Pro mínimo, $20/mes)

### 3. Crear el repositorio local
```bash
mkdir viralscout && cd viralscout
git init
git remote add origin https://github.com/TU_USUARIO/viralscout.git
```

### 4. Copiar el archivo CLAUDE.md
Copia el archivo `CLAUDE.md` que acompaña este documento a la raíz del proyecto. Claude Code lo leerá automáticamente en cada sesión.

---

## FASE 1 — Scaffolding del proyecto (Docker + estructura)

> Pega este prompt en Claude Code:

```
Inicializa el proyecto ViralScout según la estructura definida en CLAUDE.md. Necesito que hagas:

1. Crear docker-compose.yml con 4 servicios:
   - postgres:16-alpine (puerto 5432, volume persistente, healthcheck)
   - redis:7-alpine (puerto 6379, healthcheck)
   - backend (build desde ./backend, puerto 8000, depends_on postgres + redis, variables de entorno desde .env)
   - frontend (build desde ./frontend, puerto 5173, depends_on backend)

2. Crear backend/Dockerfile multi-stage:
   - Stage builder: python:3.12-slim, instala deps
   - Stage runner: python:3.12-slim, usuario non-root, copia solo lo necesario
   - CMD: uvicorn app.main:app --host 0.0.0.0 --port 8000

3. Crear frontend/Dockerfile multi-stage:
   - Stage builder: node:20-alpine, npm ci, npm run build
   - Stage runner: node:20-alpine, serve estáticos con nginx o serve
   - En dev, usar vite dev server en su lugar

4. Crear .env.example con todas las variables necesarias:
   - DATABASE_URL, REDIS_URL, YOUTUBE_API_KEY, ANTHROPIC_API_KEY
   - JWT_SECRET, JWT_ALGORITHM=HS256, ACCESS_TOKEN_EXPIRE_MINUTES=30

5. Crear .gitignore completo (Python + Node + Docker + env + IDE)

6. Crear .dockerignore para backend y frontend

7. Crear un README.md profesional con:
   - Badges (CI status, license, tech stack)
   - Screenshot placeholder
   - Features list
   - Quick start con Docker
   - Architecture diagram en Mermaid
   - API docs link
   - Contributing guidelines
   - License (MIT)

Usa las mejores prácticas de Docker: multi-stage builds, non-root users, .dockerignore, health checks, named volumes. El docker-compose.yml debe funcionar con un solo `docker compose up --build`.
```

---

## FASE 2 — Backend: FastAPI base + Auth + DB

> Pega este prompt en Claude Code:

```
Configura el backend completo de FastAPI con autenticación. Lee CLAUDE.md para la estructura exacta.

1. Crear backend/pyproject.toml con configuración de ruff y pytest

2. Crear backend/requirements.txt con deps pinned:
   fastapi[standard]>=0.115
   uvicorn[standard]
   sqlalchemy[asyncio]>=2.0
   asyncpg
   alembic
   pydantic-settings
   python-jose[cryptography]
   passlib[bcrypt]
   redis
   httpx
   anthropic
   google-api-python-client

3. Crear app/config.py con BaseSettings (lee de .env)

4. Crear app/database.py con async engine + async session maker

5. Crear modelos SQLAlchemy:
   - User (id, email, hashed_password, created_at, is_active)
   - Search (id, user_id FK, niche, keywords JSON, filters JSON, created_at)
   - Video (id, youtube_id unique, title, channel_name, channel_id, views, subs, avg_channel_views, outlier_score, duration, language, published_at, thumbnail_url, created_at)
   - SearchVideo (search_id FK, video_id FK) — tabla intermedia

6. Crear schemas Pydantic para auth:
   - RegisterRequest (email, password con min 8 chars)
   - LoginRequest (email, password)
   - TokenResponse (access_token, token_type)
   - UserResponse (id, email, created_at)

7. Crear services/auth.py:
   - hash_password, verify_password (bcrypt)
   - create_access_token, verify_token (JWT)
   - get_current_user dependency

8. Crear api/auth.py con endpoints:
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - GET /api/v1/auth/me (protected)

9. Crear app/main.py con:
   - FastAPI app con metadata (title, version, docs_url)
   - CORS middleware (origins configurables)
   - Router includes
   - Lifespan handler para startup/shutdown

10. Crear alembic config + initial migration

11. Crear tests/conftest.py con fixtures:
    - Test database (SQLite async o test PostgreSQL)
    - AsyncClient con httpx
    - Authenticated client fixture

12. Crear tests/test_auth.py:
    - Test register success
    - Test register duplicate email
    - Test login success
    - Test login wrong password
    - Test me endpoint with valid token
    - Test me endpoint without token → 401

Verifica que todo funciona: ejecuta los tests con pytest.
```

---

## FASE 3 — Servicio YouTube + Generación de keywords con IA

> Pega este prompt en Claude Code:

```
Implementa los servicios core de ViralScout: YouTube Data API y generación de keywords con Claude. Lee CLAUDE.md para convenciones.

1. Crear services/youtube.py — YouTubeService class:
   - __init__ recibe api_key
   - search_videos(query, max_results=50, language=None, published_after=None, duration=None) 
     → usa search.list (100 quota units). Retorna lista de video IDs
   - get_video_details(video_ids: list[str])
     → usa videos.list con parts: snippet,statistics,contentDetails (1 unit por batch de 50)
   - get_channel_stats(channel_ids: list[str])
     → usa channels.list con parts: statistics (1 unit por batch de 50)
   - Implementar quota tracking: incrementar contador en Redis por cada call
   - Implementar cache: antes de llamar a la API, verificar si el video ya existe en DB
   - Manejo de errores: HttpError, quota exceeded, invalid key
   - Parsear duration de ISO 8601 (PT4M13S → 253 seconds)

2. Crear services/ai.py — AIService class:
   - __init__ recibe anthropic_client
   - generate_keywords(niche: str, count: int = 12) → list[str]
     Prompt optimizado que genera keywords relevantes para buscar videos virales en YouTube.
     Debe retornar JSON array parseado.
   - analyze_viral_pattern(video_data: dict) → dict
     Analiza por qué un video fue viral: título, timing, formato.
     Para fase futura, dejar el esqueleto.

3. Crear services/analyzer.py — AnalyzerService:
   - calculate_outlier_score(video_views, channel_avg_views) → float
   - classify_virality(score) → "ultra_viral" | "very_viral" | "normal"
   - enrich_videos(videos, channel_stats) → list con outlier scores calculados

4. Crear schemas/search.py:
   - KeywordRequest (niche: str)
   - KeywordResponse (keywords: list[str], niche: str)
   - SearchFilters (language, duration, min_subs, max_subs, date_range)
   - SearchRequest (keywords: list[str], filters: SearchFilters)
   - VideoResult (todos los campos del video + outlier_score + virality_class)
   - SearchResponse (results: list[VideoResult], total: int, quota_used: int)

5. Crear api/keywords.py:
   - POST /api/v1/keywords/generate (protected)
     Body: { niche: "..." }
     Response: { keywords: [...], niche: "..." }

6. Crear api/search.py:
   - POST /api/v1/search (protected)
     Body: { keywords: [...], filters: {...} }
     Response: { results: [...], total: N, quota_used: N }
   - GET /api/v1/search/history (protected, paginated)

7. Tests:
   - test_keywords.py: mock Claude API, test generation
   - test_search.py: mock YouTube API, test full search flow + outlier calculation

Ejecuta los tests y confirma que pasan.
```

---

## FASE 4 — Frontend React completo

> Pega este prompt en Claude Code:

```
Crea el frontend completo de ViralScout en React + TypeScript. Lee CLAUDE.md para convenciones.

1. Inicializar con Vite:
   npm create vite@latest . -- --template react-ts
   Instalar: tailwindcss, @tanstack/react-query, zustand, react-router, 
   react-hook-form, zod, @hookform/resolvers, recharts, ky, lucide-react

2. Configurar:
   - tailwind.config.ts con tema custom (colores dark theme como el prototipo)
   - vite.config.ts con proxy a backend en dev (/api → http://localhost:8000)
   - tsconfig.json con path aliases (@/ → src/)

3. Crear api/client.ts:
   - Instancia de ky con baseUrl, auth interceptor (Bearer token de localStorage)
   - Error interceptor que redirige a /login en 401

4. Crear api/types.ts con todos los tipos TypeScript que matchean los schemas del backend

5. Crear hooks:
   - useAuth (login, register, logout, user query)
   - useKeywords (mutation generate keywords)
   - useSearch (mutation search videos)
   - useSearchHistory (query paginated)

6. Crear stores/filterStore.ts (Zustand):
   - language, duration, minSubs, maxSubs, dateRange
   - actions: setFilter, resetFilters

7. Crear pages:
   - Home.tsx: landing page con hero, CTA, features preview
   - Login.tsx + Register.tsx: formularios con React Hook Form + Zod
   - Dashboard.tsx: layout principal post-login

8. Crear components (siguiendo el diseño del prototipo dark theme):
   - layout/AppShell.tsx: sidebar + header + main content
   - KeywordGenerator.tsx: 
     Input de nicho → botón generar → pills seleccionables de keywords
   - FilterPanel.tsx:
     Selects de idioma, duración, fecha. Sliders de suscriptores.
   - VideoTable.tsx:
     Tabla sorteable con columnas: título, vistas, outlier score (con barra visual), 
     suscriptores, duración, idioma, fecha. Hover highlight. Click para ordenar.
   - OutlierBadge.tsx: badge coloreado según score (rojo/amber/verde)
   - StatsCards.tsx: grid de métricas (total videos, outlier promedio, más viral, outlier máx)

9. Crear flujo completo en Dashboard:
   Step 1: Input nicho → generar keywords
   Step 2: Seleccionar keywords + configurar filtros → buscar
   Step 3: Ver resultados en tabla con stats cards arriba

10. Responsive design: mobile-first con Tailwind breakpoints

11. Tests con Vitest + Testing Library:
    - Test de renderizado de VideoTable con datos mock
    - Test de FilterPanel cambia estado
    - Test de KeywordGenerator llama a la API

Ejecuta npm run build para verificar que compila sin errores.
```

---

## FASE 5 — CI/CD con GitHub Actions

> Pega este prompt en Claude Code:

```
Configura CI/CD completo con GitHub Actions. Lee CLAUDE.md para convenciones.

1. Crear .github/workflows/ci.yml:
   Trigger: push y PR a main
   Jobs:
   
   backend-lint:
     - Python 3.12
     - pip install ruff
     - ruff check backend/
     - ruff format --check backend/
   
   backend-test:
     - Python 3.12
     - Services: postgres:16, redis:7
     - pip install -r backend/requirements.txt
     - pytest backend/tests --cov=app --cov-report=xml
   
   frontend-lint:
     - Node 20
     - npm ci en frontend/
     - npm run lint
     - npm run type-check
   
   frontend-test:
     - Node 20
     - npm ci en frontend/
     - npm run test -- --run
   
   frontend-build:
     - Node 20
     - npm ci + npm run build
     - Upload artifact del build

2. Crear .github/workflows/deploy.yml:
   Trigger: push a main (solo después de CI success)
   Jobs:
   - Deploy backend a Railway (o Render)
   - Deploy frontend a Vercel
   - Usar secrets de GitHub para API keys

3. Crear docker-compose.prod.yml con overrides de producción:
   - No montar volumes de código
   - Variables de entorno desde secrets
   - Restart: always
   - Resource limits

4. Actualizar README.md con badge de CI status

Haz un commit con mensaje: "ci: add GitHub Actions CI/CD pipeline"
```

---

## FASE 6 — Polish para portfolio

> Pega este prompt en Claude Code:

```
Haz el polish final del proyecto para portfolio profesional.

1. Actualizar README.md:
   - Añadir screenshots reales (placeholder por ahora)
   - Sección "Architecture" con diagrama Mermaid del flujo de datos
   - Sección "Tech decisions" explicando por qué cada tecnología
   - Sección "Lessons learned"
   - Link al deploy en producción

2. Crear CONTRIBUTING.md con:
   - Setup del entorno de desarrollo
   - Guía de estilo de código
   - Proceso de PR
   - Estructura del proyecto

3. Crear docs/ folder:
   - docs/api.md: documentación de todos los endpoints
   - docs/architecture.md: decisiones de arquitectura (ADRs)
   - docs/deployment.md: guía de deploy

4. Crear LICENSE (MIT)

5. Verificar que `docker compose up --build` arranca todo limpio

6. Verificar que todos los tests pasan

7. Hacer git tag v1.0.0

Asegúrate de que el repositorio esté limpio, profesional, y listo para mostrar en entrevistas.
```

---

## TIPS PARA TRABAJAR CON CLAUDE CODE

### Comandos útiles dentro de Claude Code
- `/compact` — comprime el contexto cuando la conversación es larga
- `/clear` — limpia la conversación y empieza fresca
- `@archivo.py` — referencia un archivo específico para que Claude lo lea
- `@folder/` — referencia un directorio entero

### Buenas prácticas
- **Una tarea por prompt**: no pidas 10 cosas a la vez
- **Verifica después de cada fase**: ejecuta tests, haz build, levanta Docker
- **Haz commits frecuentes**: después de cada fase que funcione
- **Si algo falla**: pega el error exacto en Claude Code y pide que lo corrija
- **Branch por feature**: crea una rama antes de cada fase, merge a main cuando funcione

### Flujo de trabajo recomendado
```
1. git checkout -b feat/fase-N
2. Pega el prompt de la fase en Claude Code
3. Revisa los cambios que propone (diffs en VS Code)
4. Acepta o ajusta
5. Ejecuta tests / build / docker compose up
6. Si hay errores → pega el error en Claude Code
7. git add . && git commit -m "feat: descripción"
8. git push origin feat/fase-N
9. Crear PR en GitHub → merge a main
10. git checkout main && git pull
```
