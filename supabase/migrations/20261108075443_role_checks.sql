-- 1. Only donors may post listings
drop policy "listing insert" on listings;
create policy "listing insert" on listings for insert with check (
  donor_org_id = my_org_id()
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'donor')
  and exists (select 1 from organizations o where o.id = donor_org_id and o.status = 'verified')
);

-- 2. Only receivers may request food
create or replace function request_pickup(p_listing uuid, p_message text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid := my_org_id(); v_id uuid; v_donor_user uuid; v_title text;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'receiver')
    then raise exception 'Only receivers can request food'; end if;

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

-- 3. A cancelled request can be repeated; a declined one cannot
do $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'pickup_requests'::regclass and contype = 'u';
  if c is not null then
    execute format('alter table pickup_requests drop constraint %I', c);
  end if;
end $$;

create unique index if not exists one_request_per_org_per_listing
  on pickup_requests (listing_id, receiver_org_id)
  where status <> 'cancelled';