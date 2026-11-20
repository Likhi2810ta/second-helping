import asyncio
import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .db import DbError, new_http_client
from .routers import account, admin, listings, notifications, public, requests

log = logging.getLogger("second_helping")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = new_http_client()
    app.state.http_loop = asyncio.get_running_loop()
    try:
        yield
    finally:
        await app.state.http.aclose()


app = FastAPI(title="Second Helping API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


def db_error_response(e: DbError) -> tuple[int, str]:
    """Turn a Postgres / PostgREST error into a status code and a friendly message."""
    if e.code == "P0001":  # `raise exception` inside our SQL functions: already human-readable
        return 400, e.message
    if e.code == "23505":
        if "one_request_per_org_per_listing" in e.message:
            return 409, "You have already requested this listing."
        return 409, "This already exists."
    if e.code == "23514":
        return 422, "Some of the details are not valid."
    if e.code == "42501":
        return 403, "You are not allowed to do that."
    if e.code == "PGRST116":
        return 404, "Not found."
    if e.status == 401:
        return 401, "Please log in again."
    log.error("Unexpected database error %s %s: %s %s", e.status, e.code, e.message, e.details)
    return 502, "The database could not complete the request. Please try again."


@app.exception_handler(DbError)
async def handle_db_error(_: Request, e: DbError):
    code, message = db_error_response(e)
    return JSONResponse(status_code=code, content={"detail": message})


@app.exception_handler(httpx.HTTPError)
async def handle_network_error(_: Request, e: httpx.HTTPError):
    log.error("Could not reach Supabase: %s", e)
    return JSONResponse(status_code=503, content={"detail": "The service is unreachable. Please try again."})


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}


app.include_router(public.router)
app.include_router(account.router)
app.include_router(listings.router)
app.include_router(requests.router)
app.include_router(admin.router)
app.include_router(notifications.router)
