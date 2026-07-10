from contextlib import asynccontextmanager

from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from app.database import (
    create_db_and_tables,
)

from app.routers import (
    auth,
    files,
    projects,
    users,
)


# ======================================================
# APPLICATION LIFESPAN
# ======================================================
#
# Runs startup logic before the application
# begins accepting requests.
#
# ======================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    # --------------------------------------------------
    # STARTUP
    # --------------------------------------------------

    create_db_and_tables()


    yield


    # --------------------------------------------------
    # SHUTDOWN
    # --------------------------------------------------
    #
    # Nothing required here yet.
    #
    # --------------------------------------------------


# ======================================================
# CREATE FASTAPI APPLICATION
# ======================================================

app = FastAPI(

    title=
        "Authentication Learning API",

    description=(
        "Multi-file authentication backend "
        "with SQLite, SQLModel, and "
        "secure password hashing"
    ),

    version=
        "4.0.0",

    lifespan=
        lifespan,
)


# ======================================================
# CORS CONFIGURATION
# ======================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",

        # Keep temporarily if old frontend is used
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ======================================================
# CONNECT ROUTERS
# ======================================================

app.include_router(
    auth.router
)


app.include_router(
    users.router
)

app.include_router(
    projects.router)

app.include_router(
    files.router
)


# ======================================================
# ROOT ENDPOINT
# ======================================================

@app.get("/")
def home():

    return {
        "success": True,

        "message":
            "Backend is running",

        "phase":
            "Phase 4A",

        "architecture":
            "Multi-file backend",

        "features": [
            "SQLite Persistence",
            "SQLModel ORM",
            "Argon2 Password Hashing",
            "User Registration",
            "User Login",
            "Modular Routers",
        ],
    }


# ======================================================
# HEALTH ENDPOINT
# ======================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",

        "database":
            "SQLite",

        "password_storage":
            "Argon2 hash",

        "architecture":
            "modular",
    }