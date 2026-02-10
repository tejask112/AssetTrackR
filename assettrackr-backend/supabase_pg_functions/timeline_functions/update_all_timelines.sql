create or replace function update_all_timelines()
returns void
language plpgsql
as
$$
declare
begin

  insert into public.timeline (uid, price, date)
  with latest_prices as (
    
    -- get the latest price of each ticker
    select distinct on (ticker) ticker, price
    from public.market_data
    order by ticker, date desc
  )
  select
    u.uid,
    coalesce(sum(p.quantity * lp.price), 0) as total_value,
    now()
  from public.users u
  left join public.portfolio p on p.uid = u.uid
  left join latest_prices lp on p.ticker = lp.ticker
  group by u.uid;

end;
$$;

-- select update_all_timelines();
