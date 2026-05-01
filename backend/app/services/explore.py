import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
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
    "long": (1200, 99999),
}


class ExploreService:
    def __init__(self, db: AsyncSession) -> None:
        self._youtube = YouTubeService(settings.youtube_api_key)

    async def explore(self, filters: SearchFilters) -> SearchResponse:
        region_code = _LANGUAGE_TO_REGION.get(filters.language or "")

        video_items = await self._youtube.get_trending_videos(
            max_results=50,
            region_code=region_code,
        )

        if not video_items:
            return SearchResponse(results=[], total=0, quota_used=self._youtube.quota_used)

        channel_ids = [v["snippet"]["channelId"] for v in video_items]
        channel_stats = await self._youtube.get_channel_stats(channel_ids)
        enriched = self._youtube.enrich_videos(video_items, channel_stats)

        # Post-filter: duration
        if filters.duration:
            low, high = _DURATION_BOUNDS[filters.duration]
            enriched = [v for v in enriched if low <= v["duration_seconds"] < high]

        # Post-filter: date range
        if filters.date_range:
            days = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}[filters.date_range]
            cutoff = datetime.now(UTC) - timedelta(days=days)
            enriched = [v for v in enriched if v["published_at"] >= cutoff]

        # Post-filter: subscribers
        enriched = [
            v for v in enriched
            if filters.min_subs <= v["subs"] <= filters.max_subs
        ]

        results = [
            VideoResult(
                **{k: v for k, v in item.items() if k != "virality_class"},
                id=idx + 1,
                virality_class=classify_virality(item["outlier_score"]),
            )
            for idx, item in enumerate(enriched)
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
