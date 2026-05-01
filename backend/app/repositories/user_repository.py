from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self._db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, email: str, hashed_password: str) -> User:
        user = User(email=email, hashed_password=hashed_password)
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user)
        return user

    async def get_all(self) -> list[User]:
        result = await self._db.execute(select(User).order_by(User.id))
        return list(result.scalars().all())

    async def increment_search_count(self, user_id: int) -> None:
        await self._db.execute(
            update(User)
            .where(User.id == user_id)
            .values(searches_used=User.searches_used + 1)
        )

    async def set_search_limit(self, user_id: int, limit: int) -> User | None:
        await self._db.execute(
            update(User).where(User.id == user_id).values(search_limit=limit)
        )
        return await self.get_by_id(user_id)

    async def reset_search_count(self, user_id: int) -> User | None:
        await self._db.execute(
            update(User).where(User.id == user_id).values(searches_used=0)
        )
        return await self.get_by_id(user_id)
