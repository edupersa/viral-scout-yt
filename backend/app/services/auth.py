import logging
from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import ConflictException, UnauthorizedException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserResponse

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire, "iat": datetime.now(UTC)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise UnauthorizedException("Invalid or expired token")


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    async def register(self, email: str, password: str) -> UserResponse:
        existing = await self._repo.get_by_email(email)
        if existing:
            raise ConflictException("Email already registered")
        hashed = hash_password(password)
        user = await self._repo.create(email=email, hashed_password=hashed)
        logger.info("User registered", extra={"user_id": user.id, "email": user.email})
        return UserResponse.model_validate(user)

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self._repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedException("Account is disabled")
        token = create_access_token(user.id)
        return TokenResponse(access_token=token)

    async def get_user_from_token(self, token: str) -> User:
        payload = _decode_token(token)
        user_id = int(payload["sub"])
        user = await self._repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")
        return user
