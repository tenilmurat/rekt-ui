-- Source code of Pro components.
--
-- Both repositories are public, so Pro source never lives in git. It lives here,
-- and only the backend reads it: RLS is on and there are no policies, so no
-- browser key can read or write this table. The backend uses the secret key and
-- hands a row out only to an account with an active Pro or Lifetime plan.
create table public.component_sources (
  id text primary key,            -- the component id in apps/web
  title text not null,
  usage text not null,            -- the snippet shown in the Code panel
  files jsonb not null default '[]'::jsonb,  -- [{ "path": "Loader.tsx", "code": "…" }]
  dependencies text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.component_sources enable row level security;
