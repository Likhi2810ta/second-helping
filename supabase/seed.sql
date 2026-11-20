-- ============================================================================
-- Second Helping: demo data (Bengaluru)
--
-- Run it in the Supabase SQL Editor (it needs owner access to create logins).
-- Safe to run again: it first removes everything it created before.
-- Only touches accounts ending in @secondhelping.test; real users are left alone.
-- Run it after all migrations, including 20261121090000_pickup_handover.sql.
--
-- Every demo account uses the password:  Password123!
--
--   Admin      admin@secondhelping.test
--   Donors     spicegarden@  greenhostel@  royalcaterers@  annapoorna@
--              techpark@  grandpalace@                         (verified)
--              sunrisebakery@ (waiting)   freshbasket@ (rejected)
--   Receivers  hopefoundation@  nightshelter@  akshaya@  littlehearts@  (verified)
--              smileseva@ (waiting)
--   (all @secondhelping.test)
-- ============================================================================

-- 0. Clean up earlier demo data ---------------------------------------------
-- Deleting the logins cascades to profiles, organisations, listings,
-- pickup requests and notifications.
delete from audit_log
 where admin_id in (select id from auth.users where email like '%@secondhelping.test');
delete from auth.users where email like '%@secondhelping.test';
truncate stories, events;

-- 1. Logins (the signup trigger creates each profile) ------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('Password123!', extensions.gen_salt('bf')), now() - interval '40 days',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name, 'phone', u.phone, 'role', u.role),
  now() - interval '40 days', now(), '', '', '', ''
from (values
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'admin@secondhelping.test',          'Asha Menon',      '9000000001', 'receiver'),
  ('dddddddd-0000-0000-0000-000000000001'::uuid, 'spicegarden@secondhelping.test',    'Ravi Kumar',      '9000000011', 'donor'),
  ('dddddddd-0000-0000-0000-000000000002'::uuid, 'greenhostel@secondhelping.test',    'Meera Nair',      '9000000012', 'donor'),
  ('dddddddd-0000-0000-0000-000000000003'::uuid, 'royalcaterers@secondhelping.test',  'Imran Sheikh',    '9000000013', 'donor'),
  ('dddddddd-0000-0000-0000-000000000004'::uuid, 'sunrisebakery@secondhelping.test',  'Priya Rao',       '9000000014', 'donor'),
  ('dddddddd-0000-0000-0000-000000000005'::uuid, 'annapoorna@secondhelping.test',     'Lakshmi Iyer',    '9000000015', 'donor'),
  ('dddddddd-0000-0000-0000-000000000006'::uuid, 'techpark@secondhelping.test',       'Arjun Reddy',     '9000000016', 'donor'),
  ('dddddddd-0000-0000-0000-000000000007'::uuid, 'grandpalace@secondhelping.test',    'Farhan Ali',      '9000000017', 'donor'),
  ('dddddddd-0000-0000-0000-000000000008'::uuid, 'freshbasket@secondhelping.test',    'Neha Gupta',      '9000000018', 'donor'),
  ('eeeeeeee-0000-0000-0000-000000000001'::uuid, 'hopefoundation@secondhelping.test', 'Kiran Patel',     '9000000021', 'receiver'),
  ('eeeeeeee-0000-0000-0000-000000000002'::uuid, 'nightshelter@secondhelping.test',   'Sara Thomas',     '9000000022', 'receiver'),
  ('eeeeeeee-0000-0000-0000-000000000003'::uuid, 'akshaya@secondhelping.test',        'Vinod Shetty',    '9000000023', 'receiver'),
  ('eeeeeeee-0000-0000-0000-000000000004'::uuid, 'littlehearts@secondhelping.test',   'Sister Mary Joseph', '9000000024', 'receiver'),
  ('eeeeeeee-0000-0000-0000-000000000005'::uuid, 'smileseva@secondhelping.test',      'Deepak Joshi',    '9000000025', 'receiver')
) as u(id, email, full_name, phone, role);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text,
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), 'email', now(), now(), now()
from auth.users where email like '%@secondhelping.test';

