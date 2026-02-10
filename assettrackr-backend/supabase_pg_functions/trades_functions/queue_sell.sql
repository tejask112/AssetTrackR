create or replace function queue_sell (
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
  quantity_after numeric;

  currently_owned_quantity numeric;
  currently_owned_cash numeric;
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
  where ticker = ticker_UC
  order by date desc
  limit 1;

  if current_price is null then
    raise exception 'ticker price not found';
  end if;

  -- check portfolio table (soft check)
  select quantity into currently_owned_quantity
  from public.portfolio
  where uid = uid_input and ticker = ticker_UC;

  if currently_owned_quantity is null or currently_owned_quantity < quantity_input then
    -- insert into trades table
    insert into trades (uid, ticker, status, status_tooltip, quantity, action, execution_price, execution_total_price)
    values (uid_input, ticker_UC, 'REJECTED', 'Sell quantity exceeded current position size', quantity_input, 'SELL', 0, 0);
    
    return 'error: insufficient quantity';
  end if;

  -- calculate total cost before insert
  total_cost := current_price * quantity_input;

  -- insert into trades table (ESTIMATED PRICES)
  insert into trades (uid, ticker, status, quantity, action, execution_price, execution_total_price)
  values (uid_input, ticker_UC, 'QUEUED', quantity_input, 'SELL', current_price, total_cost);

  return 'queued';
  
exception when others then
    return 'internal error: ' || sqlerrm;
end;
$$;