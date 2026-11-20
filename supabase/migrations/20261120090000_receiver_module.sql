-- Phase 6: receiver module
-- 1. request_pickup also stores the receiver's ETA
-- 2. cancel_request only cancels open requests and tells the donor
-- 3. listing_detail(): one listing, with the exact address and donor phone
--    revealed only to the donor, admins, or a receiver whose request was accepted
-- 4. my_pickups(): the receiver's requests with the listing they are for
--    (RLS hides confirmed/picked-up listings, so this runs as security definer)

-- ========== 1. REQUEST PICKUP (with ETA) ==========
drop function if exists request_pickup(uuid, text);

create or replace function request_pickup(
  p_listing uuid, p_message text default null, p_eta_minutes int default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid := my_org_id(); v_id uuid; v_donor_user uuid; v_title text; v_receiver text;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'receiver')
    then raise exception 'Only receivers can request food'; end if;

  if not exists (select 1 from organizations where id = v_org and status = 'verified')
    then raise exception 'Your organisation is not verified yet'; end if;

  if p_message is not null and char_length(p_message) > 300
    then raise exception 'Message must be 300 characters or fewer'; end if;

  if p_eta_minutes is not null and (p_eta_minutes < 0 or p_eta_minutes > 600)
    then raise exception 'ETA must be between 0 and 600 minutes'; end if;

  update listings set status = 'requested'
   where id = p_listing and status = 'available' and expires_at > now()
   returning title into v_title;
  if not found then raise exception 'Listing is no longer available'; end if;

  insert into pickup_requests (listing_id, receiver_org_id, message, eta_minutes)
  values (p_listing, v_org, nullif(btrim(p_message), ''), p_eta_minutes) returning id into v_id;

  select name into v_receiver from organizations where id = v_org;
  select o.owner_id into v_donor_user from listings l join organizations o on o.id = l.donor_org_id where l.id = p_listing;
  insert into notifications (user_id, title, body)
  values (v_donor_user, 'New pickup request', v_receiver || ' wants "' || v_title || '"');
  return v_id;
end $$;

-- ========== 2. CANCEL REQUEST (open requests only, donor notified) ==========
create or replace function cancel_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests; v_title text; v_donor_user uuid;
begin
  select * into r from pickup_requests where id = p_request for update;
  if not found or r.receiver_org_id is distinct from my_org_id() then raise exception 'Not your request'; end if;
  if r.status not in ('pending','accepted') then raise exception 'This request can no longer be cancelled'; end if;

  update pickup_requests set status = 'cancelled' where id = p_request;
  update listings set status = 'available'
   where id = r.listing_id and status in ('requested','confirmed') and expires_at > now();

  select l.title, o.owner_id into v_title, v_donor_user
    from listings l join organizations o on o.id = l.donor_org_id where l.id = r.listing_id;
  insert into notifications (user_id, title, body)
  values (v_donor_user, 'Pickup cancelled', 'A receiver cancelled their request for "' || v_title || '"');
end $$;

-- ========== 3. LISTING DETAIL ==========
create or replace function listing_detail(p_listing uuid)
returns table (
  id uuid, title text, description text, category food_category, diet diet_type, portions int,
  photo_path text, prepared_at timestamptz, expires_at timestamptz, status listing_status,
  pickup_note text, area text, address text, latitude double precision, longitude double precision,
  donor_name text, donor_type org_type, donor_verified boolean, donor_phone text,
  my_request_id uuid, my_request_status request_status
) language sql stable security definer set search_path = public as $$
  with me as (select my_org_id() as org_id, is_admin() as admin),
  mine as (
    select r.id, r.status
      from pickup_requests r, me
     where r.listing_id = p_listing and r.receiver_org_id = me.org_id
     order by r.requested_at desc
     limit 1
  )
  select l.id, l.title, l.description, l.category, l.diet, l.portions,
         l.photo_path, l.prepared_at, l.expires_at, l.status,
         l.pickup_note,
         -- everything after the first comma, e.g. "Indiranagar, Bengaluru"
         coalesce(nullif(btrim(substr(l.address, strpos(l.address, ',') + 1)), ''), l.address),
         case when v.revealed then l.address end,
         st_y(l.location::geometry), st_x(l.location::geometry),
         o.name, o.type, o.status = 'verified',
         case when v.revealed then p.phone end,
         mine.id, mine.status
    from listings l
    join organizations o on o.id = l.donor_org_id
    join profiles p on p.id = o.owner_id
    cross join me
    left join mine on true
    cross join lateral (
      select coalesce(l.donor_org_id = me.org_id, false)
          or me.admin
          or coalesce(mine.status in ('accepted','completed'), false) as revealed
    ) v
   where l.id = p_listing
     and (
       coalesce(l.donor_org_id = me.org_id, false)
       or me.admin
       or (o.status = 'verified' and l.status in ('available','requested'))
       or mine.id is not null
     );
$$;

-- ========== 4. MY PICKUPS (receiver) ==========
create or replace function my_pickups()
returns table (
  request_id uuid, request_status request_status, message text, eta_minutes int,
  requested_at timestamptz, completed_at timestamptz, rating int,
  listing_id uuid, title text, category food_category, diet diet_type, portions int,
  photo_path text, prepared_at timestamptz, expires_at timestamptz, listing_status listing_status,
  pickup_note text, area text, address text, latitude double precision, longitude double precision,
  donor_name text, donor_phone text
) language sql stable security definer set search_path = public as $$
  select r.id, r.status, r.message, r.eta_minutes,
         r.requested_at, r.completed_at, r.rating,
         l.id, l.title, l.category, l.diet, l.portions,
         l.photo_path, l.prepared_at, l.expires_at, l.status,
         l.pickup_note,
         coalesce(nullif(btrim(substr(l.address, strpos(l.address, ',') + 1)), ''), l.address),
         case when r.status in ('accepted','completed') then l.address end,
         case when r.status in ('accepted','completed') then st_y(l.location::geometry) end,
         case when r.status in ('accepted','completed') then st_x(l.location::geometry) end,
         o.name,
         case when r.status in ('accepted','completed') then p.phone end
    from pickup_requests r
    join listings l on l.id = r.listing_id
    join organizations o on o.id = l.donor_org_id
    join profiles p on p.id = o.owner_id
   where r.receiver_org_id = my_org_id()
   order by r.requested_at desc;
$$;

-- Only logged-in users need these
revoke execute on function listing_detail(uuid)              from public, anon;
revoke execute on function my_pickups()                      from public, anon;
revoke execute on function request_pickup(uuid, text, int)   from public, anon;
grant  execute on function listing_detail(uuid)              to authenticated;
grant  execute on function my_pickups()                      to authenticated;
grant  execute on function request_pickup(uuid, text, int)   to authenticated;
