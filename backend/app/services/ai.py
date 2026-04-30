import json
import logging

from google import genai

from app.config import settings
from app.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)

_KEYWORD_PROMPT = """\
You are an expert YouTube content strategist. Generate {count} search keywords \
to find viral videos in the following niche: "{niche}"

Rules:
- Keywords must be specific enough to find real YouTube videos
- Mix short (2-3 words) and long-tail (4-6 words) keywords
- Focus on keywords that would have high search volume on YouTube
- Include variations: tutorials, reviews, tips, how-to, best, etc.
- Return ONLY a valid JSON array of strings, no explanation

Example output:
["keyword one", "keyword two", "keyword three"]
"""


class AIService:
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def generate_keywords(self, niche: str, count: int = 12) -> list[str]:
        """Generate YouTube search keywords for the given niche using Gemini."""
        prompt = _KEYWORD_PROMPT.format(niche=niche, count=count)
        try:
            response = self._client.models.generate_content(
                model="gemini-2.0-flash", contents=prompt
            )
            raw = response.text.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            keywords = json.loads(raw.strip())
            if not isinstance(keywords, list):
                raise ValueError("Expected a JSON array")
            return [str(k).strip() for k in keywords if k][:count]
        except json.JSONDecodeError as e:
            logger.error("Gemini returned invalid JSON", extra={"niche": niche, "error": str(e)})
            raise ExternalServiceException("Gemini", f"Invalid JSON response: {e}")
        except Exception as e:
            logger.error("Gemini API error", extra={"niche": niche, "error": str(e)})
            raise ExternalServiceException("Gemini", str(e))
