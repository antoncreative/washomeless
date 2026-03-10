-- ============================================================
-- Washomeless — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends auth.users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  role text not null default 'donor' check (role in ('donor', 'sponsored', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- sponsored_people
create table public.sponsored_people (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  city text not null,
  story text not null,
  goal_amount integer not null default 3000,   -- in dollars
  current_supporters integer not null default 0,
  max_supporters integer not null default 100,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'rejected')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- subscriptions
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  person_id uuid references public.sponsored_people(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  amount integer not null default 3000,  -- in cents ($30.00)
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- diary_updates
create table public.diary_updates (
  id uuid default uuid_generate_v4() primary key,
  person_id uuid references public.sponsored_people(id) on delete cascade not null,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- milestones
create table public.milestones (
  id uuid default uuid_generate_v4() primary key,
  person_id uuid references public.sponsored_people(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean not null default false,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_sponsored_people_status on public.sponsored_people(status);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_person_id on public.subscriptions(person_id);
create index idx_subscriptions_stripe_sub_id on public.subscriptions(stripe_subscription_id);
create index idx_diary_updates_person_id on public.diary_updates(person_id);
create index idx_milestones_person_id on public.milestones(person_id);

-- ============================================================
-- AUTH TRIGGER — auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ADMIN APPROVAL TRIGGER — seed milestones on approval
-- ============================================================

create or replace function public.handle_person_approved()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only seed milestones when status changes to 'active' for the first time
  if new.status = 'active' and old.status = 'pending' then
    insert into public.milestones (person_id, title, description, sort_order) values
      (new.id, 'Stable Housing', 'Secure safe and stable housing', 1),
      (new.id, 'Therapy & Mental Health', 'Begin regular therapy sessions', 2),
      (new.id, 'Job Training', 'Complete a job training or certification program', 3),
      (new.id, 'Savings Goal', 'Build a 3-month emergency fund', 4);
  end if;
  return new;
end;
$$;

create trigger on_person_approved
  after update on public.sponsored_people
  for each row execute procedure public.handle_person_approved();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.sponsored_people enable row level security;
alter table public.subscriptions enable row level security;
alter table public.diary_updates enable row level security;
alter table public.milestones enable row level security;

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles policies
create policy "profiles: owner can read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: owner can update own name/avatar" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admin full access" on public.profiles
  for all using (public.is_admin());

-- sponsored_people policies
create policy "sponsored_people: anyone can read active" on public.sponsored_people
  for select using (status = 'active');

create policy "sponsored_people: owner can read own" on public.sponsored_people
  for select using (auth.uid() = user_id);

create policy "sponsored_people: anyone can apply (insert)" on public.sponsored_people
  for insert with check (auth.uid() = user_id);

create policy "sponsored_people: admin full access" on public.sponsored_people
  for all using (public.is_admin());

-- subscriptions policies
create policy "subscriptions: donor can read own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions: admin full access" on public.subscriptions
  for all using (public.is_admin());

-- Service role bypass (for webhook handler using service role key)
-- subscriptions: service role can insert/update
create policy "subscriptions: service role insert" on public.subscriptions
  for insert with check (true);

create policy "subscriptions: service role update" on public.subscriptions
  for update using (true);

-- diary_updates policies
create policy "diary_updates: anyone can read" on public.diary_updates
  for select using (
    exists (
      select 1 from public.sponsored_people sp
      where sp.id = person_id and sp.status = 'active'
    )
  );

create policy "diary_updates: sponsored person can insert own" on public.diary_updates
  for insert with check (
    exists (
      select 1 from public.sponsored_people sp
      where sp.id = person_id and sp.user_id = auth.uid()
    )
  );

create policy "diary_updates: admin full access" on public.diary_updates
  for all using (public.is_admin());

-- milestones policies
create policy "milestones: anyone can read for active people" on public.milestones
  for select using (
    exists (
      select 1 from public.sponsored_people sp
      where sp.id = person_id and sp.status = 'active'
    )
  );

create policy "milestones: sponsored person can update own" on public.milestones
  for update using (
    exists (
      select 1 from public.sponsored_people sp
      where sp.id = person_id and sp.user_id = auth.uid()
    )
  );

create policy "milestones: admin full access" on public.milestones
  for all using (public.is_admin());

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime for live supporter count + diary feed
alter publication supabase_realtime add table public.sponsored_people;
alter publication supabase_realtime add table public.diary_updates;
