import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import SearchLimitReachedException
from app.models.user import User
from app.repositories.search_repository import SearchRepository
from app.repositories.user_repository import UserRepository
from app.repositories.video_repository import VideoRepository
from app.schemas.search import SearchFilters, SearchResponse, VideoResult
from app.services.analyzer import classify_virality
from app.services.youtube import YouTubeService

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._video_repo = VideoRepository(db)
        self._search_repo = SearchRepository(db)
        self._user_repo = UserRepository(db)
        self._youtube = YouTubeService(settings.youtube_api_key)

    async def execute_search(
        self,
        user: User,
        niche: str,
        keywords: list[str],
        filters: SearchFilters,
    ) -> SearchResponse:
        if user.searches_used >= user.search_limit:
            raise SearchLimitReachedException(user.searches_used, user.search_limit)
        published_after = None
        if filters.date_range:
            from app.services.youtube import _published_after
            published_after = _published_after(filters.date_range)

        # Search top 3 keywords separately and combine — avoids oversized queries
        seen: set[str] = set()
        video_ids: list[str] = []
        for kw in keywords[:5]:
            ids = await self._youtube.search_video_ids(
                query=kw,
                max_results=settings.max_search_results,
                language=filters.language,
                duration=filters.duration,
                published_after=published_after,
            )
            for vid_id in ids:
                if vid_id not in seen:
                    seen.add(vid_id)
                    video_ids.append(vid_id)

        if not video_ids:
            await self._search_repo.create(
                user_id=user.id,
                niche=niche,
                keywords=keywords,
                filters=filters.model_dump(),
                quota_used=self._youtube.quota_used,
            )
            await self._user_repo.increment_search_count(user.id)
            return SearchResponse(results=[], total=0, quota_used=self._youtube.quota_used)

        video_items = await self._youtube.get_video_details(video_ids)
        channel_ids = [v["snippet"]["channelId"] for v in video_items]
        channel_stats = await self._youtube.get_channel_stats(channel_ids)
        enriched = self._youtube.enrich_videos(video_items, channel_stats)

        # Filter by subscribers and views
        enriched = [
            v for v in enriched
            if filters.min_subs <= v["subs"] <= filters.max_subs
            and v["views"] >= filters.min_views
        ]

        saved_videos = await self._video_repo.upsert_many(enriched)

        search = await self._search_repo.create(
            user_id=user.id,
            niche=niche,
            keywords=keywords,
            filters=filters.model_dump(),
            quota_used=self._youtube.quota_used,
        )
        await self._search_repo.link_videos(
            search_id=search.id,
            video_ids=[v.id for v in saved_videos],
        )
        await self._user_repo.increment_search_count(user.id)

        results = [
            VideoResult(
                **{k: v for k, v in enriched[i].items() if k != "virality_class"},
                id=saved_videos[i].id,
                virality_class=classify_virality(enriched[i]["outlier_score"]),
            )
            for i in range(len(saved_videos))
        ]

        logger.info(
            "Search executed",
            extra={
                "user_id": user.id,
                "niche": niche,
                "results": len(results),
                "quota_used": self._youtube.quota_used,
            },
        )

        return SearchResponse(
            results=results,
            total=len(results),
            quota_used=self._youtube.quota_used,
        )
