from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.search import ExploreRequest, SearchResponse
from app.services.explore import ExploreService

router = APIRouter(prefix="/explore", tags=["explore"])


@router.post("", response_model=SearchResponse)
async def explore_trending(
    request: ExploreRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    service = ExploreService(db)
    return await service.explore(filters=request.filters)
