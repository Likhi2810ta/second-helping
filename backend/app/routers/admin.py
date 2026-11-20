"""Admin tools: verify organisations, see every listing, read platform reports.

Every call runs with the admin's own token, so Row Level Security and the
`verify_org()` SQL function still enforce that only admins get through.
"""

from collections import Counter, defaultdict
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..auth import UserDb, UserDep
from ..db import Db
from ..schemas import VerifyOrganization
from .account import load_account

router = APIRouter(prefix="/api/admin", tags=["admin"])

ORG_SELECT = (
    "id, name, type, address, doc_path, status, reject_reason, verified_at, created_at,"
    " profiles(full_name, phone, role)"
)
LISTING_SELECT = (
    "id, title, category, diet, portions, status, address, expires_at, created_at,"
    " organizations(name), pickup_requests(status, organizations(name))"
)

OrgStatus = Literal["pending", "verified", "rejected", "all"]
ListingStatus = Literal["available", "requested", "confirmed", "picked_up", "expired", "cancelled", "all"]


async def require_admin(user: UserDep, db: UserDb) -> Db:
    profile, _ = await load_account(db, user)
    if not profile or profile.get("role") != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only admins can do that.")
    return db


AdminDb = Annotated[Db, Depends(require_admin)]


@router.get("/organizations")
async def organizations(db: AdminDb, status_: OrgStatus = Query("pending", alias="status")):
    params = {"select": ORG_SELECT, "order": "created_at.desc"}
    if status_ != "all":
        params["status"] = f"eq.{status_}"
    return await db.select("organizations", params)


@router.post("/organizations/{org_id}/verify", status_code=status.HTTP_204_NO_CONTENT)
async def verify(org_id: UUID, body: VerifyOrganization, db: AdminDb):
    if body.status == "rejected" and not body.reason:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Please give a reason for rejecting.")
    await db.rpc(
        "verify_org",
        {
            "p_org": str(org_id),
            "p_status": body.status,
            "p_reason": body.reason if body.status == "rejected" else None,
        },
    )


@router.get("/listings")
async def listings(
    db: AdminDb,
    status_: ListingStatus = Query("all", alias="status"),
    limit: int = Query(100, ge=1, le=500),
):
    params = {"select": LISTING_SELECT, "order": "created_at.desc", "limit": str(limit)}
    if status_ != "all":
        params["status"] = f"eq.{status_}"
    return await db.select("listings", params)


def build_report(impact: dict[str, Any], orgs: list[dict[str, Any]], rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Pure function so it is easy to test: turns raw rows into report numbers."""
    org_counts = Counter(o["status"] for o in orgs)
    listing_counts = Counter(r["status"] for r in rows)

    meals_by_donor: dict[str, int] = defaultdict(int)
    for r in rows:
        if r["status"] == "picked_up":
            name = (r.get("organizations") or {}).get("name") or "Unknown donor"
            meals_by_donor[name] += r.get("portions") or 0
    top = sorted(meals_by_donor.items(), key=lambda kv: kv[1], reverse=True)[:5]

    finished = listing_counts.get("picked_up", 0)
    closed = finished + listing_counts.get("expired", 0)
    return {
        "impact": impact,
        "organizations": {s: org_counts.get(s, 0) for s in ("pending", "verified", "rejected")},
        "listings": {
            s: listing_counts.get(s, 0)
            for s in ("available", "requested", "confirmed", "picked_up", "expired", "cancelled")
        },
        "rescue_rate": round(finished / closed * 100) if closed else None,
        "top_donors": [{"name": n, "meals": m} for n, m in top],
    }


@router.get("/reports")
async def reports(db: AdminDb):
    impact_rows = await db.rpc("impact_stats") or []
    impact = impact_rows[0] if impact_rows else {"meals": 0, "kg_food": 0, "kg_co2": 0, "donors": 0, "receivers": 0}
    orgs = await db.select("organizations", {"select": "status"})
    rows = await db.select("listings", {"select": "status, portions, organizations(name)", "limit": "5000"})
    return build_report(impact, orgs, rows)

