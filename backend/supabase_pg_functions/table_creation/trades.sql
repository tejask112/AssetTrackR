create table if not exists public.trades (
  trade_id uuid not null primary key default gen_random_uuid(),
  uid text not null references public.users(uid) on delete cascade,
  date timestamptz not null default now(),
  ticker text not null,
  status text not null,
  status_tooltip text,
  quantity numeric not null,
  action text not null,
  execution_price numeric not null,
  execution_total_price numeric not null,
  trading_type text
);

create index if not exists trades_uid_index on public.trades(uid, date desc);