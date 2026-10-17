-- ========== AUTO-EXPIRE LISTINGS (every minute) ==========
create or replace function expire_listings() returns void language sql as $$
  update listings set status = 'expired'
   where status in ('available','requested') and expires_at < now();
$$;

select cron.schedule('expire-listings', '* * * * *', 'select expire_listings()');

-- ========== STORAGE BUCKETS ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('food-photos', 'food-photos', true,  5242880, array['image/jpeg','image/png','image/webp']),
  ('org-docs',    'org-docs',    false, 5242880, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

create policy "upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id in ('food-photos','org-docs') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "admin read docs" on storage.objects for select
  using (bucket_id = 'org-docs' and (is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

-- ========== REALTIME ==========
alter publication supabase_realtime add table listings, pickup_requests, notifications;