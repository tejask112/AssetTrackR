create or replace function execute_buy (
  uid_input text,
  quantity_input numeric,
  ticker_input text
) 
returns text 
language plpgsql 
as 
$$
declare
  ticker_UC text := upper(ticker_input);
  current_price numeric;
  total_cost numeric;
  user_cash_after numeric;
begin

  if not exists (select 1 from public.users where uid = uid_input) then
    return 'error: user not found';
  end if;

  if quantity_input <= 0 then
    return 'error: quantity must be greater than zero';
  end if;

  -- get the latest price for the ticker
  select price into current_price
  from public.market_data
  where ticker = ticker_UC
  order by date desc
  limit 1;

  if current_price is null then
    raise exception 'ticker price not found';
  end if;

  -- calculate the total cost
  total_cost := current_price * quantity_input;

  -- enforce update to users.cash (if they have enough for the transaction)
  update public.users 
  set cash = cash - total_cost
  where uid = uid_input and cash >= total_cost
  returning cash into user_cash_after;

  -- error checking for insufficient funds
  if not found then
    -- insert into trades table
    insert into trades (uid, ticker, status, status_tooltip, quantity, action, execution_price, execution_total_price)
    values (uid_input, ticker_UC, 'REJECTED', 'Insufficient funds to execute the trade', quantity_input, 'BUY', 0, 0);
    
    return 'error: insufficient funds';
  end if;

  -- upsert into the portfolio table
  insert into public.portfolio (uid, ticker, quantity)
  values (uid_input, ticker_UC, quantity_input)
  on conflict (uid, ticker)
  do update set quantity = public.portfolio.quantity + excluded.quantity;

  -- insert into trades table
  insert into trades (uid, ticker, status, quantity, action, execution_price, execution_total_price, trading_type)
  values (uid_input, ticker_UC, 'FILLED', quantity_input, 'BUY', current_price, total_cost, 'Over-the-Counter (OTC)');

  return 'success';

exception when others then
    return 'internal error: ' || sqlerrm;
end; 
$$;