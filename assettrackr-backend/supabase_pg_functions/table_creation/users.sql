create table if not exists public.users(
  uid text not null primary key,
  email text not null unique,
  cash numeric not null default 100000,
  watchlist jsonb not null default '{}'::jsonb
)