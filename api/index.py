"""Vercel entry point: serves the FastAPI app from backend/ as a serverless function.

vercel.json rewrites /api/* (and /health) to this function and passes the
original path in a `__route` query parameter. Vercel may hand the function the
rewritten path (/api/index) instead of the original one, so `restore_path`
puts the original path back before FastAPI routes the request. If the original
path already arrives, it is left untouched.
"""

import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app as fastapi_app  # noqa: E402

ROUTE_PARAM = "__route"


def restore_path(asgi_app):
    async def wrapped(scope, receive, send):
        if scope["type"] == "http":
            query = parse_qsl(scope.get("query_string", b"").decode("latin-1"), keep_blank_values=True)
            route = next((v for k, v in query if k == ROUTE_PARAM), None)
            if route is not None:
                # Only paths this app serves may be restored
                if not (route == "/health" or route.startswith("/api/")):
                    route = "/__invalid__"
                rest = [(k, v) for k, v in query if k != ROUTE_PARAM]
                scope = {
                    **scope,
                    "path": route,
                    "raw_path": route.encode("utf-8"),
                    "query_string": urlencode(rest).encode("latin-1"),
                }
        await asgi_app(scope, receive, send)

    return wrapped


app = restore_path(fastapi_app)
