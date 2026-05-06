import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import SearchLimitReachedException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.search import SearchFilters, SearchResponse, VideoResult
from app.services.analyzer import classify_virality
from app.services.youtube import YouTubeService

logger = logging.getLogger(__name__)

_LANGUAGE_TO_REGION: dict[str, str] = {
    "en": "US",
    "es": "MX",
    "pt": "BR",
    "fr": "FR",
    "de": "DE",
}

_DURATION_BOUNDS: dict[str, tuple[int, int]] = {
    "short": (0, 240),
    "medium": (240, 1200),
    "long": (1200, 99_999),
}

# Stop fetching when we reach this many filtered results
_TARGET_RESULTS = 50
# Hard cap on pages to avoid burning quota (each page = ~2 units: videos + channels)
_MAX_PAGES = 8


class ExploreService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._youtube = YouTubeService(settings.youtube_api_key)
        self._user_repo = UserRepository(db)

    async def explore(self, user: User, filters: SearchFilters) -> SearchResponse:
        if user.searches_used >= user.search_limit:
            raise SearchLimitReachedException(user.searches_used, user.search_limit)

        region_code = _LANGUAGE_TO_REGION.get(filters.language or "")

        # ── Layer 1: YouTube API pre-filter ──────────────────────────────────
        # Only regionCode is supported by chart=mostPopular.
        # All other filters are applied by our app after receiving results.

        # ── Layer 2: fetch pages iteratively, stop when target reached ───────
        accumulated: list[dict] = []
        page_token: str | None = None

        for _ in range(_MAX_PAGES):
            video_items, next_token = await self._youtube.get_trending_page(
                region_code=region_code,
                page_token=page_token,
            )

            if not video_items:
                break

            channel_ids = [v["snippet"]["channelId"] for v in video_items]
            channel_stats = await self._youtube.get_channel_stats(channel_ids)
            enriched = self._youtube.enrich_videos(video_items, channel_stats)

            # ── Layer 2: ViralScout post-filters ─────────────────────────────
            filtered = self._apply_post_filters(enriched, filters)
            accumulated.extend(filtered)

            page_token = next_token
            if not page_token or len(accumulated) >= _TARGET_RESULTS:
                break

        await self._user_repo.increment_search_count(user.id)

        final = accumulated[:_TARGET_RESULTS]
        results = [
            VideoResult(
                **{k: v for k, v in item.items() if k != "virality_class"},
                id=idx + 1,
                virality_class=classify_virality(item["outlier_score"]),
            )
            for idx, item in enumerate(final)
        ]

        logger.info(
            "Explore executed",
            extra={"results": len(results), "quota_used": self._youtube.quota_used},
        )

        return SearchResponse(
            results=results,
            total=len(results),
            quota_used=self._youtube.quota_used,
        )

    def _apply_post_filters(self, enriched: list[dict], filters: SearchFilters) -> list[dict]:
        result = enriched

        # Duration category
        if filters.duration:
            low, high = _DURATION_BOUNDS[filters.duration]
            result = [v for v in result if low <= v["duration_seconds"] < high]

        # Date range
        if filters.date_range:
            days = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}[filters.date_range]
            cutoff = datetime.now(UTC) - timedelta(days=days)
            result = [v for v in result if v["published_at"] >= cutoff]

        # Exact duration range (minutes converted to seconds upstream)
        if filters.min_duration > 0 or filters.max_duration is not None:
            result = [
                v for v in result
                if v["duration_seconds"] >= filters.min_duration
                and (filters.max_duration is None or v["duration_seconds"] <= filters.max_duration)
            ]

        # Subscribers and views
        result = [
            v for v in result
            if v["subs"] >= filters.min_subs
            and (filters.max_subs is None or v["subs"] <= filters.max_subs)
            and v["views"] >= filters.min_views
            and (filters.max_views is None or v["views"] <= filters.max_views)
        ]

        return result
