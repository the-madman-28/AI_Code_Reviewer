from typing import Annotated, Generator

from fastapi import Depends

from sqlmodel import (
    Session,
    SQLModel,
    create_engine,
)


# ======================================================
# DATABASE URL
# ======================================================
#
# sqlite:///auth.db
#
# Means:
#
# Database type:
# SQLite
#
# Database file:
# auth.db
#
# ======================================================

DATABASE_URL = "sqlite:///auth.db"


# ======================================================
# SQLITE CONNECTION ARGUMENTS
# ======================================================

connect_args = {
    "check_same_thread": False
}


# ======================================================
# CREATE DATABASE ENGINE
# ======================================================
#
# echo=True
#
# Prints generated SQL queries in the terminal.
# Useful while learning.
#
# ======================================================

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=True,
)


# ======================================================
# CREATE DATABASE TABLES
# ======================================================

def create_db_and_tables() -> None:

    SQLModel.metadata.create_all(
        engine
    )


# ======================================================
# DATABASE SESSION DEPENDENCY
# ======================================================
#
# Every request that needs database access receives
# its own Session.
#
# Example:
#
# Request starts
#      ↓
# Session created
#      ↓
# Route uses database
#      ↓
# Request finishes
#      ↓
# Session closes
#
# ======================================================

def get_session() -> Generator[
    Session,
    None,
    None
]:

    with Session(engine) as session:

        yield session


# ======================================================
# REUSABLE SESSION DEPENDENCY TYPE
# ======================================================

SessionDependency = Annotated[
    Session,
    Depends(get_session)
]