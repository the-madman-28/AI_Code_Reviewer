from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from sqlmodel import select

from app.database import (
    SessionDependency,
)

from app.models import User

from app.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)

from app.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    hash_password,
    verify_password,
)


# ======================================================
# AUTH ROUTER
# ======================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ======================================================
# REGISTER
# ======================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(
    request: RegisterRequest,
    session: SessionDependency
):

    user_id = request.user_id.strip()

    name = request.name.strip()


    # --------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------

    if name == "":

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Name cannot be empty"
        )


    # --------------------------------------------------
    # VALIDATE USER ID
    # --------------------------------------------------

    if user_id == "":

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "User ID cannot be empty"
        )


    # --------------------------------------------------
    # CHECK DUPLICATE USER
    # --------------------------------------------------

    statement = select(User).where(
        User.user_id == user_id
    )


    existing_user = session.exec(
        statement
    ).first()


    if existing_user is not None:

        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "User ID already exists"
        )


    # --------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------

    hashed_password = hash_password(
        request.password
    )


    # --------------------------------------------------
    # CREATE USER
    # --------------------------------------------------

    new_user = User(
        user_id=user_id,
        name=name,
        password_hash=hashed_password,
        role="employee",
    )


    session.add(
        new_user
    )

    session.commit()

    session.refresh(
        new_user
    )


    return {
        "success": True,

        "message":
            "Account created successfully",

        "user": {
            "id":
                new_user.id,

            "user_id":
                new_user.user_id,

            "name":
                new_user.name,

            "role":
                new_user.role,
        },
    }


# ======================================================
# LOGIN
# ======================================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    session: SessionDependency
):

    user_id = request.user_id.strip()


    # --------------------------------------------------
    # FIND USER
    # --------------------------------------------------

    statement = select(User).where(
        User.user_id == user_id
    )


    user = session.exec(
        statement
    ).first()


    # --------------------------------------------------
    # USER ID NOT FOUND
    # --------------------------------------------------

    if user is None:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User ID not found"
        )


    # --------------------------------------------------
    # VERIFY PASSWORD
    # --------------------------------------------------

    is_password_correct = verify_password(
        request.password,
        user.password_hash
    )


    # --------------------------------------------------
    # WRONG PASSWORD
    # --------------------------------------------------

    if not is_password_correct:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Incorrect password"
        )


    # --------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------

    access_token = create_access_token(
        subject=user.user_id,
        role=user.role
    )


    # --------------------------------------------------
    # RETURN TOKEN
    # --------------------------------------------------

    return {
        "success": True,

        "message": (
            f"Login successful. "
            f"Welcome {user.name}!"
        ),

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "expires_in":
            ACCESS_TOKEN_EXPIRE_MINUTES * 60,

        "user": {
            "id":
                user.id,

            "user_id":
                user.user_id,

            "name":
                user.name,

            "role":
                user.role,
        },
    }