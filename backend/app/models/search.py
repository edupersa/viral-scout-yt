from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SearchVideo(Base):
    __tablename__ = "search_videos"

    search_id: Mapped[int] = mapped_column(
        ForeignKey("searches.id", ondelete="CASCADE"), primary_key=True
    )
    video_id: Mapped[int] = mapped_column(
        ForeignKey("videos.id", ondelete="CASCADE"), primary_key=True
    )
    rank: Mapped[int] = mapped_column(Integer, default=0)


class Search(Base):
    __tablename__ = "searches"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    niche: Mapped[str] = mapped_column(String(500))
    keywords: Mapped[list] = mapped_column(JSON, default=list)
    filters: Mapped[dict] = mapped_column(JSON, default=dict)
    quota_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="searches")  # noqa: F821
    videos: Mapped[list["Video"]] = relationship(  # noqa: F821
        back_populates="searches", secondary="search_videos"
    )

    def __repr__(self) -> str:
        return f"<Search id={self.id} niche={self.niche!r}>"