update profiles set role = 'admin' where id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- 2. Organisations ------------------------------------------------------------
-- Status is set here on insert (a trigger only lets admins change it later).
insert into organizations (id, owner_id, name, type, address, location, doc_path, status, reject_reason, verified_at, created_at) values
-- Donors
('bbbbbbbb-0000-0000-0000-000000000001','dddddddd-0000-0000-0000-000000000001','Spice Garden Restaurant','restaurant','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)',null,'verified',null, now() - interval '38 days', now() - interval '39 days'),
('bbbbbbbb-0000-0000-0000-000000000002','dddddddd-0000-0000-0000-000000000002','Green Hostel Mess','hostel','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)',null,'verified',null, now() - interval '37 days', now() - interval '38 days'),
('bbbbbbbb-0000-0000-0000-000000000003','dddddddd-0000-0000-0000-000000000003','Royal Caterers','caterer','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)',null,'verified',null, now() - interval '36 days', now() - interval '37 days'),
('bbbbbbbb-0000-0000-0000-000000000004','dddddddd-0000-0000-0000-000000000004','Sunrise Bakery','restaurant','100 Feet Road, Indiranagar, Bengaluru','SRID=4326;POINT(77.6408 12.9784)',null,'pending',null, null, now() - interval '1 day'),
('bbbbbbbb-0000-0000-0000-000000000005','dddddddd-0000-0000-0000-000000000005','Annapoorna Veg Hotel','restaurant','80 Feet Road, Koramangala 4th Block, Bengaluru','SRID=4326;POINT(77.6271 12.9352)',null,'verified',null, now() - interval '30 days', now() - interval '31 days'),
('bbbbbbbb-0000-0000-0000-000000000006','dddddddd-0000-0000-0000-000000000006','TechPark Cafeteria','caterer','ITPL Main Road, Whitefield, Bengaluru','SRID=4326;POINT(77.7500 12.9698)',null,'verified',null, now() - interval '25 days', now() - interval '26 days'),
('bbbbbbbb-0000-0000-0000-000000000007','dddddddd-0000-0000-0000-000000000007','Grand Palace Convention Hall','event','27th Main, HSR Layout Sector 2, Bengaluru','SRID=4326;POINT(77.6387 12.9116)',null,'verified',null, now() - interval '20 days', now() - interval '21 days'),
('bbbbbbbb-0000-0000-0000-000000000008','dddddddd-0000-0000-0000-000000000008','Fresh Basket Supermarket','restaurant','Dr Rajkumar Road, Rajajinagar, Bengaluru','SRID=4326;POINT(77.5560 12.9910)',null,'rejected','The uploaded licence has expired. Please upload a current FSSAI licence.', null, now() - interval '6 days'),
-- Receivers
('cccccccc-0000-0000-0000-000000000001','eeeeeeee-0000-0000-0000-000000000001','Hope Foundation','ngo','22 Cunningham Road, Bengaluru','SRID=4326;POINT(77.6050 12.9857)',null,'verified',null, now() - interval '38 days', now() - interval '39 days'),
('cccccccc-0000-0000-0000-000000000002','eeeeeeee-0000-0000-0000-000000000002','Night Shelter Trust','shelter','5 Basavanagudi Main Road, Bengaluru','SRID=4326;POINT(77.5750 12.9420)',null,'verified',null, now() - interval '35 days', now() - interval '36 days'),
('cccccccc-0000-0000-0000-000000000003','eeeeeeee-0000-0000-0000-000000000003','Akshaya Community Kitchen','individual','Broadway Road, Shivajinagar, Bengaluru','SRID=4326;POINT(77.6010 12.9860)',null,'verified',null, now() - interval '28 days', now() - interval '29 days'),
('cccccccc-0000-0000-0000-000000000004','eeeeeeee-0000-0000-0000-000000000004','Little Hearts Children''s Home','shelter','Hosur Road, Adugodi, Bengaluru','SRID=4326;POINT(77.6100 12.9430)',null,'verified',null, now() - interval '22 days', now() - interval '23 days'),
('cccccccc-0000-0000-0000-000000000005','eeeeeeee-0000-0000-0000-000000000005','Smile Seva Trust','ngo','Main Road, Yelahanka New Town, Bengaluru','SRID=4326;POINT(77.5963 13.1007)',null,'pending',null, null, now() - interval '5 hours');

