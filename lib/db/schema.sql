create extension if not exists "pgcrypto";

create type app_role as enum ('user', 'admin');
create type subscription_status as enum ('active', 'expired', 'cancelled');
create type subscription_plan as enum ('monthly', 'yearly');
create type draw_status as enum ('draft', 'simulated', 'published');
create type draw_mode as enum ('random', 'weighted');
create type match_type as enum ('5-match', '4-match', '3-match');
create type winning_status as enum ('pending', 'approved', 'rejected', 'paid');

create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  impact text not null,
  location text not null,
  image_url text not null,
  website text not null,
  founded text not null,
  focus_areas text[] not null default '{}',
  upcoming_events text[] not null default '{}',
  raised_today_base numeric(12,2) not null default 0,
  supporters integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role app_role not null default 'user',
  subscription_status subscription_status not null default 'expired',
  charity_id uuid not null references public.charities(id),
  charity_contribution_percent integer not null default 10 check (charity_contribution_percent >= 10 and charity_contribution_percent <= 100),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan subscription_plan not null,
  status subscription_status not null,
  current_period_end timestamptz not null,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score between 1 and 45),
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index scores_user_date_idx on public.scores (user_id, date desc);

create table public.draws (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  numbers integer[] not null check (array_length(numbers, 1) = 5),
  mode draw_mode not null,
  status draw_status not null default 'draft',
  prize_pool numeric(12,2) not null default 0,
  rollover_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.winnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_type match_type not null,
  amount numeric(12,2) not null,
  status winning_status not null default 'pending',
  proof_url text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.trim_scores_to_last_five()
returns trigger as $$
begin
  delete from public.scores
  where id in (
    select id from public.scores
    where user_id = new.user_id
    order by date desc, created_at desc
    offset 5
  );
  return new;
end;
$$ language plpgsql;

create trigger scores_keep_last_five
after insert or update on public.scores
for each row execute procedure public.trim_scores_to_last_five();
