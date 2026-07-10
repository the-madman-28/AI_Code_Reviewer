from datetime import datetime, timezone

from sqlmodel import (
    Field,
    SQLModel,
)


# ======================================================
# USER DATABASE MODEL
# ======================================================

class User(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    user_id: str = Field(
        index=True,
        unique=True
    )

    name: str

    password_hash: str

    role: str = Field(
        default="employee"
    )


# ======================================================
# PROJECT DATABASE MODEL
# ======================================================

class Project(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    name: str = Field(
        index=True
    )

    description: str = Field(
        default=""
    )

    primary_language: str = Field(
        index=True
    )

    owner_id: int = Field(
        foreign_key="user.id",
        index=True
    )

    created_at: datetime = Field(
        default_factory=lambda:
            datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda:
            datetime.now(timezone.utc)
    )


# ======================================================
# SOURCE FILE DATABASE MODEL
# ======================================================

class SourceFile(SQLModel, table=True):

    # --------------------------------------------------
    # PRIMARY KEY
    # --------------------------------------------------

    id: int | None = Field(
        default=None,
        primary_key=True
    )


    # --------------------------------------------------
    # ORIGINAL SAFE FILENAME
    # --------------------------------------------------

    filename: str = Field(
        index=True
    )


    # --------------------------------------------------
    # FILE EXTENSION
    # --------------------------------------------------
    #
    # Examples:
    #
    # .py
    # .js
    # .cpp
    #
    # --------------------------------------------------

    extension: str = Field(
        index=True
    )


    # --------------------------------------------------
    # DETECTED LANGUAGE
    # --------------------------------------------------

    language: str = Field(
        index=True
    )


    # --------------------------------------------------
    # SOURCE CODE CONTENT
    # --------------------------------------------------
    #
    # Learning implementation:
    #
    # Source code is stored as text in SQLite.
    #
    # IMPORTANT:
    #
    # We never execute this content.
    #
    # --------------------------------------------------

    content: str


    # --------------------------------------------------
    # SIZE IN BYTES
    # --------------------------------------------------

    size_bytes: int


    # --------------------------------------------------
    # SHA-256 CONTENT HASH
    # --------------------------------------------------

    sha256: str = Field(
        index=True
    )


    # --------------------------------------------------
    # PROJECT RELATIONSHIP
    # --------------------------------------------------

    project_id: int = Field(
        foreign_key="project.id",
        index=True
    )


    # --------------------------------------------------
    # UPLOADER RELATIONSHIP
    # --------------------------------------------------

    uploaded_by: int = Field(
        foreign_key="user.id",
        index=True
    )


    # --------------------------------------------------
    # TIMESTAMP
    # --------------------------------------------------

    created_at: datetime = Field(
        default_factory=lambda:
            datetime.now(timezone.utc)
    )