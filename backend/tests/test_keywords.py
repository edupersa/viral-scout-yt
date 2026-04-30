from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_generate_keywords_success(auth_client: AsyncClient):
    mock_keywords = ["python tutorial 2024", "learn python fast", "python for beginners"]
    with patch("app.api.keywords.AIService") as MockAI:
        instance = MockAI.return_value
        instance.generate_keywords = AsyncMock(return_value=mock_keywords)
        resp = await auth_client.post(
            "/api/v1/keywords/generate",
            json={"niche": "python programming"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["niche"] == "python programming"
    assert data["keywords"] == mock_keywords


@pytest.mark.asyncio
async def test_generate_keywords_requires_auth(client: AsyncClient):
    resp = await client.post(
        "/api/v1/keywords/generate",
        json={"niche": "python programming"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_generate_keywords_niche_too_short(auth_client: AsyncClient):
    resp = await auth_client.post(
        "/api/v1/keywords/generate",
        json={"niche": "ab"},
    )
    assert resp.status_code == 422
