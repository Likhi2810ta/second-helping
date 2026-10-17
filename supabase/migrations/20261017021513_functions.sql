-- Nearby available food, closest first
create or replace function nearby_listings(
  lat double precision, lng double precision, radius_km double precision default 10,
  p_diet diet_type default null, p_category food_category default null
) returns table (
  id uuid, title text, category food_category, diet diet_type, portions int, photo_path text,
  prepared_at timestamptz, expires_at timestamptz, address text, status listing_status,
  donor_name text, latitude double precision, longitude double precision, distance_km double precision
) language sql stable as $$
  select l.id, l.title, l.category, l.diet, l.portions, l.photo_path, l.prepared_at, l.expires_at,
         l.address, l.status, o.name,
         st_y(l.location::geometry), st_x(l.location::geometry),
         st_distance(l.location, st_point(lng, lat)::geography) / 1000
  from listings l join organizations o on o.id = l.donor_org_id
  where l.status = 'available' and l.expires_at > now() and o.status = 'verified'
    and st_dwithin(l.location, st_point(lng, lat)::geography, radius_km * 1000)
    and (p_diet is null or l.diet = p_diet)
    and (p_category is null or l.category = p_category)
  order by 14, l.expires_at;
$$;

-- Receiver requests a pickup
create or replace function request_pickup(p_listing uuid, p_message text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid := my_org_id(); v_id uuid; v_donor_user uuid; v_title text;
begin
  if not exists (select 1 from organizations where id = v_org and status = 'verified')
    then raise exception 'Your organisation is not verified yet'; end if;

  update listings set status = 'requested'
   where id = p_listing and status = 'available' and expires_at > now()
   returning title into v_title;
  if not found then raise exception 'Listing is no longer available'; end if;

  insert into pickup_requests (listing_id, receiver_org_id, message)
  values (p_listing, v_org, p_message) returning id into v_id;

  select o.owner_id into v_donor_user from listings l join organizations o on o.id = l.donor_org_id where l.id = p_listing;
  insert into notifications (user_id, title, body) values (v_donor_user, 'New pickup request', 'Someone wants "'||v_title||'"');
  return v_id;
end $$;

-- Donor accepts
create or replace function accept_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests; l listings; v_recv_user uuid;
begin
  select * into r from pickup_requests where id = p_request for update;
  select * into l from listings where id = r.listing_id for update;
  if l.donor_org_id <> my_org_id() then raise exception 'Not your listing'; end if;
  if r.status <> 'pending' or l.status <> 'requested' then raise exception 'Request is no longer pending'; end if;
  if l.expires_at < now() then raise exception 'Listing expired'; end if;

  update pickup_requests set status = 'accepted' where id = p_request;
  update pickup_requests set status = 'declined' where listing_id = l.id and id <> p_request and status = 'pending';
  update listings set status = 'confirmed' where id = l.id;

  select owner_id into v_recv_user from organizations where id = r.receiver_org_id;
  insert into notifications (user_id, title, body) values (v_recv_user, 'Pickup confirmed', '"'||l.title||'" is yours. Pickup: '||l.address);
end $$;

-- Donor declines (listing goes back on the map)
create or replace function decline_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests; l listings;
begin
  select * into r from pickup_requests where id = p_request for update;
  select * into l from listings where id = r.listing_id for update;
  if l.donor_org_id <> my_org_id() then raise exception 'Not your listing'; end if;
  update pickup_requests set status = 'declined' where id = p_request;
  update listings set status = 'available' where id = l.id and status = 'requested';
end $$;

-- Receiver cancels
create or replace function cancel_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests;
begin
  select * into r from pickup_requests where id = p_request for update;
  if r.receiver_org_id <> my_org_id() then raise exception 'Not your request'; end if;
  update pickup_requests set status = 'cancelled' where id = p_request;
  update listings set status = 'available' where id = r.listing_id and status in ('requested','confirmed') and expires_at > now();
end $$;

-- Donor marks food as picked up
create or replace function complete_request(p_request uuid, p_rating int default null)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests; l listings;
begin
  select * into r from pickup_requests where id = p_request for update;
  select * into l from listings where id = r.listing_id for update;
  if l.donor_org_id <> my_org_id() then raise exception 'Not your listing'; end if;
  if r.status <> 'accepted' then raise exception 'Request not accepted'; end if;
  update pickup_requests set status = 'completed', completed_at = now(), rating = p_rating where id = p_request;
  update listings set status = 'picked_up' where id = l.id;
end $$;

-- Admin verifies or rejects an organisation
create or replace function verify_org(p_org uuid, p_status verify_status, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  update organizations
     set status = p_status, reject_reason = p_reason,
         verified_at = case when p_status = 'verified' then now() end
   where id = p_org;
  insert into audit_log (admin_id, action, target_id) values (auth.uid(), 'verify_org:'||p_status, p_org);
end $$;

-- Public impact counters
create or replace function impact_stats()
returns table (meals bigint, kg_food numeric, kg_co2 numeric, donors bigint, receivers bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(sum(portions),0),
         coalesce(sum(portions),0) * 0.4,
         coalesce(sum(portions),0) * 0.4 * 2.5,
         (select count(*) from organizations o join profiles p on p.id = o.owner_id where o.status='verified' and p.role='donor'),
         (select count(*) from organizations o join profiles p on p.id = o.owner_id where o.status='verified' and p.role='receiver')
  from listings where status = 'picked_up';
$$;