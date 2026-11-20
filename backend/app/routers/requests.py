"""Pickup requests. Every state change runs inside a SQL function, so it is
atomic and checked by the database (who may do it, and from which status)."""

from uuid import UUID

from fastapi import APIRouter, status

from ..auth import UserDb
from ..schemas import CompleteRequest

router = APIRouter(prefix="/api", tags=["pickups"])


@router.get("/pickups")
async def my_pickups(db: UserDb):
    return await db.rpc("my_pickups") or []


@router.post("/requests/{request_id}/accept", status_code=status.HTTP_204_NO_CONTENT)
async def accept(request_id: UUID, db: UserDb):
    await db.rpc("accept_request", {"p_request": str(request_id)})


@router.post("/requests/{request_id}/decline", status_code=status.HTTP_204_NO_CONTENT)
async def decline(request_id: UUID, db: UserDb):
    await db.rpc("decline_request", {"p_request": str(request_id)})


@router.post("/requests/{request_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
async def cancel(request_id: UUID, db: UserDb):
    await db.rpc("cancel_request", {"p_request": str(request_id)})


@router.post("/requests/{request_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def complete(request_id: UUID, db: UserDb, body: CompleteRequest | None = None):
    rating = body.rating if body else None
    await db.rpc("complete_request", {"p_request": str(request_id), "p_rating": rating})


@router.post("/requests/{request_id}/collected", status_code=status.HTTP_204_NO_CONTENT)
async def collected(request_id: UUID, db: UserDb):
    """The receiver confirms they have the food. The donor is notified."""
    await db.rpc("receiver_confirm_pickup", {"p_request": str(request_id)})
