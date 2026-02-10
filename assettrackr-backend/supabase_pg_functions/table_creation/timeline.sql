create table if not exists public.timeline (
  uid text not null,
  date timestamptz not null default now(),
  price numeric not null,
  primary key (uid, date)
);

create index if not exists timeline_index on public.timeline(uid, date desc);