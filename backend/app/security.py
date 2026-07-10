from datetime import datetime, timedelta, timezone
import os

import jwt
from jwt.exceptions import InvalidTokenError

from pwdlib import PasswordHash


# ======================================================
# PASSWORD HASHING
# ======================================================

password_hash = PasswordHash.recommended()


def hash_password(
    plain_password: str
) -> str:

    return password_hash.hash(
        plain_password
    )


def verify_password(
    plain_password: str,
    stored_password_hash: str
) -> bool:

    return password_hash.verify(
        plain_password,
        stored_password_hash
    )


# ======================================================
# JWT CONFIGURATION
# ======================================================
#
# Learning fallback only.
#
# In production:
# set JWT_SECRET_KEY in environment variables.
#
# ======================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "development-only-change-this-secret-key"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30


# ======================================================
# CREATE ACCESS TOKEN
# ======================================================

def create_access_token(
    subject: str,
    role: str
) -> str:

    now = datetime.now(
        timezone.utc
    )

    expires_at = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": expires_at,
    }

    encoded_token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_token


# ======================================================
# DECODE ACCESS TOKEN
# ======================================================

def decode_access_token(
    token: str
) -> dict:

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload