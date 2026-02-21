create table if not exists public.portfolio (
  uid text not null references public.users(uid) on delete cascade,
  ticker text not null,
  quantity numeric not null,
  primary key (uid, ticker)
);

-- create index if not exists portfolio_index on public.portfolio(uid, ticker);
-- dont need this index, creating a primary key on (uid, ticker) automatically creates the same index
-- so creating another index will slow down inserts and updates.