import json
import logging

from google import genai
from google.genai import errors
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.config import settings
from app.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"

_LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "es": "Spanish",
    "pt": "Portuguese",
    "fr": "French",
    "de": "German",
}

_KEYWORD_PROMPT = """\
You are an expert YouTube content strategist. Generate {count} search keywords \
to find viral videos in the following niche: "{niche}"

Target language: {language_instruction}
All keywords MUST be written in that language — do not mix languages.

Rules:
- Keywords must be specific enough to find real YouTube videos
- Mix short (2-3 words) and long-tail (4-6 words) keywords
- Focus on keywords that would have high search volume on YouTube
- Include variations: tutorials, reviews, tips, how-to, best, etc.
- Return ONLY a valid JSON array of strings, no explanation

Example output:
["keyword one", "keyword two", "keyword three"]
"""


def _is_retryable(exc: BaseException) -> bool:
    if isinstance(exc, errors.ServerError):
        return True
    if isinstance(exc, errors.ClientError) and getattr(exc, "status_code", None) == 429:
        return "PerDay" not in str(exc)
    return False


class AIService:
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def generate_keywords(
        self, niche: str, language: str | None = None, count: int = 12
    ) -> list[str]:
        """Generate YouTube search keywords for the given niche using Gemini."""
        if language and language in _LANGUAGE_NAMES:
            language_instruction = _LANGUAGE_NAMES[language]
        else:
            language_instruction = "the same language as the niche description"
        prompt = _KEYWORD_PROMPT.format(
            niche=niche, count=count, language_instruction=language_instruction
        )
        try:
            raw = self._call_gemini(prompt)
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            keywords = json.loads(raw.strip())
            if not isinstance(keywords, list):
                raise ValueError("Expected a JSON array")
            return [str(k).strip() for k in keywords if k][:count]
        except json.JSONDecodeError as e:
            logger.error("Gemini returned invalid JSON", extra={"niche": niche})
            raise ExternalServiceException("Gemini", f"Invalid JSON response: {e}")
        except ExternalServiceException:
            raise
        except Exception as e:
            logger.error("Gemini API error", extra={"niche": niche, "error": str(e)})
            raise ExternalServiceException("Gemini", str(e))

    @retry(
        retry=retry_if_exception(_is_retryable),
        wait=wait_exponential(multiplier=2, min=4, max=30),
        stop=stop_after_attempt(4),
        reraise=True,
    )
    def _call_gemini(self, prompt: str) -> str:
        try:
            response = self._client.models.generate_content(
                model=_MODEL, contents=prompt
            )
            return response.text.strip()
        except errors.ClientError as exc:
            if "PerDay" in str(exc):
                raise ExternalServiceException(
                    "Gemini", "Daily quota exceeded. Please try again tomorrow."
                ) from exc
            raise
