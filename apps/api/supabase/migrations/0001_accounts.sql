-- Accounts, bookmarks and plans for the library.
-- Run once in the Supabase SQL editor (or `supabase db push`).
--
-- Every table has row-level security on: a signed-in user reads and writes only
-- their own rows, enforced by the database rather than by the app. Plans are
-- written only by the billing webhook, which uses the secret key and so bypasses
-- RLS; users can read their plan but never change it.

-- ── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Read own profile" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "Update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

-- A profile row for every new account; Google fills name and picture.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Bookmarks ───────────────────────────────────────────────────────────────
-- kind: 'component' (an item in lib/registry) or 'design' (data/good-designs.json).
-- item_id is the id used in code, so content stays in the repo, not the database.
create table public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('component', 'design')),
  item_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

alter table public.bookmarks enable row level security;

create policy "Read own bookmarks" on public.bookmarks
  for select using ((select auth.uid()) = user_id);

create policy "Add own bookmarks" on public.bookmarks
  for insert with check ((select auth.uid()) = user_id);

create policy "Remove own bookmarks" on public.bookmarks
  for delete using ((select auth.uid()) = user_id);

-- ── Plans ───────────────────────────────────────────────────────────────────
-- One row per paying account. plan 'pro' renews yearly; 'lifetime' is paid once.
-- status mirrors Paddle ('active', 'trialing', 'past_due', 'paused', 'canceled').
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('pro', 'lifetime')),
  status text not null,
  provider text not null default 'paddle',
  customer_id text,
  subscription_id text unique,
  transaction_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Read own plan" on public.subscriptions
  for select using ((select auth.uid()) = user_id);
