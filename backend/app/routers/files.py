import hashlib
import re
from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
    status,
)

from sqlmodel import select

from app.database import (
    SessionDependency,
)

from app.dependencies import (
    CurrentUser,
)

from app.models import (
    Project,
    SourceFile,
)


# ======================================================
# FILE ROUTER
# ======================================================

router = APIRouter(
    prefix="/projects",
    tags=["Source Files"],
)


# ======================================================
# UPLOAD CONFIGURATION
# ======================================================
#
# Maximum:
#
# 1 MiB per source file
#
# ======================================================

MAX_FILE_SIZE = 1024 * 1024


# ======================================================
# ALLOWED EXTENSIONS
# ======================================================

ALLOWED_EXTENSIONS = {
    ".py": "python",

    ".js": "javascript",

    ".jsx": "javascript",

    ".mjs": "javascript",

    ".cjs": "javascript",

    ".cpp": "cpp",

    ".cc": "cpp",

    ".cxx": "cpp",

    ".h": "cpp",

    ".hpp": "cpp",
}


# ======================================================
# SAFE FILENAME PATTERN
# ======================================================
#
# Allows:
#
# app.py
# auth_service.py
# scanner-v2.js
# main.cpp
#
# Rejects suspicious names and path components.
#
# ======================================================

SAFE_FILENAME_PATTERN = re.compile(
    r"^[A-Za-z0-9._-]+$"
)


# ======================================================
# GET OWNED PROJECT
# ======================================================

def get_owned_project(
    project_id: int,
    current_user,
    session
) -> Project:

    statement = select(Project).where(

        Project.id == project_id,

        Project.owner_id ==
        current_user.id

    )


    project = session.exec(
        statement
    ).first()


    if project is None:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "Project not found"
        )


    return project


# ======================================================
# VALIDATE FILENAME
# ======================================================

def validate_filename(
    raw_filename: str | None
) -> tuple[str, str]:

    # --------------------------------------------------
    # MISSING NAME
    # --------------------------------------------------

    if not raw_filename:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Uploaded file must have a filename"
        )


    # --------------------------------------------------
    # REJECT NULL BYTE
    # --------------------------------------------------

    if "\x00" in raw_filename:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid filename"
        )


    # --------------------------------------------------
    # EXTRACT BASENAME
    # --------------------------------------------------
    #
    # Example:
    #
    # ../../secret.py
    #
    # Path(...).name
    #
    # becomes:
    #
    # secret.py
    #
    # We additionally reject if the supplied value
    # was not already a plain filename.
    #
    # --------------------------------------------------

    filename = Path(
        raw_filename
    ).name


    if filename != raw_filename:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Filename must not contain a path"
        )


    # --------------------------------------------------
    # REJECT SPECIAL DIRECTORY NAMES
    # --------------------------------------------------

    if filename in {
        ".",
        ".."
    }:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid filename"
        )


    # --------------------------------------------------
    # VALIDATE CHARACTERS
    # --------------------------------------------------

    if not SAFE_FILENAME_PATTERN.fullmatch(
        filename
    ):

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=(
                "Filename contains unsupported "
                "characters"
            )
        )


    # --------------------------------------------------
    # GET EXTENSION
    # --------------------------------------------------

    extension = (
        Path(filename)
        .suffix
        .lower()
    )


    # --------------------------------------------------
    # VALIDATE EXTENSION
    # --------------------------------------------------

    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=(
                "Unsupported file type. "
                "Allowed extensions: "
                ".py, .js, .jsx, .mjs, .cjs, "
                ".cpp, .cc, .cxx, .h, .hpp"
            )
        )


    return filename, extension


# ======================================================
# UPLOAD SOURCE FILE
# ======================================================
#
# POST:
#
# /projects/{project_id}/files
#
# Request:
#
# multipart/form-data
#
# ======================================================

