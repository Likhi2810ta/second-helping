# Second Helping API (FastAPI)

The backend between the React app and Supabase. Supabase is still the database
(Postgres + PostGIS, RLS, SQL functions, pg_cron), auth provider, file storage
and realtime. FastAPI holds the API contract, validates input, and gives
friendly error messages.

```
React (Vite) ──► FastAPI ──► Supabase REST (PostgREST) ──► Postgres + RLS
     │                ▲
     └── Supabase Auth (login), Storage (uploads), Realtime
```

**Security model:** the API never uses the `service_role` key. Each request is
forwarded with the caller's own Supabase access token, so Row Level Security
and the SQL functions still decide what anyone can read or change. The API
verifies the token first, locally through the project's JWKS or the legacy
`SUPABASE_JWT_SECRET`, or by asking Supabase Auth as a fallback.

## Run it

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env          # then fill in SUPABASE_URL and SUPABASE_ANON_KEY
uvicorn app.main:app --reload --port 8000
```

Interactive docs: http://localhost:8000/docs. In development the Vite server
forwards `/api` to port 8000, so run both `npm run dev` (in `frontend/`) and uvicorn.

Tests: `python -m pytest` (they use a fake database, so no Supabase is needed).

## Endpoints

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/health` | anyone | Liveness check |
| GET | `/api/impact` | anyone | `impact_stats()` |
| GET | `/api/stories`, `/api/events?limit=` | anyone | Landing page content |
| POST | `/api/subscribers` | anyone | Newsletter signup |
| GET | `/api/listings/nearby?lat&lng&radius_km&diet&category&sort` | anyone | `nearby_listings()`; `sort` = `distance` or `expiry` |
| GET | `/api/me` | logged in | Profile + organisation |
| POST | `/api/organizations` | logged in | Onboarding (type must match role) |
| GET | `/api/listings/mine` | donor | Own listings with requests |
| POST | `/api/listings` | verified donor | Post food (API sets expiry and map point) |
| GET | `/api/listings/{id}` | logged in | `listing_detail()`: address and phone only after acceptance |
| POST | `/api/listings/{id}/withdraw` | donor | Withdraw an unrequested listing |
| POST | `/api/listings/{id}/request` | verified receiver | `request_pickup()` with message and ETA |
| GET | `/api/pickups` | receiver | `my_pickups()` |
| POST | `/api/requests/{id}/accept` · `decline` · `complete` | donor | State changes |
| POST | `/api/requests/{id}/cancel` | receiver | Cancel a pending or accepted request |

## Deploy

Any host that runs Python works (Render, Railway, Fly.io). Start command:
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `SUPABASE_URL`,
`SUPABASE_ANON_KEY` and `CORS_ORIGINS` (your Vercel URL). On the frontend set
`VITE_API_URL` to the API's public address.
