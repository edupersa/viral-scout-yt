import json
from typing import Any

from pydantic.fields import FieldInfo
from pydantic_settings import BaseSettings, EnvSettingsSource, SettingsConfigDict


class _CommaListEnvSource(EnvSettingsSource):
    """EnvSettingsSource que acepta listas como CSV además de JSON."""

    def decode_complex_value(self, field_name: str, field: FieldInfo, value: Any) -> Any:
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return [v.strip() for v in value.split(",") if v.strip()]
        return super().decode_complex_value(field_name, field, value)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: Any,
        env_settings: Any,
        dotenv_settings: Any,
        file_secret_settings: Any,
    ) -> tuple[Any, ...]:
        return (init_settings, _CommaListEnvSource(settings_cls), file_secret_settings)

    # Database
    database_url: str = "postgresql+asyncpg://viralscout:viralscout@localhost:5432/viralscout"
    database_url_sync: str = "postgresql://viralscout:viralscout@localhost:5432/viralscout"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # External APIs
    youtube_api_key: str = ""
    gemini_api_key: str = ""

    # Auth
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # App
    environment: str = "development"
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    api_v1_prefix: str = "/api/v1"

    # Limits
    youtube_daily_quota: int = 10_000
    max_keywords_per_request: int = 12
    max_search_results: int = 50


settings = Settings()
