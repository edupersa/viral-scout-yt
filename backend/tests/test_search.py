from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.services.analyzer import calculate_outlier_score, classify_virality

# ── Unit tests for analyzer ─────────────────────────────────────────────────

def test_outlier_score_normal():
    assert calculate_outlier_score(10_000, 10_000) == 1.0


def test_outlier_score_ultra_viral():
    assert calculate_outlier_score(1_000_000, 50_000) == 20.0


def test_outlier_score_zero_avg():
    assert calculate_outlier_score(100_000, 0) == 0.0


def test_classify_ultra_viral():
    assert classify_virality(10.0) == "ultra_viral"
    assert classify_virality(25.0) == "ultra_viral"


def test_classify_very_viral():
    assert classify_virality(5.0) == "very_viral"
    assert classify_virality(9.9) == "very_viral"


def test_classify_normal():
    assert classify_virality(1.0) == "normal"
    assert classify_virality(4.9) == "normal"


# ── Integration tests for search endpoint ───────────────────────────────────

_MOCK_VIDEO_ITEM = {
    "id": "abc123",
    "snippet": {
        "title": "Python Tutorial 2024",
        "channelTitle": "CodeChannel",
        "channelId": "ch001",
        "publishedAt": "2024-01-15T10:00:00Z",
        "thumbnails": {"high": {"url": "https://img.youtube.com/vi/abc123/hqdefault.jpg"}},
        "defaultAudioLanguage": "en",
    },
    "statistics": {"viewCount": "500000"},
    "contentDetails": {"duration": "PT15M30S"},
}

_MOCK_CHANNEL_STATS = {
    "ch001": {"subscriberCount": "50000", "viewCount": "5000000", "videoCount": "100"}
}


@pytest.mark.asyncio
async def test_search_success(auth_client: AsyncClient):
    with (
        patch("app.services.search.YouTubeService") as MockYT,
    ):
        instance = MockYT.return_value
        instance.quota_used = 102
        instance.search_video_ids = AsyncMock(return_value=["abc123"])
        instance.get_video_details = AsyncMock(return_value=[_MOCK_VIDEO_ITEM])
        instance.get_channel_stats = AsyncMock(return_value=_MOCK_CHANNEL_STATS)
        instance.enrich_videos = lambda items, stats: [
            {
                "youtube_id": "abc123",
                "title": "Python Tutorial 2024",
                "channel_name": "CodeChannel",
                "channel_id": "ch001",
                "views": 500000,
                "subs": 50000,
                "avg_channel_views": 50000.0,
                "outlier_score": 10.0,
                "virality_class": "ultra_viral",
                "duration_seconds": 930,
                "language": "en",
                "published_at": datetime(2024, 1, 15, 10, 0, 0, tzinfo=timezone.utc),
                "thumbnail_url": "https://img.youtube.com/vi/abc123/hqdefault.jpg",
            }
        ]
        resp = await auth_client.post(
            "/api/v1/search",
            json={
                "niche": "python programming",
                "keywords": ["python tutorial"],
                "filters": {},
            },
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["results"][0]["youtube_id"] == "abc123"
    assert data["results"][0]["virality_class"] == "ultra_viral"
    assert data["quota_used"] == 102


@pytest.mark.asyncio
async def test_search_requires_auth(client: AsyncClient):
    resp = await client.post(
        "/api/v1/search",
        json={"niche": "test", "keywords": ["test"], "filters": {}},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_search_history_empty(auth_client: AsyncClient):
    resp = await auth_client.get("/api/v1/search/history")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
