"""A thin async client for Supabase's REST API (PostgREST).

Every call is sent with the caller's own access token (or the anon key for
public endpoints). Postgres then applies Row Level Security exactly as it does
for supabase-js in the browser, so the database stays the source of truth.
"""

import asyncio
from typing import Any

import httpx
from fastapi import Request

from .config import Settings


class DbError(Exception):
    """An error returned by PostgREST / Postgres, translated in main.py."""

    def __init__(self, status: int, code: str | None, message: str, details: str | None = None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details


class Db:
    def __init__(self, http: httpx.AsyncClient, settings: Settings, token: str | None):
        self._http = http
        self._base = settings.rest_url
        self._headers = {
            "apikey": settings.supabase_anon_key,
            "Authorization": f"Bearer {token or settings.supabase_anon_key}",
        }

    async def _send(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
        json: Any = None,
        prefer: str | None = None,
        accept: str | None = None,
    ) -> Any:
        headers = dict(self._headers)
        if prefer:
            headers["Prefer"] = prefer
        if accept:
            headers["Accept"] = accept
        res = await self._http.request(method, f"{self._base}/{path}", params=params, json=json, headers=headers)
        if res.status_code >= 400:
            try:
                body = res.json()
            except ValueError:
                body = {}
            raise DbError(res.status_code, body.get("code"), body.get("message") or res.text, body.get("details"))
        if res.status_code == 204 or not res.content:
            return None
        return res.json()

    async def select(self, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        return await self._send("GET", table, params=params)

    async def select_one(self, table: str, params: dict[str, str]) -> dict[str, Any] | None:
        rows = await self.select(table, {**params, "limit": "1"})
        return rows[0] if rows else None

    async def insert(self, table: str, row: dict[str, Any], *, returning: bool = True) -> dict[str, Any] | None:
        rows = await self._send(
            "POST", table, json=row, prefer="return=representation" if returning else "return=minimal"
        )
        return rows[0] if rows else None

    async def update(self, table: str, filters: dict[str, str], values: dict[str, Any]) -> list[dict[str, Any]]:
        return await self._send("PATCH", table, params=filters, json=values, prefer="return=representation")

    async def rpc(self, fn: str, args: dict[str, Any] | None = None) -> Any:
        # Drop None values so SQL defaults apply
        body = {k: v for k, v in (args or {}).items() if v is not None}
        return await self._send("POST", f"rpc/{fn}", json=body)


def new_http_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=httpx.Timeout(10.0))


async def get_http(request: Request) -> httpx.AsyncClient:
    """The shared HTTP client for talking to Supabase.

    Locally it is created once at startup (see main.py). On serverless hosts
    such as Vercel the startup hook may not run, and each request can arrive on
    a new event loop, so a client is made per event loop and reused within it.
    """
    loop = asyncio.get_running_loop()
    state = request.app.state
    client: httpx.AsyncClient | None = getattr(state, "http", None)
    if client is None or getattr(state, "http_loop", None) is not loop:
        client = new_http_client()
        state.http = client
        state.http_loop = loop
    return client
