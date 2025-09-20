-- Universes catalog (keeps keys tidy)
create table if not exists public.universes (
  key text primary key
);

insert into public.universes(key) values ('fund'), ('market')
on conflict do nothing;

-- Which users unlocked which universes
create table if not exists public.user_universes (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  key text not null references public.universes(key) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (auth_user_id, key)
);

alter table public.user_universes enable row level security;

-- Policies: users can see and insert their own rows
drop policy if exists user_universes_select on public.user_universes;
create policy user_universes_select
  on public.user_universes for select
  using (auth.uid() = auth_user_id);

drop policy if exists user_universes_insert on public.user_universes;
create policy user_universes_insert
  on public.user_universes for insert
  with check (auth.uid() = auth_user_id);