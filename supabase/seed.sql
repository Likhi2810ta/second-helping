-- Development seed data. Safe to run again: it clears its own rows first.
-- Every test account uses the password:  Password123!

-- 0. Clean up previous seed data
delete from auth.users where email like '%@secondhelping.test';
truncate stories, events;

-- 1. Users (the signup trigger creates their profiles)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('Password123!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name, 'phone', u.phone, 'role', u.role),
  now(), now(), '', '', '', ''
from (values
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'admin@secondhelping.test',         'Asha Admin',  '9000000001', 'receiver'),
  ('dddddddd-0000-0000-0000-000000000001'::uuid, 'spicegarden@secondhelping.test',   'Ravi Kumar',  '9000000011', 'donor'),
  ('dddddddd-0000-0000-0000-000000000002'::uuid, 'greenhostel@secondhelping.test',   'Meera Nair',  '9000000012', 'donor'),
  ('dddddddd-0000-0000-0000-000000000003'::uuid, 'royalcaterers@secondhelping.test', 'Imran Sheikh', '9000000013', 'donor'),
  ('dddddddd-0000-0000-0000-000000000004'::uuid, 'sunrisebakery@secondhelping.test', 'Priya Rao',    '9000000014', 'donor'),
  ('eeeeeeee-0000-0000-0000-000000000001'::uuid, 'hopefoundation@secondhelping.test','Kiran Patel',  '9000000021', 'receiver'),
  ('eeeeeeee-0000-0000-0000-000000000002'::uuid, 'nightshelter@secondhelping.test',  'Sara Thomas',  '9000000022', 'receiver')
) as u(id, email, full_name, phone, role);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text,
       jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from auth.users where email like '%@secondhelping.test';

update profiles set role = 'admin' where id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- 2. Organisations (Sunrise Bakery is still pending)
insert into organizations (id, owner_id, name, type, address, location, status, verified_at) values
('bbbbbbbb-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000001','Spice Garden Restaurant','restaurant','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)','verified', now()),
('bbbbbbbb-0000-0000-0000-000000000002','dddddddd-0000-0000-0000-000000000002','Green Hostel Mess','hostel','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)','verified', now()),
('bbbbbbbb-0000-0000-0000-000000000003','dddddddd-0000-0000-0000-000000000003','Royal Caterers','caterer','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)','verified', now()),
('bbbbbbbb-0000-0000-0000-000000000004','dddddddd-0000-0000-0000-000000000004','Sunrise Bakery','restaurant','100 Feet Road, Indiranagar, Bengaluru','SRID=4326;POINT(77.6408 12.9784)','pending', null),
('cccccccc-0000-0000-0000-000000000001','eeeeeeee-0000-0000-0000-000000000001','Hope Foundation','ngo','22 Cunningham Road, Bengaluru','SRID=4326;POINT(77.6050 12.9857)','verified', now()),
('cccccccc-0000-0000-0000-000000000002','eeeeeeee-0000-0000-0000-000000000002','Night Shelter Trust','shelter','5 Basavanagudi Main Road, Bengaluru','SRID=4326;POINT(77.5750 12.9420)','verified', now());

