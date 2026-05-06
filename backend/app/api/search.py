from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.search import (
    SearchHistoryItem,
    SearchHistoryResponse,
    SearchRequest,
    SearchResponse,
)
from app.repositories.search_repository import SearchRepository
from app.services.search import SearchService

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_videos(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    service = SearchService(db)
    return await service.execute_search(
        user=current_user,
        niche=request.niche,
        keywords=request.keywords,
        filters=request.filters,
    )


@router.get("/history", response_model=SearchHistoryResponse)
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchHistoryResponse:
    repo = SearchRepository(db)
    searches, total = await repo.get_history(
        user_id=current_user.id, limit=limit, offset=offset
    )
    items = [
        SearchHistoryItem(
            id=s.id,
            niche=s.niche,
            keywords=s.keywords,
            filters=s.filters,
            quota_used=s.quota_used,
            created_at=s.created_at,
            video_count=len(s.videos),
        )
        for s in searches
    ]
    return SearchHistoryResponse(items=items, total=total, limit=limit, offset=offset)
