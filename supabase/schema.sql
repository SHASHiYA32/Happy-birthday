-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- Design: nobody except the logged-in owner can touch these tables or the bucket
-- directly. Viewers are served by the Next.js server (service role) only after a
-- correct OTP, so there is no public read path to wishes or photos.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- users
-- Supabase Auth already stores logins (email + hashed password) in auth.users.
-- This profiles table is the app-side record of each registered user. A trigger
-- fills it automatically on every sign-up, so you never insert into it by hand.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text check (display_name is null or char_length(display_name) <= 60),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_self_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Back-fill anyone who signed up before this script ran.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------- tables

create table if not exists public.cards (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  slug            text not null unique check (slug ~ '^[a-z0-9]{16,32}$'),
  recipient_name  text not null check (char_length(recipient_name) between 1 and 60),
  sender_name     text not null check (char_length(sender_name) between 1 and 60),
  birthday_date   date not null,
  otp_hash        text not null,
  otp_salt        text not null,
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists public.card_slides (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  position    integer not null check (position between 0 and 7),
  wish_text   text not null check (char_length(wish_text) between 1 and 500),
  image_path  text,
  unique (card_id, position)
);

create index if not exists cards_owner_idx on public.cards(owner_id, created_at desc);

-- ---------------------------------------------------------------- RLS

alter table public.cards       enable row level security;
alter table public.card_slides enable row level security;

-- Column-level privileges: owners can never read the OTP hash/salt or lock state.
revoke all on public.cards       from anon, authenticated;
revoke all on public.card_slides from anon, authenticated;

grant select (id, owner_id, slug, recipient_name, sender_name, birthday_date, created_at)
  on public.cards to authenticated;
grant insert (owner_id, slug, recipient_name, sender_name, birthday_date, otp_hash, otp_salt)
  on public.cards to authenticated;
grant update (otp_hash, otp_salt, failed_attempts, locked_until)
  on public.cards to authenticated;
grant delete on public.cards to authenticated;

grant select, insert, delete on public.card_slides to authenticated;

drop policy if exists cards_owner_select on public.cards;
drop policy if exists cards_owner_insert on public.cards;
drop policy if exists cards_owner_update on public.cards;
drop policy if exists cards_owner_delete on public.cards;

create policy cards_owner_select on public.cards
  for select to authenticated using (owner_id = auth.uid());
create policy cards_owner_insert on public.cards
  for insert to authenticated with check (owner_id = auth.uid());
create policy cards_owner_update on public.cards
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy cards_owner_delete on public.cards
  for delete to authenticated using (owner_id = auth.uid());

drop policy if exists slides_owner_select on public.card_slides;
drop policy if exists slides_owner_insert on public.card_slides;
drop policy if exists slides_owner_delete on public.card_slides;

create policy slides_owner_select on public.card_slides
  for select to authenticated
  using (exists (select 1 from public.cards c where c.id = card_id and c.owner_id = auth.uid()));
create policy slides_owner_insert on public.card_slides
  for insert to authenticated
  with check (exists (select 1 from public.cards c where c.id = card_id and c.owner_id = auth.uid()));
create policy slides_owner_delete on public.card_slides
  for delete to authenticated
  using (exists (select 1 from public.cards c where c.id = card_id and c.owner_id = auth.uid()));

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('birthday', 'birthday', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists birthday_owner_insert on storage.objects;
drop policy if exists birthday_owner_select on storage.objects;
drop policy if exists birthday_owner_delete on storage.objects;

-- Files live under <user id>/<card id>/<random>.<ext>; owners only touch their own folder.
create policy birthday_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'birthday' and (storage.foldername(name))[1] = auth.uid()::text);
create policy birthday_owner_select on storage.objects
  for select to authenticated
  using (bucket_id = 'birthday' and (storage.foldername(name))[1] = auth.uid()::text);
create policy birthday_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'birthday' and (storage.foldername(name))[1] = auth.uid()::text);