@router.post(
    "/{project_id}/files",
    status_code=status.HTTP_201_CREATED
)
async def upload_source_file(
    project_id: int,
    current_user: CurrentUser,
    session: SessionDependency,
    file: UploadFile = File(...)
):

    # --------------------------------------------------
    # STEP 1
    # VERIFY PROJECT OWNERSHIP
    # --------------------------------------------------

    project = get_owned_project(
        project_id,
        current_user,
        session
    )


    # --------------------------------------------------
    # STEP 2
    # VALIDATE FILENAME
    # --------------------------------------------------

    filename, extension = (
        validate_filename(
            file.filename
        )
    )


    # --------------------------------------------------
    # STEP 3
    # DETERMINE LANGUAGE
    # --------------------------------------------------

    language = ALLOWED_EXTENSIONS[
        extension
    ]


    # --------------------------------------------------
    # STEP 4
    # OPTIONAL PROJECT LANGUAGE CHECK
    # --------------------------------------------------
    #
    # We do not reject mixed-language projects.
    #
    # Example:
    #
    # Python project may still contain JS frontend.
    #
    # --------------------------------------------------


    # --------------------------------------------------
    # STEP 5
    # READ WITH HARD SIZE LIMIT
    # --------------------------------------------------
    #
    # Read only:
    #
    # MAX_FILE_SIZE + 1
    #
    # This is better than blindly reading
    # an unlimited upload into memory.
    #
    # --------------------------------------------------

    raw_content = await file.read(
        MAX_FILE_SIZE + 1
    )


    # --------------------------------------------------
    # STEP 6
    # CLOSE UPLOAD
    # --------------------------------------------------

    await file.close()


    # --------------------------------------------------
    # STEP 7
    # REJECT OVERSIZED FILE
    # --------------------------------------------------

    if len(raw_content) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,

            detail=
                "File exceeds maximum size of 1 MiB"
        )


    # --------------------------------------------------
    # STEP 8
    # REJECT EMPTY FILE
    # --------------------------------------------------

    if len(raw_content) == 0:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Source file cannot be empty"
        )


    # --------------------------------------------------
    # STEP 9
    # REJECT NULL BYTES
    # --------------------------------------------------
    #
    # Source files should be textual.
    #
    # --------------------------------------------------

    if b"\x00" in raw_content:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Binary content is not allowed"
        )


    # --------------------------------------------------
    # STEP 10
    # UTF-8 DECODE
    # --------------------------------------------------

    try:

        content = raw_content.decode(
            "utf-8"
        )

    except UnicodeDecodeError:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Source file must be valid UTF-8 text"
        )


    # --------------------------------------------------
    # STEP 11
    # CALCULATE SHA-256
    # --------------------------------------------------

    content_hash = hashlib.sha256(
        raw_content
    ).hexdigest()


    # --------------------------------------------------
    # STEP 12
    # CHECK DUPLICATE FILENAME IN PROJECT
    # --------------------------------------------------

    duplicate_statement = (
        select(SourceFile)
        .where(
            SourceFile.project_id ==
            project.id,

            SourceFile.filename ==
            filename
        )
    )


    existing_file = session.exec(
        duplicate_statement
    ).first()


    if existing_file is not None:

        raise HTTPException(
            status_code=
                status.HTTP_409_CONFLICT,

            detail=(
                "A file with this filename "
                "already exists in the project"
            )
        )


    # --------------------------------------------------
    # STEP 13
    # CREATE SOURCE FILE RECORD
    # --------------------------------------------------

    source_file = SourceFile(

        filename=filename,

        extension=extension,

        language=language,

        content=content,

        size_bytes=len(raw_content),

        sha256=content_hash,

        project_id=project.id,

        uploaded_by=current_user.id,
    )


    # --------------------------------------------------
    # STEP 14
    # SAVE
    # --------------------------------------------------

    session.add(
        source_file
    )

    session.commit()

    session.refresh(
        source_file
    )


    # --------------------------------------------------
    # STEP 15
    # SAFE RESPONSE
    # --------------------------------------------------
    #
    # We intentionally do not return
    # the entire source content here.
    #
    # --------------------------------------------------

    return {
        "success": True,

        "message":
            "Source file uploaded successfully",

        "file": {
            "id":
                source_file.id,

            "filename":
                source_file.filename,

            "extension":
                source_file.extension,

            "language":
                source_file.language,

            "size_bytes":
                source_file.size_bytes,

            "sha256":
                source_file.sha256,

            "project_id":
                source_file.project_id,

            "uploaded_by":
                source_file.uploaded_by,

            "created_at":
                source_file.created_at,
        },
    }


