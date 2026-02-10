create table if not exists market_news (
  id uuid not null primary key default gen_random_uuid(),
  headline text not null,
  summary text not null,
  category text not null,
  datetime numeric not null,
  url text not null,
  image text not null,
  source text not null  
)