-- 3. Live listings (what the map and landing page show right now) -----------
insert into listings (id, donor_org_id, title, description, category, diet, portions, prepared_at, expires_at, address, location, pickup_note, status) values
('f1000000-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Veg biryani','Freshly made, still hot. Packed in 4 large trays.','cooked','veg',40, now() - interval '20 minutes', now() + interval '2 hours','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)','Ask for Ravi at the back door.','available'),
('f1000000-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000001','Paneer curry and rotis','Lunch buffet surplus, 5 large containers.','cooked','veg',25, now() - interval '1 hour', now() + interval '3 hours','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)',null,'available'),
('f1000000-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000001','Chicken fried rice','Made this afternoon.','cooked','non_veg',30, now() - interval '40 minutes', now() + interval '90 minutes','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)',null,'requested'),
('f1000000-0000-0000-0000-000000000004','bbbbbbbb-0000-0000-0000-000000000002','Idli and sambar','Left over from the hostel breakfast.','cooked','veg',60, now() - interval '2 hours', now() + interval '4 hours','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)','Collect from the mess hall, gate 2.','available'),
('f1000000-0000-0000-0000-000000000005','bbbbbbbb-0000-0000-0000-000000000002','Fruit and vegetable crates','Bananas, tomatoes, carrots and onions.','fruits_veg','veg',15, now() - interval '3 hours', now() + interval '20 hours','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)',null,'available'),
('f1000000-0000-0000-0000-000000000006','bbbbbbbb-0000-0000-0000-000000000003','Wedding buffet leftovers','Rice, dal, mixed vegetables and chicken curry.','cooked','both',120, now() - interval '1 hour', now() + interval '6 hours','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)','Bring large containers.','available'),
('f1000000-0000-0000-0000-000000000007','bbbbbbbb-0000-0000-0000-000000000003','Dinner rolls','Soft rolls from tonight''s event.','bakery','veg',35, now() - interval '2 hours', now() + interval '5 hours','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)',null,'confirmed'),
('f1000000-0000-0000-0000-000000000008','bbbbbbbb-0000-0000-0000-000000000005','South Indian lunch meals','Rice, sambar, rasam, poriyal and curd. Packed individually.','cooked','veg',45, now() - interval '30 minutes', now() + interval '3 hours','80 Feet Road, Koramangala 4th Block, Bengaluru','SRID=4326;POINT(77.6271 12.9352)','Counter at the entrance.','confirmed'),
('f1000000-0000-0000-0000-000000000009','bbbbbbbb-0000-0000-0000-000000000005','Masala dosa batter and chutney','Enough for about 80 dosas.','other','veg',80, now() - interval '1 hour', now() + interval '10 hours','80 Feet Road, Koramangala 4th Block, Bengaluru','SRID=4326;POINT(77.6271 12.9352)',null,'available'),
('f1000000-0000-0000-0000-000000000010','bbbbbbbb-0000-0000-0000-000000000006','Mini samosas and sandwiches','Evening snacks from the office cafeteria.','packed','veg',70, now() - interval '30 minutes', now() + interval '4 hours','ITPL Main Road, Whitefield, Bengaluru','SRID=4326;POINT(77.7500 12.9698)','Security desk will call the cafeteria.','requested'),
('f1000000-0000-0000-0000-000000000011','bbbbbbbb-0000-0000-0000-000000000006','Packed curd rice boxes','Sealed boxes, kept refrigerated.','packed','veg',50, now() - interval '1 hour', now() + interval '8 hours','ITPL Main Road, Whitefield, Bengaluru','SRID=4326;POINT(77.7500 12.9698)',null,'available'),
('f1000000-0000-0000-0000-000000000012','bbbbbbbb-0000-0000-0000-000000000007','Reception dinner surplus','Pulao, paneer butter masala, naan and gulab jamun.','cooked','veg',150, now() - interval '30 minutes', now() + interval '5 hours','27th Main, HSR Layout Sector 2, Bengaluru','SRID=4326;POINT(77.6387 12.9116)','Use the service entrance on the left.','available'),
('f1000000-0000-0000-0000-000000000013','bbbbbbbb-0000-0000-0000-000000000007','Cake and pastries','From a birthday party, about 60 slices.','bakery','veg',60, now() - interval '1 hour', now() + interval '12 hours','27th Main, HSR Layout Sector 2, Bengaluru','SRID=4326;POINT(77.6387 12.9116)',null,'available'),
('f1000000-0000-0000-0000-000000000014','bbbbbbbb-0000-0000-0000-000000000002','Bread and butter packs','Sealed loaves, best before tomorrow.','bakery','veg',40, now() - interval '30 minutes', now() + interval '18 hours','45 11th Main, Jayanagar, Bengaluru','SRID=4326;POINT(77.5838 12.9250)',null,'available');