-- 3. Eight current listings with different expiry times and statuses
insert into listings (donor_org_id, title, description, category, diet, portions, expires_at, address, location, pickup_note, status) values
('bbbbbbbb-0000-0000-0000-000000000001','Veg biryani','Freshly made, still hot.','cooked','veg',40, now() + interval '45 minutes','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)','Ask for Ravi at the back door.','available'),
('bbbbbbbb-0000-0000-0000-000000000001','Paneer curry and rotis','Packed in 5 large containers.','cooked','veg',25, now() + interval '3 hours','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)',null,'available'),
('bbbbbbbb-0000-0000-0000-000000000001','Chicken fried rice','Made this evening.','cooked','non_veg',30, now() + interval '90 minutes','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)',null,'requested'),
('bbbbbbbb-0000-0000-0000-000000000002','Breakfast idli and sambar','Left over from the hostel breakfast.','cooked','veg',60, now() + interval '5 hours','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)','Collect from the mess hall.','available'),
('bbbbbbbb-0000-0000-0000-000000000002','Fruit and veg crates','Bananas, tomatoes and carrots.','fruits_veg','veg',15, now() + interval '20 hours','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)',null,'available'),
('bbbbbbbb-0000-0000-0000-000000000003','Wedding buffet leftovers','Rice, dal and mixed vegetables.','cooked','both',120, now() + interval '8 hours','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)','Bring large containers.','available'),
('bbbbbbbb-0000-0000-0000-000000000003','Packed sandwiches','Individually wrapped.','packed','veg',50, now() + interval '10 minutes','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)','Expires soon: used to test auto-expiry.','available'),
('bbbbbbbb-0000-0000-0000-000000000003','Dinner rolls','Soft rolls from tonight''s event.','bakery','veg',35, now() + interval '6 hours','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)',null,'confirmed');

-- 4. Three finished pickups (history and impact numbers)
insert into listings (donor_org_id, title, category, diet, portions, prepared_at, expires_at, address, location, status) values
('bbbbbbbb-0000-0000-0000-000000000001','Veg thali (picked up)','cooked','veg',80, now() - interval '3 days', now() - interval '3 days' + interval '6 hours','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)','picked_up'),
('bbbbbbbb-0000-0000-0000-000000000003','Bakery assortment (picked up)','bakery','veg',45, now() - interval '2 days', now() - interval '2 days' + interval '6 hours','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)','picked_up'),
('bbbbbbbb-0000-0000-0000-000000000002','Fruit boxes (picked up)','fruits_veg','veg',30, now() - interval '1 day', now() - interval '1 day' + interval '6 hours','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)','picked_up');

-- 5. Pickup requests: one pending, one accepted, three completed
insert into pickup_requests (listing_id, receiver_org_id, status, message)
select id, 'cccccccc-0000-0000-0000-000000000001', 'pending', 'We can collect within 30 minutes.'
from listings where title = 'Chicken fried rice';

insert into pickup_requests (listing_id, receiver_org_id, status, message)
select id, 'cccccccc-0000-0000-0000-000000000002', 'accepted', 'Our van will arrive at 7 pm.'
from listings where title = 'Dinner rolls';

insert into pickup_requests (listing_id, receiver_org_id, status, completed_at, rating)
select id, 'cccccccc-0000-0000-0000-000000000001', 'completed', now() - interval '3 days', 5
from listings where title = 'Veg thali (picked up)';

insert into pickup_requests (listing_id, receiver_org_id, status, completed_at, rating)
select id, 'cccccccc-0000-0000-0000-000000000002', 'completed', now() - interval '2 days', 4
from listings where title = 'Bakery assortment (picked up)';

insert into pickup_requests (listing_id, receiver_org_id, status, completed_at, rating)
select id, 'cccccccc-0000-0000-0000-000000000001', 'completed', now() - interval '1 day', 5
from listings where title = 'Fruit boxes (picked up)';

-- 6. Stories and events for the landing page
insert into stories (name, role, quote, since) values
('Ravi Kumar', 'Owner, Spice Garden Restaurant', 'We used to throw away trays of food every night. Now it reaches someone who needs it within the hour.', 2026),
('Kiran Patel', 'Coordinator, Hope Foundation', 'Second Helping tells us exactly what is available nearby, so our volunteers never make a wasted trip.', 2026),
('Meera Nair', 'Warden, Green Hostel Mess', 'Posting leftover breakfast takes under a minute, and the pickup is confirmed before the food gets cold.', 2026);

insert into events (title, blurb, city, event_date) values
('Community Food Drive', 'Bring surplus pantry items and help us pack meal boxes for local shelters.', 'Bengaluru', current_date + 14),
('Donor Meetup', 'Restaurants, caterers and hostels share tips on cutting food waste.', 'Bengaluru', current_date + 30),
('Volunteer Training Day', 'Learn safe food handling and how pickups work.', 'Bengaluru', current_date + 45);