-- 2GAIN Supabase schema (prepared, optional)

create table if not exists profiles (
  id uuid primary key,
  email text,
  prenom text not null,
  age int,
  gender text,
  looking_for text,
  max_distance int default 25,
  niveau text,
  frequence text,
  visible boolean default true,
  intentions jsonb default '[]',
  sports jsonb default '[]',
  photo_url text,
  bio text,
  ville text,
  lat double precision,
  lng double precision,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (sender_id, receiver_id)
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists venues_liked (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  venue_id text not null,
  created_at timestamptz default now()
);

create table if not exists passes (
  id uuid primary key default gen_random_uuid(),
  passer_id uuid references profiles(id) on delete cascade,
  passed_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  unique (passer_id, passed_id)
);

create table if not exists hides (
  id uuid primary key default gen_random_uuid(),
  hider_id uuid references profiles(id) on delete cascade,
  hidden_id uuid references profiles(id) on delete cascade,
  reason text,
  created_at timestamptz default now(),
  unique (hider_id, hidden_id)
);

create table if not exists fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  created_at timestamptz default now(),
  unique (user_id, token)
);

alter table profiles enable row level security;
alter table likes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table venues_liked enable row level security;
alter table passes enable row level security;
alter table hides enable row level security;
alter table fcm_tokens enable row level security;

create policy "profiles read all" on profiles for select using (true);
create policy "profiles upsert own" on profiles for all using (auth.uid() = id);

create policy "likes own" on likes for all using (auth.uid() = sender_id);
create policy "likes received read" on likes for select using (auth.uid() = receiver_id);

create policy "matches participants" on matches for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "matches insert participant" on matches for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);
create policy "messages match read" on messages for select using (
  exists (
    select 1 from matches m
    where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);
create policy "messages match insert" on messages for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from matches m
    where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);
create policy "venues_liked own" on venues_liked for all using (auth.uid() = user_id);
create policy "passes own" on passes for all using (auth.uid() = passer_id);
create policy "hides own" on hides for all using (auth.uid() = hider_id);

create policy "fcm_tokens own" on fcm_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Migration si la table profiles existe déjà :
-- alter table profiles add column if not exists niveau text;
-- alter table profiles add column if not exists frequence text;
-- alter table profiles add column if not exists visible boolean default true;
-- alter table profiles add column if not exists niveau_par_sport jsonb default '{}';
-- alter table profiles add column if not exists training_days jsonb default '[]';
-- create table fcm_tokens … (voir définition ci-dessus) si migration manuelle

insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict do nothing;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict do nothing;

-- Storage : avatars (dossier = user id)
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars upload own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars update own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Suppression de compte (SQL Editor ou migration)
-- Voir aussi supabase/delete_own_account.sql
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
