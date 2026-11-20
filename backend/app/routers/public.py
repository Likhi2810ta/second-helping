"""Landing-page data anyone can read."""

from datetime import date

from fastapi import APIRouter, Query, status

from ..auth import PublicDb
from ..db import DbError
from ..schemas import Subscribe

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/impact")
async def impact(db: PublicDb):
    rows = await db.rpc("impact_stats")
    if rows:
        return rows[0]
    return {"meals": 0, "kg_food": 0, "kg_co2": 0, "donors": 0, "receivers": 0}


@router.get("/stories")
async def stories(db: PublicDb):
    return await db.select("stories", {"select": "*", "order": "name"})


@router.get("/events")
async def events(db: PublicDb, limit: int = Query(3, ge=1, le=20)):
    return await db.select(
        "events",
        {
            "select": "*",
            "event_date": f"gte.{date.today().isoformat()}",
            "order": "event_date",
            "limit": str(limit),
        },
    )


@router.post("/subscribers", status_code=status.HTTP_204_NO_CONTENT)
async def subscribe(body: Subscribe, db: PublicDb):
    try:
        await db.insert("subscribers", {"email": body.email}, returning=False)
    except DbError as e:
        # Already subscribed: answer the same way, so this form cannot be used
        # to find out who is on the list.
        if e.code != "23505":
            raise
