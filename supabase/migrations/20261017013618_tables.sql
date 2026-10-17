create extension if not exists postgis;
create extension if not exists pg_cron;

-- ENUMS
create type user_role      as enum ('donor','receiver','admin');
create type org_type       as enum ('restaurant','hostel','event','caterer','ngo','shelter','individual');
create type verify_status  as enum ('pending','verified','rejected');
create type diet_type      as enum ('veg','non_veg','both');
create type food_category  as enum ('cooked','bakery','fruits_veg','packed','other');
create type listing_status as enum ('available','requested','confirmed','picked_up','expired','cancelled');
create type request_status as enum ('pending','accepted','declined','cancelled','completed');

-- PROFILES (one per auth user)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  phone      text,
  role       user_role not null default 'receiver',
  created_at timestamptz not null default now()
);

-- ORGANIZATIONS
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null unique references profiles(id) on delete cascade,
  name        text not null,
  type        org_type not null,
  address     text not null,
  location    geography(point,4326) not null,
  doc_path    text,
  status      verify_status not null default 'pending',
  reject_reason text,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);
create index on organizations using gist(location);

-- LISTINGS
create table listings (
  id            uuid primary key default gen_random_uuid(),
  donor_org_id  uuid not null references organizations(id) on delete cascade,
  title         text not null check (char_length(title) between 3 and 80),
  description   text,
  category      food_category not null,
  diet          diet_type not null,
  portions      int not null check (portions between 1 and 1000),
  photo_path    text,
  prepared_at   timestamptz not null default now(),
  expires_at    timestamptz not null,
  address       text not null,
  location      geography(point,4326) not null,
  pickup_note   text,
  status        listing_status not null default 'available',
  created_at    timestamptz not null default now(),
  check (expires_at > prepared_at and expires_at <= prepared_at + interval '48 hours')
);
create index on listings using gist(location);
create index on listings (status, expires_at);

-- PICKUP REQUESTS
create table pickup_requests (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings(id) on delete cascade,
  receiver_org_id uuid not null references organizations(id) on delete cascade,
  status          request_status not null default 'pending',
  message         text,
  eta_minutes     int,
  requested_at    timestamptz not null default now(),
  completed_at    timestamptz,
  rating          int check (rating between 1 and 5),
  unique (listing_id, receiver_org_id)
);

-- SUPPORTING TABLES
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  title      text not null,
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create table stories (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text, quote text not null, photo_url text, since int
);
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null, blurb text, city text, event_date date, photo_url text
);
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null, created_at timestamptz default now()
);
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id), action text, target_id uuid, created_at timestamptz default now()
);