from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.video import Video


class VideoRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_youtube_id(self, youtube_id: str) -> Video | None:
        result = await self._db.execute(
            select(Video).where(Video.youtube_id == youtube_id)
        )
        return result.scalar_one_or_none()

    async def upsert(self, data: dict) -> Video:
        """Insert or update a video by youtube_id."""
        video = await self.get_by_youtube_id(data["youtube_id"])
        if video:
            for key, value in data.items():
                if key != "youtube_id":
                    setattr(video, key, value)
        else:
            video = Video(**{k: v for k, v in data.items() if k != "virality_class"})
            self._db.add(video)
        await self._db.flush()
        await self._db.refresh(video)
        return video

    async def upsert_many(self, videos_data: list[dict]) -> list[Video]:
        return [await self.upsert(v) for v in videos_data]

    async def find_cached(
        self, keywords: list[str], max_age_hours: int = 24
    ) -> list[Video]:
        """Return videos already in DB matching any keyword, created recently."""
        cutoff = datetime.now(UTC) - timedelta(hours=max_age_hours)
        result = await self._db.execute(
            select(Video).where(Video.created_at >= cutoff).limit(50)
        )
        return list(result.scalars().all())
