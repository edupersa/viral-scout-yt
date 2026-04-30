from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.search import KeywordRequest, KeywordResponse
from app.services.ai import AIService

router = APIRouter(prefix="/keywords", tags=["keywords"])


@router.post("/generate", response_model=KeywordResponse)
async def generate_keywords(
    request: KeywordRequest,
    current_user: User = Depends(get_current_user),
) -> KeywordResponse:
    service = AIService()
    keywords = await service.generate_keywords(
        niche=request.niche,
        count=12,
    )
    return KeywordResponse(keywords=keywords, niche=request.niche)
