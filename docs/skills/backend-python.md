# Backend Python — Coding standards

## Architecture layers

Follow strict separation. Each layer only talks to the one below it:

```
api/ (routes)  →  services/ (logic)  →  repositories/ (data)  →  models/ (ORM)
     ↓                  ↓                      ↓
  schemas/          exceptions.py          database.py
  (Pydantic)
```

- **api/** — thin route handlers. Validate input, call service, return response. NO business logic here.
- **services/** — all business logic. Orchestrate repos, external APIs, calculations. Raise domain exceptions.
- **repositories/** — all database queries. One repo per model. Accept and return ORM models. NO HTTP concepts here.
- **models/** — SQLAlchemy ORM definitions only. No methods beyond `__repr__`.
- **schemas/** — Pydantic DTOs. Separate schemas for Create, Update, Response. Never expose ORM models directly.

## FastAPI patterns

### Route handlers must be thin
```python
# ✅ CORRECT — thin handler, logic in service
@router.post("/search", response_model=SearchResponse)
async def search_videos(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    service = SearchService(db)
    return await service.execute_search(
        user_id=current_user.id,
        keywords=request.keywords,
        filters=request.filters,
    )

# ❌ WRONG — business logic in handler
@router.post("/search")
async def search_videos(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    videos = await db.execute(select(Video).where(...))  # DB query in handler
    for v in videos:
        v.outlier_score = v.views / v.avg_views  # Logic in handler
    return videos
```

### Dependency injection via Depends()
```python
# dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = verify_token(token)
    user = await UserRepository(db).get_by_id(payload["sub"])
    if not user or not user.is_active:
        raise UnauthorizedException("Invalid or inactive user")
    return user
```

### Service classes — stateless, receive dependencies
```python
class SearchService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._video_repo = VideoRepository(db)
        self._search_repo = SearchRepository(db)
        self._youtube = YouTubeService(settings.youtube_api_key)

    async def execute_search(
        self, user_id: int, keywords: list[str], filters: SearchFilters
    ) -> SearchResponse:
        # 1. Check cache first
        cached = await self._video_repo.find_by_keywords(keywords)
        if cached:
            return self._build_response(cached, quota_used=0)

        # 2. Call YouTube API
        raw_videos = await self._youtube.search(keywords, filters)

        # 3. Enrich with outlier scores
        enriched = await self._enrich_with_scores(raw_videos)

        # 4. Persist
        await self._video_repo.upsert_many(enriched)
        search = await self._search_repo.create(user_id, keywords, filters)

        return self._build_response(enriched, quota_used=self._youtube.last_quota_cost)
```

### Repository pattern — encapsulate all DB queries
```python
class VideoRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_youtube_id(self, youtube_id: str) -> Video | None:
        stmt = select(Video).where(Video.youtube_id == youtube_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_many(self, videos: list[VideoCreate]) -> list[Video]:
        """Insert or update videos. Uses ON CONFLICT for idempotency."""
        # implementation...

    async def find_by_keywords(
        self, keywords: list[str], max_age_hours: int = 24
    ) -> list[Video]:
        """Find cached videos matching keywords, not older than max_age_hours."""
        # implementation...
```

## Error handling

### Custom exception hierarchy
```python
# exceptions.py
class AppException(Exception):
    """Base for all domain exceptions."""
    def __init__(self, message: str, code: str, status_code: int = 400) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code

class NotFoundException(AppException):
    def __init__(self, resource: str, identifier: str | int) -> None:
        super().__init__(f"{resource} '{identifier}' not found", "NOT_FOUND", 404)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Not authenticated") -> None:
        super().__init__(message, "UNAUTHORIZED", 401)

class QuotaExceededException(AppException):
    def __init__(self) -> None:
        super().__init__("YouTube API daily quota exceeded", "QUOTA_EXCEEDED", 429)

class ExternalServiceException(AppException):
    def __init__(self, service: str, detail: str) -> None:
        super().__init__(f"{service} error: {detail}", "EXTERNAL_ERROR", 502)
```

### Global exception handler in main.py
```python
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )
```

### NEVER use bare except. ALWAYS catch specific exceptions.
```python
# ✅ CORRECT
try:
    data = await youtube_client.search(query)
except HttpError as e:
    if e.resp.status == 403:
        raise QuotaExceededException()
    raise ExternalServiceException("YouTube", str(e))

# ❌ WRONG
try:
    data = await youtube_client.search(query)
except Exception:
    return {"error": "something went wrong"}  # swallows the error
```

## Pydantic schemas

### Separate Create / Update / Response schemas
```python
# schemas/video.py
class VideoBase(BaseModel):
    """Shared fields."""
    title: str
    channel_name: str
    views: int = Field(ge=0)
    duration_seconds: int = Field(ge=0)

class VideoCreate(VideoBase):
    """For creating/upserting from YouTube API."""
    youtube_id: str
    channel_id: str
    thumbnail_url: HttpUrl
    published_at: datetime

class VideoResponse(VideoBase):
    """API response — includes computed fields."""
    id: int
    youtube_id: str
    outlier_score: float
    virality_class: str  # "ultra_viral" | "very_viral" | "normal"
    published_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### Use Field() for validation constraints
```python
class SearchFilters(BaseModel):
    language: str | None = Field(None, max_length=5, examples=["es", "en"])
    duration: Literal["short", "medium", "long"] | None = None
    min_subs: int = Field(0, ge=0)
    max_subs: int = Field(1_000_000, ge=0)
    date_range: Literal["7d", "30d", "90d", "365d"] | None = None
```

## SQLAlchemy models

### Use mapped_column with explicit types
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    searches: Mapped[list["Search"]] = relationship(back_populates="user")
```

## Async everywhere

- ALL IO operations must be async: database, HTTP calls, Redis
- Use `httpx.AsyncClient` for external API calls (YouTube, Claude)
- Use `AsyncSession` for SQLAlchemy
- Use `aioredis` / `redis.asyncio` for Redis

## Logging

```python
import logging

logger = logging.getLogger(__name__)

# ✅ Structured logging with context
logger.info("Search executed", extra={"user_id": user.id, "keywords": keywords, "results": len(videos)})

# ❌ NEVER log sensitive data
logger.info(f"User logged in with password {password}")  # NEVER
```

## Type hints

- Type hints on ALL function signatures — no exceptions
- Use `X | None` instead of `Optional[X]`
- Use `list[str]` instead of `List[str]` (Python 3.12)
- Return type on every function

## Testing

- Tests in `tests/` mirroring the app structure
- Use `pytest-asyncio` for async tests
- Fixtures for: test DB session, authenticated HTTP client, mock YouTube responses
- Test the service layer primarily — that's where logic lives
- Integration tests for API endpoints (full request → response)
- Mock external services (YouTube API, Claude API) — never call real APIs in tests
