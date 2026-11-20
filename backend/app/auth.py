"""Who is calling? Verifies the Supabase access token sent by the frontend."""

from dataclasses import dataclass
from typing import Annotated, Any

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings, get_settings
from .db import Db, get_http

bearer = HTTPBearer(auto_error=False)

_jwks_clients: dict[str, jwt.PyJWKClient] = {}


@dataclass(frozen=True)
class CurrentUser:
    id: str
    token: str


def _unauthorized(detail: str = "Please log in again.") -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, detail, headers={"WWW-Authenticate": "Bearer"})


def _jwks_client(settings: Settings) -> jwt.PyJWKClient:
    url = f"{settings.auth_url}/.well-known/jwks.json"
    if url not in _jwks_clients:
        _jwks_clients[url] = jwt.PyJWKClient(url, cache_keys=True, lifespan=600)
    return _jwks_clients[url]


async def _verify_locally(token: str, settings: Settings) -> dict[str, Any] | None:
    """Verify the signature without a network round trip when we can.

    Returns the claims, or None when local verification is not possible
    (legacy HS256 token but no secret configured).
    """
    try:
        alg = jwt.get_unverified_header(token).get("alg")
    except jwt.PyJWTError as e:
        raise _unauthorized() from e

    try:
        if alg == "HS256":
            if not settings.supabase_jwt_secret:
                return None
            return jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
        signing_key = await run_in_threadpool(_jwks_client(settings).get_signing_key_from_jwt, token)
        return jwt.decode(token, signing_key.key, algorithms=["ES256", "RS256"], audience="authenticated")
    except jwt.ExpiredSignatureError as e:
        raise _unauthorized("Your session has expired. Please log in again.") from e
    except jwt.PyJWKClientError:
        return None  # JWKS unavailable: fall back to asking Supabase Auth
    except jwt.PyJWTError as e:
        raise _unauthorized() from e


async def _verify_remotely(token: str, settings: Settings, http: httpx.AsyncClient) -> dict[str, Any]:
    res = await http.get(
        f"{settings.auth_url}/user",
        headers={"apikey": settings.supabase_anon_key, "Authorization": f"Bearer {token}"},
    )
    if res.status_code != 200:
        raise _unauthorized()
    user = res.json()
    return {"sub": user["id"]}


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
    http: Annotated[httpx.AsyncClient, Depends(get_http)],
) -> CurrentUser:
    if not creds or creds.scheme.lower() != "bearer":
        raise _unauthorized("Please log in to continue.")
    token = creds.credentials
    claims = await _verify_locally(token, settings)
    if claims is None:
        claims = await _verify_remotely(token, settings, http)
    sub = claims.get("sub")
    if not sub:
        raise _unauthorized()
    return CurrentUser(id=sub, token=token)


def get_user_db(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
    http: Annotated[httpx.AsyncClient, Depends(get_http)],
) -> Db:
    """Database client acting as the logged-in user (RLS applies)."""
    return Db(http, settings, user.token)


def get_public_db(
    settings: Annotated[Settings, Depends(get_settings)],
    http: Annotated[httpx.AsyncClient, Depends(get_http)],
) -> Db:
    """Database client acting as an anonymous visitor."""
    return Db(http, settings, None)


UserDep = Annotated[CurrentUser, Depends(get_current_user)]
UserDb = Annotated[Db, Depends(get_user_db)]
PublicDb = Annotated[Db, Depends(get_public_db)]
