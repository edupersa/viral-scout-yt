from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class KeywordRequest(BaseModel):
    niche: str = Field(min_length=3, max_length=300)
    language: str | None = Field(None, max_length=10, examples=["en", "es"])


class KeywordResponse(BaseModel):
    keywords: list[str]
    niche: str


class SearchFilters(BaseModel):
    language: str | None = Field(None, max_length=10, examples=["es", "en"])
    min_duration: int = Field(0, ge=0)           # seconds
    max_duration: int | None = Field(None, ge=0)  # seconds, None = no limit
    min_subs: int = Field(0, ge=0)
    max_subs: int | None = Field(None, ge=0)      # None = no limit
    min_views: int = Field(0, ge=0)
    max_views: int | None = Field(None, ge=0)     # None = no limit
    date_range: Literal["7d", "30d", "90d", "365d"] | None = None


class ExploreRequest(BaseModel):
    filters: SearchFilters = Field(default_factory=SearchFilters)


class SearchRequest(BaseModel):
    niche: str = Field(min_length=3, max_length=300)
    keywords: list[str] = Field(min_length=1, max_length=12)
    filters: SearchFilters = Field(default_factory=SearchFilters)


class VideoResult(BaseModel):
    id: int
    youtube_id: str
    title: str
    channel_name: str
    channel_id: str
    views: int
    subs: int
    outlier_score: float
    virality_class: Literal["ultra_viral", "very_viral", "normal"]
    duration_seconds: int
    language: str | None
    published_at: datetime
    thumbnail_url: str

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    results: list[VideoResult]
    total: int
    quota_used: int


class SearchHistoryItem(BaseModel):
    id: int
    niche: str
    keywords: list[str]
    filters: dict
    quota_used: int
    created_at: datetime
    video_count: int

    model_config = {"from_attributes": True}


class SearchHistoryResponse(BaseModel):
    items: list[SearchHistoryItem]
    total: int
    limit: int
    offset: int
