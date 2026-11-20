"""The logged-in user's notifications (RLS only ever returns their own)."""

from fastapi import APIRouter, Query, status

from ..auth import UserDb, UserDep

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: UserDep, db: UserDb, limit: int = Query(20, ge=1, le=100)):
    return await db.select(
        "notifications",
        {
            "select": "id, title, body, read, created_at",
            "user_id": f"eq.{user.id}",
            "order": "created_at.desc",
            "limit": str(limit),
        },
    )


@router.post("/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(user: UserDep, db: UserDb):
    await db.update("notifications", {"user_id": f"eq.{user.id}", "read": "eq.false"}, {"read": True})
