import os

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")

from typing import Any  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.auth import CurrentUser, get_current_user, get_public_db, get_user_db  # noqa: E402
from app.main import app  # noqa: E402

USER_ID = "11111111-1111-1111-1111-111111111111"


class FakeDb:
    """Records calls and returns canned answers instead of talking to Supabase."""

    def __init__(self):
        self.calls: list[tuple[str, str, Any]] = []
        self.profile: dict[str, Any] | None = {"id": USER_ID, "role": "donor", "full_name": "Test"}
        self.org: dict[str, Any] | None = {"id": "org-1", "status": "verified"}
        self.rpc_result: Any = None
        self.rpc_error: Exception | None = None
        self.update_result: list[dict[str, Any]] = []

    async def select(self, table, params):
        self.calls.append(("select", table, params))
        return []

    async def select_one(self, table, params):
        self.calls.append(("select_one", table, params))
        return {"profiles": self.profile, "organizations": self.org}.get(table)

    async def insert(self, table, row, *, returning=True):
        self.calls.append(("insert", table, row))
        return {"id": "new-id", **row}

    async def update(self, table, filters, values):
        self.calls.append(("update", table, (filters, values)))
        return self.update_result

    async def rpc(self, fn, args=None):
        self.calls.append(("rpc", fn, args))
        if self.rpc_error:
            raise self.rpc_error
        return self.rpc_result


@pytest.fixture
def db():
    return FakeDb()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=USER_ID, token="t")
    app.dependency_overrides[get_user_db] = lambda: db
    app.dependency_overrides[get_public_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def anon_client(db):
    app.dependency_overrides[get_public_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
