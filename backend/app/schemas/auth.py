from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    searches_used: int
    search_limit: int
    created_at: datetime

    @property
    def searches_remaining(self) -> int:
        return max(0, self.search_limit - self.searches_used)

    model_config = {"from_attributes": True}
