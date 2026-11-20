-- Phase 7: two-sided handover and notifications
-- 1. receiver_confirm_pickup(): the receiver can say "I've collected it".
--    Same end state as the donor's confirmation; the donor is notified.
-- 2. complete_request(): the donor's confirmation now notifies the receiver too.
-- 3. Notifications get an index for the bell (newest unread first).

-- ========== 1. RECEIVER CONFIRMS THE PICKUP ==========
create or replace function receiver_confirm_pickup(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests; v_title text; v_donor_user uuid; v_receiver text;
begin
  select * into r from pickup_requests where id = p_request for update;
  if not found or r.receiver_org_id is distinct from my_org_id() then raise exception 'Not your request'; end if;
  if r.status = 'completed' then return; end if; -- already confirmed by the donor: nothing to do
  if r.status <> 'accepted' then raise exception 'Only an accepted pickup can be marked as collected'; end if;

  update pickup_requests set status = 'completed', completed_at = now() where id = p_request;
  update listings set status = 'picked_up' where id = r.listing_id
   returning title into v_title;

  select o.owner_id into v_donor_user
    from listings l join organizations o on o.id = l.donor_org_id where l.id = r.listing_id;
  select name into v_receiver from organizations where id = r.receiver_org_id;
  insert into notifications (user_id, title, body)
  values (v_donor_user, 'Food collected', v_receiver || ' collected "' || v_title || '". Thank you for sharing!');
end $$;

-- ========== 2. DONOR CONFIRMS THE PICKUP (now also notifies the receiver) ==========
create or replace function complete_request(p_request uuid, p_rating int default null)
returns void language plpgsql security definer set search_path = public as $$
declare r pickup_requests; l listings; v_recv_user uuid;
begin
  select * into r from pickup_requests where id = p_request for update;
  if not found then raise exception 'Request not found'; end if;
  select * into l from listings where id = r.listing_id for update;
  if l.donor_org_id is distinct from my_org_id() then raise exception 'Not your listing'; end if;
  if p_rating is not null and (p_rating < 1 or p_rating > 5) then raise exception 'Rating must be between 1 and 5'; end if;

  -- The receiver may have confirmed first: then the donor can still add a rating
  if r.status = 'completed' then
    if p_rating is not null then update pickup_requests set rating = p_rating where id = p_request; end if;
    return;
  end if;
  if r.status <> 'accepted' then raise exception 'Request not accepted'; end if;

  update pickup_requests set status = 'completed', completed_at = now(), rating = p_rating where id = p_request;
  update listings set status = 'picked_up' where id = l.id;

  select owner_id into v_recv_user from organizations where id = r.receiver_org_id;
  insert into notifications (user_id, title, body)
  values (v_recv_user, 'Pickup completed', 'The donor confirmed you collected "' || l.title || '". Thank you!');
end $$;

-- ========== 3. NOTIFICATIONS ==========
create index if not exists notifications_user_created_idx on notifications (user_id, created_at desc);

revoke execute on function receiver_confirm_pickup(uuid) from public, anon;
grant  execute on function receiver_confirm_pickup(uuid) to authenticated;
