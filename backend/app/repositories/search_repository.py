from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.search import Search, SearchVideo
from app.models.video import Video


class SearchRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        user_id: int,
        niche: str,
        keywords: list[str],
        filters: dict,
        quota_used: int,
    ) -> Search:
        search = Search(
            user_id=user_id,
            niche=niche,
            keywords=keywords,
            filters=filters,
            quota_used=quota_used,
        )
        self._db.add(search)
        await self._db.flush()
        return search

    async def link_videos(self, search_id: int, video_ids: list[int]) -> None:
        for rank, vid_id in enumerate(video_ids):
            self._db.add(SearchVideo(search_id=search_id, video_id=vid_id, rank=rank))
        await self._db.flush()

    async def get_history(
        self, user_id: int, limit: int = 20, offset: int = 0
    ) -> tuple[list[Search], int]:
        total_result = await self._db.execute(
            select(func.count()).where(Search.user_id == user_id).select_from(Search)
        )
        total = total_result.scalar_one()

        result = await self._db.execute(
            select(Search)
            .where(Search.user_id == user_id)
            .options(selectinload(Search.videos))
            .order_by(Search.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total
