from typing import Literal


def calculate_outlier_score(video_views: int, channel_avg_views: float) -> float:
    if channel_avg_views <= 0:
        return 0.0
    return round(video_views / channel_avg_views, 2)


def classify_virality(score: float) -> Literal["ultra_viral", "very_viral", "normal"]:
    if score >= 10:
        return "ultra_viral"
    if score >= 5:
        return "very_viral"
    return "normal"
