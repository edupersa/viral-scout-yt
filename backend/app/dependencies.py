from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.database import get_db
from app.models.user import User
from app.services.auth import AuthService
from sqlalchemy.ext.asyncio import AsyncSession

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    service = AuthService(db)
    return await service.get_user_from_token(token)
