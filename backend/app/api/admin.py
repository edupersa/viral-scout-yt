from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not settings.admin_email or current_user.email != settings.admin_email:
        raise ForbiddenException("Admin access required")
    return current_user


class UpdateLimitRequest(BaseModel):
    search_limit: int = Field(ge=0)


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserResponse]:
    repo = UserRepository(db)
    users = await repo.get_all()
    return [UserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}/limit", response_model=UserResponse)
async def update_user_limit(
    user_id: int,
    body: UpdateLimitRequest,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    repo = UserRepository(db)
    user = await repo.set_search_limit(user_id, body.search_limit)
    if user is None:
        from app.exceptions import NotFoundException
        raise NotFoundException("User", user_id)
    return UserResponse.model_validate(user)


@router.post("/users/{user_id}/reset", response_model=UserResponse)
async def reset_user_searches(
    user_id: int,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    repo = UserRepository(db)
    user = await repo.reset_search_count(user_id)
    if user is None:
        from app.exceptions import NotFoundException
        raise NotFoundException("User", user_id)
    return UserResponse.model_validate(user)