-- 4. Closed listings: expired and withdrawn ---------------------------------
insert into listings (id, donor_org_id, title, category, diet, portions, prepared_at, expires_at, address, location, status, created_at) values
('f2000000-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','Mutton biryani','cooked','non_veg',20, now() - interval '4 days', now() - interval '4 days' + interval '3 hours','12 MG Road, Bengaluru','SRID=4326;POINT(77.6101 12.9756)','expired', now() - interval '4 days'),
('f2000000-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000006','Veg puffs','bakery','veg',30, now() - interval '6 days', now() - interval '6 days' + interval '4 hours','ITPL Main Road, Whitefield, Bengaluru','SRID=4326;POINT(77.7500 12.9698)','expired', now() - interval '6 days'),
('f2000000-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000003','Sweet pongal','cooked','veg',25, now() - interval '2 days', now() - interval '2 days' + interval '5 hours','8 Sampige Road, Malleswaram, Bengaluru','SRID=4326;POINT(77.5700 13.0035)','cancelled', now() - interval '2 days');

-- 5. A month of completed pickups (feeds Impact, Reports, History) ----------
-- 32 listings, one a day, spread over the verified donors and receivers.
insert into listings (id, donor_org_id, title, category, diet, portions, prepared_at, expires_at, address, location, status, created_at)
select
  ('f3000000-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid,
  o.id,
  (array['Veg thali','Lemon rice','Chapati and dal','Vegetable pulao','Bisi bele bath','Assorted breads',
         'Fruit boxes','Curd rice','Chole and rice','Upma and kesari','Egg curry and rice','Sandwich packs'])[1 + g % 12],
  (array['cooked','cooked','cooked','cooked','cooked','bakery','fruits_veg','cooked','cooked','cooked','cooked','packed'])[1 + g % 12]::food_category,
  (array['veg','veg','veg','veg','veg','veg','veg','veg','veg','veg','non_veg','veg'])[1 + g % 12]::diet_type,
  20 + (g * 37) % 90,
  now() - make_interval(days => g) - interval '3 hours',
  now() - make_interval(days => g) + interval '3 hours',
  o.address, o.location, 'picked_up',
  now() - make_interval(days => g) - interval '3 hours'
from generate_series(1, 32) as g
join organizations o on o.id = (array[
  'bbbbbbbb-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000002',
  'bbbbbbbb-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000005',
  'bbbbbbbb-0000-0000-0000-000000000006','bbbbbbbb-0000-0000-0000-000000000007'
]::uuid[])[1 + g % 6];

insert into pickup_requests (listing_id, receiver_org_id, status, message, eta_minutes, requested_at, completed_at, rating)
select
  l.id,
  (array[
    'cccccccc-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000003','cccccccc-0000-0000-0000-000000000004'
  ]::uuid[])[1 + (l.portions + extract(day from l.prepared_at)::int) % 4],
  'completed',
  'We will send a volunteer.',
  30,
  l.prepared_at + interval '15 minutes',
  l.prepared_at + interval '75 minutes',
  case when l.portions % 3 = 0 then 4 else 5 end
from listings l
where l.id::text like 'f3000000-0000-0000-0000-%';

-- 6. Requests on today's listings (to try every step of the flow) ------------
insert into pickup_requests (listing_id, receiver_org_id, status, message, eta_minutes, requested_at) values
-- Waiting for the donor's answer
('f1000000-0000-0000-0000-000000000003','cccccccc-0000-0000-0000-000000000001','pending','We can collect within 30 minutes.',30, now() - interval '10 minutes'),
('f1000000-0000-0000-0000-000000000010','cccccccc-0000-0000-0000-000000000003','pending','Our auto will come by 7 pm.',45, now() - interval '5 minutes'),
-- Accepted: the receiver can now press "I've collected it"
('f1000000-0000-0000-0000-000000000007','cccccccc-0000-0000-0000-000000000002','accepted','Our van will arrive at 7 pm.',45, now() - interval '50 minutes'),
('f1000000-0000-0000-0000-000000000008','cccccccc-0000-0000-0000-000000000001','accepted','Two volunteers on the way.',20, now() - interval '20 minutes'),
-- Declined earlier: the food went back on the map
('f1000000-0000-0000-0000-000000000002','cccccccc-0000-0000-0000-000000000004','declined','Could we collect tomorrow morning?',600, now() - interval '45 minutes');

-- A cancelled request on the expired listing (shows in History)
insert into pickup_requests (listing_id, receiver_org_id, status, message, eta_minutes, requested_at) values
('f2000000-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000002','cancelled','Van broke down, sorry.',30, now() - interval '4 days' + interval '30 minutes');

-- 7. Notifications (the bell in the app header) ------------------------------
insert into notifications (user_id, title, body, read, created_at) values
('dddddddd-0000-0000-0000-000000000001','New pickup request','Hope Foundation wants "Chicken fried rice"', false, now() - interval '10 minutes'),
('dddddddd-0000-0000-0000-000000000001','Food collected','Akshaya Community Kitchen collected "Veg thali". Thank you for sharing!', true, now() - interval '1 day'),
('dddddddd-0000-0000-0000-000000000006','New pickup request','Akshaya Community Kitchen wants "Mini samosas and sandwiches"', false, now() - interval '5 minutes'),
('dddddddd-0000-0000-0000-000000000001','Pickup cancelled','A receiver cancelled their request for "Mutton biryani"', true, now() - interval '4 days'),
('dddddddd-0000-0000-0000-000000000004','Welcome to Second Helping','Your organisation is being reviewed. Posting unlocks once an admin approves it.', false, now() - interval '1 day'),
('dddddddd-0000-0000-0000-000000000008','Organisation not approved','The uploaded licence has expired. Please upload a current FSSAI licence.', false, now() - interval '5 days'),
('eeeeeeee-0000-0000-0000-000000000001','Pickup confirmed','"South Indian lunch meals" is yours. Pickup: 80 Feet Road, Koramangala 4th Block, Bengaluru', false, now() - interval '15 minutes'),
('eeeeeeee-0000-0000-0000-000000000001','Pickup completed','The donor confirmed you collected "Veg thali". Thank you!', true, now() - interval '2 days'),
('eeeeeeee-0000-0000-0000-000000000002','Pickup confirmed','"Dinner rolls" is yours. Pickup: 8 Sampige Road, Malleswaram, Bengaluru', false, now() - interval '45 minutes'),
('eeeeeeee-0000-0000-0000-000000000004','Request declined','The donor could not hold "Paneer curry and rotis" until tomorrow.', false, now() - interval '40 minutes'),
('aaaaaaaa-0000-0000-0000-000000000001','New organisation to review','Smile Seva Trust signed up and is waiting for verification.', false, now() - interval '5 hours'),
('aaaaaaaa-0000-0000-0000-000000000001','New organisation to review','Sunrise Bakery signed up and is waiting for verification.', true, now() - interval '1 day');

-- 8. Admin audit trail -------------------------------------------------------
insert into audit_log (admin_id, action, target_id, created_at)
select 'aaaaaaaa-0000-0000-0000-000000000001', 'verify_org:' || status, id, coalesce(verified_at, now() - interval '5 days')
from organizations
where owner_id in (select id from auth.users where email like '%@secondhelping.test')
  and status in ('verified', 'rejected');

-- 9. Landing page: stories and events (photos ship with the site) -----------
insert into stories (name, role, quote, photo_url, since) values
('Ravi Kumar', 'Owner, Spice Garden Restaurant', 'We used to throw away trays of food every night. Now it reaches someone who needs it within the hour.', '/images/story-3.webp', 2026),
('Kiran Patel', 'Coordinator, Hope Foundation', 'Second Helping tells us exactly what is available nearby, so our volunteers never make a wasted trip.', '/images/story-4.webp', 2026),
('Meera Nair', 'Warden, Green Hostel Mess', 'Posting leftover breakfast takes under a minute, and the pickup is confirmed before the food gets cold.', '/images/story-1.webp', 2026),
('Sara Thomas', 'Manager, Night Shelter Trust', 'Forty people at our shelter eat a proper dinner most nights now, all from food that would have been wasted.', '/images/story-2.webp', 2026),
('Lakshmi Iyer', 'Owner, Annapoorna Veg Hotel', 'I see exactly who collected our meals and how many people they fed. That makes every post worth it.', '/images/cat-cooked.webp', 2026);

insert into events (title, blurb, city, event_date, photo_url) values
('Community Food Drive', 'Bring surplus pantry items and help us pack meal boxes for local shelters.', 'Bengaluru', current_date + 7, '/images/event-1.webp'),
('Donor Meetup', 'Restaurants, caterers and hostels share tips on cutting food waste.', 'Bengaluru', current_date + 21, '/images/event-2.webp'),
('Volunteer Training Day', 'Learn safe food handling and how pickups work.', 'Bengaluru', current_date + 35, '/images/event-3.webp'),
('Zero Waste Wedding Workshop', 'For event halls and caterers: plan portions and donate what is left.', 'Bengaluru', current_date + 50, '/images/step-pickup.webp');
