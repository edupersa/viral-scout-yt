import logging
import re
from datetime import UTC, datetime, timedelta

import httpx

from app.exceptions import ExternalServiceException, QuotaExceededException
from app.services.analyzer import calculate_outlier_score, classify_virality

logger = logging.getLogger(__name__)

_YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

_DURATION_RE = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?")


def _parse_duration(iso: str) -> int:
    m = _DURATION_RE.match(iso or "")
    if not m:
        return 0
    h, mins, s = (int(x or 0) for x in m.groups())
    return h * 3600 + mins * 60 + s


def _published_after(date_range: str | None) -> str | None:
    if not date_range:
        return None
    days = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}[date_range]
    dt = datetime.now(UTC) - timedelta(days=days)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


class YouTubeService:
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self.quota_used = 0

    async def search_video_ids(
        self,
        query: str,
        max_results: int = 50,
        language: str | None = None,
        duration: str | None = None,
        published_after: str | None = None,
    ) -> list[str]:
        """search.list — costs 100 quota units per call."""
        params: dict = {
            "key": self._api_key,
            "part": "id",
            "type": "video",
            "q": query,
            "maxResults": min(max_results, 50),
            "order": "viewCount",
        }
        if language:
            params["relevanceLanguage"] = language
        if duration:
            params["videoDuration"] = duration
        if published_after:
            params["publishedAfter"] = published_after

        data = await self._get("search", params)
        self.quota_used += 100
        return [item["id"]["videoId"] for item in data.get("items", [])]

    async def get_video_details(self, video_ids: list[str]) -> list[dict]:
        """videos.list — costs 1 quota unit per batch of 50."""
        if not video_ids:
            return []
        params = {
            "key": self._api_key,
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(video_ids[:50]),
        }
        data = await self._get("videos", params)
        self.quota_used += 1
        return data.get("items", [])

    async def get_channel_stats(self, channel_ids: list[str]) -> dict[str, dict]:
        """channels.list — costs 1 quota unit per batch of 50. Returns {channel_id: stats}."""
        if not channel_ids:
            return {}
        params = {
            "key": self._api_key,
            "part": "statistics",
            "id": ",".join(set(channel_ids[:50])),
        }
        data = await self._get("channels", params)
        self.quota_used += 1
        return {
            item["id"]: item["statistics"]
            for item in data.get("items", [])
        }

    def enrich_videos(self, video_items: list[dict], channel_stats: dict[str, dict]) -> list[dict]:
        """Merge video details with channel stats and compute outlier scores."""
        enriched = []
        for item in video_items:
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            details = item.get("contentDetails", {})
            channel_id = snippet.get("channelId", "")
            ch_stats = channel_stats.get(channel_id, {})

            views = int(stats.get("viewCount", 0))
            subs = int(ch_stats.get("subscriberCount", 0))

            # Rough channel avg: assume ~4 uploads/month, use last-30-day proxy
            # Real implementation would use channel uploads playlist
            channel_total_views = int(ch_stats.get("viewCount", 0))
            video_count = max(int(ch_stats.get("videoCount", 1)), 1)
            avg_views = channel_total_views / video_count if video_count else 0

            score = calculate_outlier_score(views, avg_views)
            virality = classify_virality(score)

            enriched.append({
                "youtube_id": item["id"],
                "title": snippet.get("title", ""),
                "channel_name": snippet.get("channelTitle", ""),
                "channel_id": channel_id,
                "views": views,
                "subs": subs,
                "avg_channel_views": avg_views,
                "outlier_score": score,
                "virality_class": virality,
                "duration_seconds": _parse_duration(details.get("duration", "")),
                "language": snippet.get("defaultAudioLanguage") or snippet.get("defaultLanguage"),
                "published_at": datetime.fromisoformat(
                    snippet.get("publishedAt", "1970-01-01T00:00:00Z").replace("Z", "+00:00")
                ),
                "thumbnail_url": (
                    snippet.get("thumbnails", {}).get("high", {}).get("url", "")
                    or snippet.get("thumbnails", {}).get("default", {}).get("url", "")
                ),
            })

        enriched.sort(key=lambda v: v["outlier_score"], reverse=True)
        return enriched

    async def _get(self, endpoint: str, params: dict) -> dict:
        url = f"{_YOUTUBE_API_BASE}/{endpoint}"
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(url, params=params)
        except httpx.RequestError as e:
            raise ExternalServiceException("YouTube", str(e))

        if resp.status_code == 403:
            body = resp.json()
            reason = body.get("error", {}).get("errors", [{}])[0].get("reason", "")
            if reason in ("quotaExceeded", "dailyLimitExceeded"):
                raise QuotaExceededException()
            raise ExternalServiceException("YouTube", f"403: {body}")
        if resp.status_code != 200:
            raise ExternalServiceException("YouTube", f"HTTP {resp.status_code}: {resp.text[:200]}")

        return resp.json()
