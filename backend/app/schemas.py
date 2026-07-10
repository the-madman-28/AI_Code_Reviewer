from datetime import datetime

from pydantic import BaseModel


# ======================================================
# AUTH SCHEMAS
# ======================================================

class RegisterRequest(BaseModel):

    name: str

    user_id: str

    password: str


class LoginRequest(BaseModel):

    user_id: str

    password: str


class UserResponse(BaseModel):

    id: int

    user_id: str

    name: str

    role: str


class TokenResponse(BaseModel):

    success: bool

    message: str

    access_token: str

    token_type: str

    expires_in: int

    user: UserResponse


# ======================================================
# PROJECT SCHEMAS
# ======================================================

class ProjectCreateRequest(BaseModel):

    name: str

    description: str = ""

    primary_language: str


class ProjectUpdateRequest(BaseModel):

    name: str | None = None

    description: str | None = None

    primary_language: str | None = None


class ProjectResponse(BaseModel):

    id: int

    name: str

    description: str

    primary_language: str

    owner_id: int

    created_at: datetime

    updated_at: datetime


# ======================================================
# SOURCE FILE RESPONSE
# ======================================================

class SourceFileResponse(BaseModel):

    id: int

    filename: str

    extension: str

    language: str

    size_bytes: int

    sha256: str

    project_id: int

    uploaded_by: int

    created_at: datetime


# ======================================================
# SOURCE FILE DETAIL RESPONSE
# ======================================================

class SourceFileDetailResponse(
    SourceFileResponse
):

    content: str