# ======================================================
# LIST PROJECT FILES
# ======================================================
#
# GET:
#
# /projects/{project_id}/files
#
# ======================================================

@router.get(
    "/{project_id}/files"
)
def list_project_files(
    project_id: int,
    current_user: CurrentUser,
    session: SessionDependency
):

    # --------------------------------------------------
    # VERIFY OWNERSHIP
    # --------------------------------------------------

    project = get_owned_project(
        project_id,
        current_user,
        session
    )


    # --------------------------------------------------
    # QUERY FILES
    # --------------------------------------------------

    statement = (
        select(SourceFile)
        .where(
            SourceFile.project_id ==
            project.id
        )
        .order_by(
            SourceFile.created_at.desc()
        )
    )


    source_files = session.exec(
        statement
    ).all()


    # --------------------------------------------------
    # METADATA ONLY
    # --------------------------------------------------

    files = []


    for source_file in source_files:

        files.append({

            "id":
                source_file.id,

            "filename":
                source_file.filename,

            "extension":
                source_file.extension,

            "language":
                source_file.language,

            "size_bytes":
                source_file.size_bytes,

            "sha256":
                source_file.sha256,

            "project_id":
                source_file.project_id,

            "uploaded_by":
                source_file.uploaded_by,

            "created_at":
                source_file.created_at,
        })


    return {
        "success": True,

        "total_files":
            len(files),

        "files":
            files,
    }


# ======================================================
# GET ONE SOURCE FILE
# ======================================================
#
# GET:
#
# /projects/{project_id}/files/{file_id}
#
# ======================================================

@router.get(
    "/{project_id}/files/{file_id}"
)
def get_source_file(
    project_id: int,
    file_id: int,
    current_user: CurrentUser,
    session: SessionDependency
):

    # --------------------------------------------------
    # VERIFY PROJECT OWNERSHIP
    # --------------------------------------------------

    project = get_owned_project(
        project_id,
        current_user,
        session
    )


    # --------------------------------------------------
    # FIND FILE INSIDE OWNED PROJECT
    # --------------------------------------------------

    statement = select(SourceFile).where(

        SourceFile.id == file_id,

        SourceFile.project_id ==
        project.id

    )


    source_file = session.exec(
        statement
    ).first()


    if source_file is None:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "Source file not found"
        )


    return {
        "success": True,

        "file": {
            "id":
                source_file.id,

            "filename":
                source_file.filename,

            "extension":
                source_file.extension,

            "language":
                source_file.language,

            "content":
                source_file.content,

            "size_bytes":
                source_file.size_bytes,

            "sha256":
                source_file.sha256,

            "project_id":
                source_file.project_id,

            "uploaded_by":
                source_file.uploaded_by,

            "created_at":
                source_file.created_at,
        },
    }


# ======================================================
# DELETE SOURCE FILE
# ======================================================
#
# DELETE:
#
# /projects/{project_id}/files/{file_id}
#
# ======================================================

@router.delete(
    "/{project_id}/files/{file_id}"
)
def delete_source_file(
    project_id: int,
    file_id: int,
    current_user: CurrentUser,
    session: SessionDependency
):

    # --------------------------------------------------
    # VERIFY PROJECT OWNERSHIP
    # --------------------------------------------------

    project = get_owned_project(
        project_id,
        current_user,
        session
    )


    # --------------------------------------------------
    # FIND FILE
    # --------------------------------------------------

    statement = select(SourceFile).where(

        SourceFile.id == file_id,

        SourceFile.project_id ==
        project.id

    )


    source_file = session.exec(
        statement
    ).first()


    if source_file is None:

        raise HTTPException(
            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "Source file not found"
        )


    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    session.delete(
        source_file
    )

    session.commit()


    return {
        "success": True,

        "message":
            "Source file deleted successfully",

        "deleted_file_id":
            file_id,
    }