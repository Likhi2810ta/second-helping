-- ========== AUTO-CREATE PROFILE ON SIGNUP ==========
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New user'),
    new.raw_user_meta_data->>'phone',
    case when new.raw_user_meta_data->>'role' = 'donor' then 'donor'::user_role else 'receiver'::user_role end
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function handle_new_user();

-- ========== HELPER FUNCTIONS ==========
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_org_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from organizations where owner_id = auth.uid();
$$;

-- ========== TURN RLS ON ==========
alter table profiles        enable row level security;
alter table organizations   enable row level security;
alter table listings        enable row level security;
alter table pickup_requests enable row level security;
alter table notifications   enable row level security;
alter table stories         enable row level security;
alter table events          enable row level security;
alter table subscribers     enable row level security;
alter table audit_log       enable row level security;

-- ========== PROFILES ==========
create policy "own profile read"   on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile update" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));  -- cannot change own role

-- ========== ORGANIZATIONS ==========
create policy "org read"   on organizations for select
  using (owner_id = auth.uid() or is_admin() or status = 'verified');
create policy "org insert" on organizations for insert with check (owner_id = auth.uid());
create policy "org update" on organizations for update using (owner_id = auth.uid() or is_admin());

-- Only admins may change verification fields
create or replace function guard_org_status() returns trigger language plpgsql as $$
begin
  if not is_admin() and (new.status <> old.status or new.verified_at is distinct from old.verified_at) then
    raise exception 'Only admins can change verification status';
  end if;
  return new;
end $$;
create trigger org_status_guard before update on organizations
for each row execute function guard_org_status();

-- ========== LISTINGS ==========
create policy "listing read" on listings for select using (
  donor_org_id = my_org_id() or is_admin()
  or (status in ('available','requested')
      and exists (select 1 from organizations o where o.id = donor_org_id and o.status = 'verified'))
);
create policy "listing insert" on listings for insert with check (
  donor_org_id = my_org_id()
  and exists (select 1 from organizations o where o.id = donor_org_id and o.status = 'verified')
);
create policy "listing update" on listings for update using (donor_org_id = my_org_id() or is_admin());
create policy "listing delete" on listings for delete using (donor_org_id = my_org_id() or is_admin());

-- ========== PICKUP REQUESTS (changes happen through SQL functions in the next step) ==========
create policy "request read" on pickup_requests for select using (
  receiver_org_id = my_org_id() or is_admin()
  or exists (select 1 from listings l where l.id = listing_id and l.donor_org_id = my_org_id())
);

-- ========== NOTIFICATIONS ==========
create policy "own notifications" on notifications for select using (user_id = auth.uid());
create policy "mark read"         on notifications for update using (user_id = auth.uid());

-- ========== PUBLIC CONTENT ==========
create policy "stories public" on stories for select using (true);
create policy "events public"  on events  for select using (true);
create policy "admin stories"  on stories for all using (is_admin());
create policy "admin events"   on events  for all using (is_admin());
create policy "subscribe"      on subscribers for insert with check (true);
create policy "admin audit"    on audit_log for select using (is_admin());