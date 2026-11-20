"""The logged-in user's profile and organisation."""

from typing import Any

from fastapi import APIRouter, HTTPException, status

from ..auth import CurrentUser, UserDb, UserDep
from ..db import Db
from ..schemas import DONOR_ORG_TYPES, RECEIVER_ORG_TYPES, OrganizationCreate

router = APIRouter(prefix="/api", tags=["account"])


async def load_account(db: Db, user: CurrentUser) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    profile = await db.select_one("profiles", {"select": "*", "id": f"eq.{user.id}"})
    org = await db.select_one("organizations", {"select": "*", "owner_id": f"eq.{user.id}"})
    return profile, org


@router.get("/me")
async def me(user: UserDep, db: UserDb):
    profile, org = await load_account(db, user)
    return {"profile": profile, "organization": org}


@router.post("/organizations", status_code=status.HTTP_201_CREATED)
async def create_organization(body: OrganizationCreate, user: UserDep, db: UserDb):
    profile, org = await load_account(db, user)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "We could not find your profile.")
    if profile["role"] == "admin":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Admins do not need an organisation.")
    if org:
        raise HTTPException(status.HTTP_409_CONFLICT, "You have already set up your organisation.")

    allowed = DONOR_ORG_TYPES if profile["role"] == "donor" else RECEIVER_ORG_TYPES
    if body.type not in allowed:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "That organisation type does not match your role.")
    if not body.doc_path.startswith(f"{user.id}/"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "The document must be uploaded to your own folder.")

    return await db.insert(
        "organizations",
        {
            "owner_id": user.id,
            "name": body.name,
            "type": body.type,
            "address": body.address,
            "location": body.ewkt(),
            "doc_path": body.doc_path,
        },
    )
