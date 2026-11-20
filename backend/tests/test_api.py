from app.db import DbError

from .conftest import USER_ID

LISTING = {
    "title": "Veg biryani",
    "category": "cooked",
    "diet": "veg",
    "portions": 40,
    "hours_valid": 3,
    "address": "12 MG Road, Bengaluru",
    "lat": 12.97,
    "lng": 77.59,
}
LISTING_ID = "22222222-2222-2222-2222-222222222222"


def test_health(anon_client):
    assert anon_client.get("/health").json() == {"status": "ok"}


def test_private_routes_need_a_token(anon_client):
    assert anon_client.get("/api/me").status_code == 401
    assert anon_client.get("/api/pickups").status_code == 401
    assert anon_client.post("/api/listings", json=LISTING).status_code == 401


def test_nearby_passes_filters_and_sorts_by_expiry(anon_client, db):
    db.rpc_result = [
        {"id": "a", "expires_at": "2026-11-20T12:00:00Z"},
        {"id": "b", "expires_at": "2026-11-20T10:00:00Z"},
    ]
    res = anon_client.get("/api/listings/nearby?lat=12.9&lng=77.5&radius_km=5&diet=veg&sort=expiry")
    assert res.status_code == 200
    assert [r["id"] for r in res.json()] == ["b", "a"]
    _, fn, args = db.calls[-1]
    assert fn == "nearby_listings"
    assert args["p_diet"] == "veg" and args["radius_km"] == 5


def test_nearby_rejects_bad_radius(anon_client):
    assert anon_client.get("/api/listings/nearby?lat=12.9&lng=77.5&radius_km=500").status_code == 422


def test_create_listing_builds_point_and_expiry(client, db):
    res = client.post("/api/listings", json=LISTING)
    assert res.status_code == 201
    _, table, row = db.calls[-1]
    assert table == "listings"
    assert row["location"] == "SRID=4326;POINT(77.59 12.97)"
    assert row["donor_org_id"] == "org-1"
    assert row["expires_at"] > row["prepared_at"]


def test_create_listing_blocks_unverified_donor(client, db):
    db.org = {"id": "org-1", "status": "pending"}
    res = client.post("/api/listings", json=LISTING)
    assert res.status_code == 403
    assert "approval" in res.json()["detail"]


def test_create_listing_blocks_receivers(client, db):
    db.profile = {"id": USER_ID, "role": "receiver"}
    assert client.post("/api/listings", json=LISTING).status_code == 403


def test_create_listing_rejects_someone_elses_photo(client):
    res = client.post("/api/listings", json={**LISTING, "photo_path": "other-user/x.jpg"})
    assert res.status_code == 422


def test_create_listing_validates_input(client):
    assert client.post("/api/listings", json={**LISTING, "portions": 0}).status_code == 422
    assert client.post("/api/listings", json={**LISTING, "hours_valid": 30}).status_code == 422
    assert client.post("/api/listings", json={**LISTING, "title": "ab"}).status_code == 422


def test_organisation_type_must_match_role(client, db):
    db.org = None
    body = {
        "name": "Hope Kitchen",
        "type": "ngo",
        "address": "1 Main St, Bengaluru",
        "lat": 1,
        "lng": 2,
        "doc_path": f"{USER_ID}/doc.pdf",
    }
    assert client.post("/api/organizations", json=body).status_code == 422  # donor cannot be an NGO
    assert client.post("/api/organizations", json={**body, "type": "restaurant"}).status_code == 201


def test_withdraw_conflict_when_listing_changed(client, db):
    db.update_result = []
    assert client.post(f"/api/listings/{LISTING_ID}/withdraw").status_code == 409


def test_request_pickup_sends_eta(client, db):
    db.rpc_result = "req-1"
    res = client.post(f"/api/listings/{LISTING_ID}/request", json={"message": "Coming", "eta_minutes": 30})
    assert res.status_code == 201
    assert res.json() == {"id": "req-1"}
    assert db.calls[-1][2] == {"p_listing": LISTING_ID, "p_message": "Coming", "p_eta_minutes": 30}


def test_sql_exception_becomes_400_with_message(client, db):
    db.rpc_error = DbError(400, "P0001", "Listing is no longer available")
    res = client.post(f"/api/listings/{LISTING_ID}/request", json={})
    assert res.status_code == 400
    assert res.json()["detail"] == "Listing is no longer available"


def test_double_request_becomes_409(client, db):
    db.rpc_error = DbError(
        409, "23505", 'duplicate key value violates unique constraint "one_request_per_org_per_listing"'
    )
    res = client.post(f"/api/listings/{LISTING_ID}/request", json={})
    assert res.status_code == 409
    assert res.json()["detail"] == "You have already requested this listing."


