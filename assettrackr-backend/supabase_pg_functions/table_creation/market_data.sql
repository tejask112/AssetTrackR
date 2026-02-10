create table if not exists public.market_data(
  ticker text  not null,
  date timestamptz  not null  default now(),
  price float8  not null,
  primary key (ticker, date)
);

create index if not exists market_data_index on public.market_data (ticker, date desc);