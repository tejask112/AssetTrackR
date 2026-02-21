create or replace function get_portfolio_balance(uid_input text)
returns numeric
language plpgsql
as 

$$
declare
  portfolio_balance numeric;

begin
  if not exists (select 1 from public.users where uid=uid_input) then
    return 'error: user not found';
  end if;

  select coalesce(sum(p.quantity * coalesce(md.price, 0)), 0) -- coalesce gives u the first value thats not null
    into portfolio_balance
  from public.portfolio p
  left join lateral (
    select m.price
    from public.market_data m
    where m.ticker = p.ticker
    order by m.date desc
    limit 1
  ) md on true
  where p.uid = uid_input;

  return portfolio_balance;

end;
$$;