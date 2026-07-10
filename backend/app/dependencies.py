from typing import Annotated

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jwt.exceptions import InvalidTokenError

from sqlmodel import select

from app.database import (
    SessionDependency,
)

from app.models import User

from app.security import (
    decode_access_token,
)


# ======================================================
# BEARER TOKEN READER
# ======================================================

bearer_scheme = HTTPBearer(
    auto_error=False
)


# ======================================================
# GET CURRENT AUTHENTICATED USER
# ======================================================

def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme)
    ],
    session: SessionDependency
) -> User:

    # --------------------------------------------------
    # TOKEN MISSING
    # --------------------------------------------------

    if credentials is None:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authentication required",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }
        )


    token = credentials.credentials


    # --------------------------------------------------
    # DECODE AND VERIFY JWT
    # --------------------------------------------------

    try:

        payload = decode_access_token(
            token
        )

        user_id = payload.get(
            "sub"
        )


        if not user_id:

            raise HTTPException(
                status_code=
                    status.HTTP_401_UNAUTHORIZED,

                detail=
                    "Invalid authentication token",

                headers={
                    "WWW-Authenticate":
                        "Bearer"
                }
            )


    except InvalidTokenError:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired token",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }
        )


    # --------------------------------------------------
    # LOAD CURRENT USER FROM DATABASE
    # --------------------------------------------------

    statement = select(User).where(
        User.user_id == user_id
    )


    user = session.exec(
        statement
    ).first()


    # --------------------------------------------------
    # TOKEN USER NO LONGER EXISTS
    # --------------------------------------------------

    if user is None:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authenticated user no longer exists",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }
        )


    return user


# ======================================================
# REUSABLE CURRENT USER DEPENDENCY
# ======================================================

CurrentUser = Annotated[
    User,
    Depends(get_current_user)
]