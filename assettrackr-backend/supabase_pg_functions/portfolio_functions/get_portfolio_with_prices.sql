create or replace function get_portfolio_with_prices(uid_input text)
returns table (
  ticker text,
  quantity numeric,
  current_price float8,
  change_5d_pct numeric
)
language plpgsql
as

$$
begin

  return query
  select
    p.ticker,
    p.quantity,
    md.price as current_price,
    cp.x5_day_price_return_daily as change_5d_pct
  from
    public.portfolio p
    
  left join lateral (
    select m.price
    from public.market_data m
    where m.ticker = p.ticker
    order by m.date desc
    limit 1
  ) md on true

  left join public.company_profile cp 
    on p.ticker = cp.ticker

  where
    p.uid = uid_input;
end;
$$;