def test_listing_detail_404(client, db):
    db.rpc_result = []
    assert client.get(f"/api/listings/{LISTING_ID}").status_code == 404


def test_complete_with_rating(client, db):
    res = client.post(f"/api/requests/{LISTING_ID}/complete", json={"rating": 5})
    assert res.status_code == 204
    assert db.calls[-1][2] == {"p_request": LISTING_ID, "p_rating": 5}
    assert client.post(f"/api/requests/{LISTING_ID}/complete", json={"rating": 9}).status_code == 422


def test_subscribe_hides_duplicates(anon_client, db):
    async def dup(*a, **k):
        raise DbError(409, "23505", "duplicate")

    db.insert = dup
    assert anon_client.post("/api/subscribers", json={"email": "A@B.co"}).status_code == 204
    assert anon_client.post("/api/subscribers", json={"email": "nope"}).status_code == 422


# ---------- Admin ----------

ORG_ID = "33333333-3333-3333-3333-333333333333"


def test_admin_routes_are_admins_only(client, db):
    # The fake user is a donor by default
    assert client.get("/api/admin/organizations").status_code == 403
    assert client.post(f"/api/admin/organizations/{ORG_ID}/verify", json={"status": "verified"}).status_code == 403
    assert client.get("/api/admin/reports").status_code == 403


def test_admin_lists_pending_organisations(client, db):
    db.profile = {"id": USER_ID, "role": "admin"}
    assert client.get("/api/admin/organizations").status_code == 200
    _, table, params = db.calls[-1]
    assert table == "organizations" and params["status"] == "eq.pending"


def test_admin_verifies_through_sql_function(client, db):
    db.profile = {"id": USER_ID, "role": "admin"}
    res = client.post(f"/api/admin/organizations/{ORG_ID}/verify", json={"status": "verified", "reason": "x"})
    assert res.status_code == 204
    _, fn, args = db.calls[-1]
    assert fn == "verify_org"
    assert args == {"p_org": ORG_ID, "p_status": "verified", "p_reason": None}


def test_admin_reject_needs_a_reason(client, db):
    db.profile = {"id": USER_ID, "role": "admin"}
    res = client.post(f"/api/admin/organizations/{ORG_ID}/verify", json={"status": "rejected"})
    assert res.status_code == 422


def test_build_report_counts_and_ranks():
    from app.routers.admin import build_report

    rows = [
        {"status": "picked_up", "portions": 10, "organizations": {"name": "A"}},
        {"status": "picked_up", "portions": 30, "organizations": {"name": "B"}},
        {"status": "picked_up", "portions": 5, "organizations": {"name": "A"}},
        {"status": "expired", "portions": 4, "organizations": {"name": "A"}},
        {"status": "available", "portions": 2, "organizations": {"name": "C"}},
    ]
    report = build_report({"meals": 45}, [{"status": "pending"}, {"status": "verified"}], rows)
    assert report["organizations"] == {"pending": 1, "verified": 1, "rejected": 0}
    assert report["top_donors"] == [{"name": "B", "meals": 30}, {"name": "A", "meals": 15}]
    assert report["rescue_rate"] == 75
    assert report["listings"]["available"] == 1


# ---------- Handover and notifications ----------

REQUEST_ID = "44444444-4444-4444-4444-444444444444"


def test_receiver_marks_collected_through_sql_function(client, db):
    assert client.post(f"/api/requests/{REQUEST_ID}/collected").status_code == 204
    _, fn, args = db.calls[-1]
    assert fn == "receiver_confirm_pickup" and args == {"p_request": REQUEST_ID}


def test_collected_shows_database_message(client, db):
    db.rpc_error = DbError(400, "P0001", "Only an accepted pickup can be marked as collected")
    res = client.post(f"/api/requests/{REQUEST_ID}/collected")
    assert res.status_code == 400
    assert "accepted" in res.json()["detail"]


def test_notifications_are_only_mine_and_newest_first(client, db):
    assert client.get("/api/notifications").status_code == 200
    _, table, params = db.calls[-1]
    assert table == "notifications"
    assert params["user_id"] == f"eq.{USER_ID}" and params["order"] == "created_at.desc"


def test_mark_all_read_only_touches_my_unread(client, db):
    assert client.post("/api/notifications/read").status_code == 204
    _, table, (filters, values) = db.calls[-1]
    assert table == "notifications"
    assert filters == {"user_id": f"eq.{USER_ID}", "read": "eq.false"} and values == {"read": True}


def test_notifications_need_login(anon_client):
    assert anon_client.get("/api/notifications").status_code == 401
