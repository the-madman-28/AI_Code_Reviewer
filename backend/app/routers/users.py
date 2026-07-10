from fastapi import APIRouter

from sqlmodel import select

from app.database import (
    SessionDependency,
)

from app.dependencies import (
    CurrentUser,
)

from app.models import User


# ======================================================
# USERS ROUTER
# ======================================================

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ======================================================
# CURRENT AUTHENTICATED USER
# ======================================================
#
# Protected endpoint:
#
# GET /users/me
#
# Requires:
#
# Authorization: Bearer <JWT>
#
# ======================================================

@router.get("/me")
def get_me(
    current_user: CurrentUser
):

    return {
        "success": True,

        "user": {
            "id":
                current_user.id,

            "user_id":
                current_user.user_id,

            "name":
                current_user.name,

            "role":
                current_user.role,
        },
    }


# ======================================================
# GET ALL USERS
# ======================================================
#
# Still public temporarily for learning.
#
# We will protect this with RBAC later.
#
# ======================================================

@router.get("")
def get_users(
    session: SessionDependency
):

    statement = select(User)


    users = session.exec(
        statement
    ).all()


    safe_users = []


    for user in users:

        safe_users.append({
            "id":
                user.id,

            "user_id":
                user.user_id,

            "name":
                user.name,

            "role":
                user.role,
        })


    return {
        "success": True,

        "total_users":
            len(safe_users),

        "users":
            safe_users,
    }