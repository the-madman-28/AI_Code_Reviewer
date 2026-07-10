from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from sqlmodel import select

from app.database import (
    SessionDependency,
)

from app.dependencies import (
    CurrentUser,
)

from app.models import Project

from app.schemas import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
)


# ======================================================
# PROJECT ROUTER
# ======================================================

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


# ======================================================
# SUPPORTED LANGUAGES
# ======================================================

SUPPORTED_LANGUAGES = {
    "python",
    "javascript",
    "cpp",
}


# ======================================================
# LANGUAGE NORMALIZATION
# ======================================================

def normalize_language(
    language: str
) -> str:

    normalized = (
        language
        .strip()
        .lower()
    )


    aliases = {
        "py": "python",

        "js": "javascript",

        "c++": "cpp",

        "cplusplus": "cpp",
    }


    return aliases.get(
        normalized,
        normalized
    )


# ======================================================
# CREATE PROJECT
# ======================================================
#
# POST /projects
#
# Protected:
# JWT required
#
# ======================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED
)
def create_project(
    request: ProjectCreateRequest,
    current_user: CurrentUser,
    session: SessionDependency
):

    # --------------------------------------------------
    # NORMALIZE INPUT
    # --------------------------------------------------

    name = request.name.strip()

    description = (
        request.description.strip()
    )

    language = normalize_language(
        request.primary_language
    )


    # --------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------

    if name == "":

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Project name cannot be empty"
        )


    # --------------------------------------------------
    # VALIDATE LANGUAGE
    # --------------------------------------------------

    if language not in SUPPORTED_LANGUAGES:

        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=(
                "Unsupported language. "
                "Supported languages: "
                "python, javascript, cpp"
            )
        )


    # --------------------------------------------------
    # CREATE PROJECT
    # --------------------------------------------------

    project = Project(

        name=name,

        description=description,

        primary_language=language,

        owner_id=current_user.id,
    )


    # --------------------------------------------------
    # SAVE PROJECT
    # --------------------------------------------------

    session.add(
        project
    )

    session.commit()

    session.refresh(
        project
    )


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "success": True,

        "message":
            "Project created successfully",

        "project":
            project,
    }


# ======================================================
# LIST CURRENT USER PROJECTS
# ======================================================
#
# GET /projects
#
# Important:
#
# Does NOT return every project.
#
# Only:
#
# Project.owner_id == current_user.id
#
# ======================================================

@router.get("")
def list_projects(
    current_user: CurrentUser,
    session: SessionDependency
):

    statement = (
        select(Project)
        .where(
            Project.owner_id ==
            current_user.id
        )
        .order_by(
            Project.created_at.desc()
        )
    )


    projects = session.exec(
        statement
    ).all()


    return {
        "success": True,

        "total_projects":
            len(projects),

        "projects":
            projects,
    }


# ======================================================
# GET ONE PROJECT
# ======================================================
#
# GET /projects/{project_id}
#
# Ownership enforced directly in query.
#
# ======================================================

@router.get("/{project_id}")
def get_project(
    project_id: int,
    current_user: CurrentUser,
    session: SessionDependency
):

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


    return {
        "success": True,

        "project":
            project,
    }


# ======================================================
# UPDATE PROJECT
# ======================================================
#
# PATCH /projects/{project_id}
#
# ======================================================

@router.patch("/{project_id}")
def update_project(
    project_id: int,
    request: ProjectUpdateRequest,
    current_user: CurrentUser,
    session: SessionDependency
):

    # --------------------------------------------------
    # FIND OWNED PROJECT
    # --------------------------------------------------

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


    # --------------------------------------------------
    # UPDATE NAME
    # --------------------------------------------------

    if request.name is not None:

        name = request.name.strip()


        if name == "":

            raise HTTPException(
                status_code=
                    status.HTTP_400_BAD_REQUEST,

                detail=
                    "Project name cannot be empty"
            )


        project.name = name


    # --------------------------------------------------
    # UPDATE DESCRIPTION
    # --------------------------------------------------

    if request.description is not None:

        project.description = (
            request.description.strip()
        )


    # --------------------------------------------------
    # UPDATE LANGUAGE
    # --------------------------------------------------

    if request.primary_language is not None:

        language = normalize_language(
            request.primary_language
        )


        if language not in SUPPORTED_LANGUAGES:

            raise HTTPException(
                status_code=
                    status.HTTP_400_BAD_REQUEST,

                detail=(
                    "Unsupported language. "
                    "Supported languages: "
                    "python, javascript, cpp"
                )
            )


        project.primary_language = (
            language
        )


    # --------------------------------------------------
    # UPDATE TIMESTAMP
    # --------------------------------------------------

    project.updated_at = (
        datetime.now(timezone.utc)
    )


    # --------------------------------------------------
    # SAVE
    # --------------------------------------------------

    session.add(
        project
    )

    session.commit()

    session.refresh(
        project
    )


    return {
        "success": True,

        "message":
            "Project updated successfully",

        "project":
            project,
    }


# ======================================================
# DELETE PROJECT
# ======================================================
#
# DELETE /projects/{project_id}
#
# ======================================================

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: CurrentUser,
    session: SessionDependency
):

    # --------------------------------------------------
    # FIND OWNED PROJECT
    # --------------------------------------------------

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


    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    session.delete(
        project
    )

    session.commit()


    return {
        "success": True,

        "message":
            "Project deleted successfully",

        "deleted_project_id":
            project_id,
    }