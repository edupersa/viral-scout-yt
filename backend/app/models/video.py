from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True)
    youtube_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(500))
    channel_name: Mapped[str] = mapped_column(String(255))
    channel_id: Mapped[str] = mapped_column(String(50), index=True)
    views: Mapped[int] = mapped_column(Integer, default=0)
    subs: Mapped[int] = mapped_column(Integer, default=0)
    avg_channel_views: Mapped[float] = mapped_column(Float, default=0.0)
    outlier_score: Mapped[float] = mapped_column(Float, default=0.0)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    thumbnail_url: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    searches: Mapped[list["Search"]] = relationship(  # noqa: F821
        back_populates="videos", secondary="search_videos"
    )

    def __repr__(self) -> str:
        return f"<Video id={self.id} youtube_id={self.youtube_id}>"
