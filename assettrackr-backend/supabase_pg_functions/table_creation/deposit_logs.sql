create table if not exists public.deposit_logs(
  uid text not null references public.users (uid) on delete cascade,
  date timestamptz not null default now(),
  amount numeric not null,
  primary key (uid, date)
)