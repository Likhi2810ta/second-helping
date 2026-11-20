"""Food listings: nearby search, donor posting and management, receiver requests."""

from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from ..auth import PublicDb, UserDb, UserDep
from ..schemas import Category, Diet, ListingCreate, PickupRequestCreate
from .account import load_account

router = APIRouter(prefix="/api/listings", tags=["listings"])

MY_LISTINGS_SELECT = (
    "*, pickup_requests(id, status, message, eta_minutes, requested_at, completed_at, rating, organizations(name))"
)


@router.get("/nearby")
async def nearby(
    db: PublicDb,
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius_km: float = Query(10, gt=0, le=50),
    diet: Diet | None = None,
    category: Category | None = None,
    sort: Literal["distance", "expiry"] = "distance",
):
    rows = await db.rpc(
        "nearby_listings",
        {"lat": lat, "lng": lng, "radius_km": radius_km, "p_diet": diet, "p_category": category},
    )
    rows = rows or []
    if sort == "expiry":
        rows.sort(key=lambda r: r["expires_at"])
    return rows


@router.get("/mine")
async def my_listings(user: UserDep, db: UserDb):
    _, org = await load_account(db, user)
    if not org:
        return []
    return await db.select(
        "listings",
        {"select": MY_LISTINGS_SELECT, "donor_org_id": f"eq.{org['id']}", "order": "created_at.desc"},
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_listing(body: ListingCreate, user: UserDep, db: UserDb):
    profile, org = await load_account(db, user)
    if not profile or profile["role"] != "donor":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only donors can post food.")
    if not org:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please set up your organisation first.")
    if org["status"] != "verified":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Posting unlocks after admin approval.")
    if body.photo_path and not body.photo_path.startswith(f"{user.id}/"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "The photo must be uploaded to your own folder.")

    now = datetime.now(timezone.utc)
    return await db.insert(
        "listings",
        {
            "donor_org_id": org["id"],
            "title": body.title,
            "description": body.description or None,
            "category": body.category,
            "diet": body.diet,
            "portions": body.portions,
            "photo_path": body.photo_path or None,
            "prepared_at": now.isoformat(),
            "expires_at": (now + timedelta(hours=body.hours_valid)).isoformat(),
            "address": body.address,
            "location": body.ewkt(),
            "pickup_note": body.pickup_note or None,
        },
    )


@router.get("/{listing_id}")
async def listing_detail(listing_id: UUID, db: UserDb):
    rows = await db.rpc("listing_detail", {"p_listing": str(listing_id)})
    if not rows:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This listing is no longer available.")
    return rows[0]


@router.post("/{listing_id}/withdraw")
async def withdraw_listing(listing_id: UUID, db: UserDb):
    # Only a listing nobody has requested yet can be withdrawn. RLS makes sure
    # it belongs to the caller; the status filter avoids racing a new request.
    rows = await db.update(
        "listings",
        {"id": f"eq.{listing_id}", "status": "eq.available"},
        {"status": "cancelled"},
    )
    if not rows:
        raise HTTPException(status.HTTP_409_CONFLICT, "This listing just changed. Please check its status.")
    return rows[0]


@router.post("/{listing_id}/request", status_code=status.HTTP_201_CREATED)
async def request_pickup(listing_id: UUID, body: PickupRequestCreate, db: UserDb):
    request_id = await db.rpc(
        "request_pickup",
        {"p_listing": str(listing_id), "p_message": body.message or None, "p_eta_minutes": body.eta_minutes},
    )
    return {"id": request_id}
