create or replace function execute_sell (
  uid_input text,
  quantity_input numeric,
  ticker_input text
) 
returns text
language plpgsql 
as
$$
declare
  ticker_uc text := upper(ticker_input);
  current_price numeric;
  total_cost numeric;
  quantity_after numeric;
begin

  if not exists (select 1 from public.users where uid = uid_input) then
    return 'error: user not found';
  end if;

  if quantity_input <= 0 then
    return 'error: quantity must be greater than zero';
  end if;

  -- get latest price of the ticker
  select price into current_price
  from public.market_data
  where ticker = ticker_uc
  order by date desc
  limit 1;

  if current_price is null then
    raise exception 'ticker price not found';
  end if;

  -- calculate the total cost
  total_cost := current_price * quantity_input;

  -- update portfolio table
  update public.portfolio
  set quantity = quantity - quantity_input
  where uid = uid_input and ticker = ticker_uc and quantity >= quantity_input
  returning quantity into quantity_after;

  if not found then
    -- insert into trades table
    insert into trades (uid, ticker, status, status_tooltip, quantity, action, execution_price, execution_total_price)
    values (uid_input, ticker_UC, 'REJECTED', 'Sell quantity exceeded current position size', quantity_input, 'SELL', 0, 0);
    
    return 'error: insufficient quantity';
  end if;

  -- remove from portfolio is quantity is 0
  if quantity_after = 0 then
    delete from public.portfolio
    where uid = uid_input and ticker = ticker_UC;
  end if;

  -- update users table with new cash
  update public.users
  set cash = cash + total_cost 
  where uid = uid_input;
  
  -- insert into trades table
  insert into trades (uid, ticker, status, quantity, action, execution_price, execution_total_price, trading_type)
  values (uid_input, ticker_UC, 'FILLED', quantity_input, 'SELL', current_price, total_cost, 'Over-the-Counter (OTC)');

  return 'success';
  
exception when others then
    return 'internal error: ' || sqlerrm;
end;
$$;