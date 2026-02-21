create or replace function run_queued_trades()
returns void
language plpgsql
as
$$
declare
  trade_record record;
  current_mkt_price numeric;
  total_cost numeric;
  portfolio_qty_after numeric;
  user_cash_after numeric;

begin
  for trade_record in
    select * from public.trades
    where status = 'QUEUED'
    order by date asc
  loop

    -- 1. Get latest market price
    select price into current_mkt_price
    from public.market_data
    where upper(ticker) = upper(trade_record.ticker)
    order by date desc
    limit 1;

    if current_mkt_price is null then
      update public.trades
      set status = 'REJECTED',
        status_tooltip = 'Market price not found',
        execution_price = 0,
        execution_total_price = 0,
        trading_type = null,
        date = now()
      where trade_id = trade_record.trade_id;
      continue;
    end if;

    total_cost := current_mkt_price * trade_record.quantity;

    -- BUY ORDERS logic
    if trade_record.action = 'BUY' then
      update public.users
      set cash = cash - total_cost
      where uid = trade_record.uid and cash >= total_cost
      returning cash into user_cash_after;

      if not found then
        update public.trades
        set status = 'REJECTED',
          status_tooltip = 'Insufficient funds at market open',
          execution_price = 0,
          execution_total_price = 0,
          trading_type = null,
          date = now()
        where trade_id = trade_record.trade_id;
      else
        insert into public.portfolio (uid, ticker, quantity)
        values (trade_record.uid, upper(trade_record.ticker), trade_record.quantity)
        on conflict (uid, ticker)
        do update set quantity = public.portfolio.quantity + excluded.quantity;

        update public.trades
        set status = 'FILLED',
          execution_price = current_mkt_price,
          execution_total_price = total_cost,
          trading_type = 'Over-the-Counter (OTC)',
          date = now()
        where trade_id = trade_record.trade_id;
      end if;

    -- SELL ORDERS logic
    elsif trade_record.action = 'SELL' then
      update public.portfolio
      set quantity = quantity - trade_record.quantity
      where uid = trade_record.uid
        and ticker = upper(trade_record.ticker)
        and quantity >= trade_record.quantity
      returning quantity into portfolio_qty_after;

      if not found then
        update public.trades
        set status = 'REJECTED',
          status_tooltip = 'Insufficient quantity owned at market open',
          execution_price = 0,
          execution_total_price = 0,
          trading_type = null,
          date = now()
        where trade_id = trade_record.trade_id;
      else
        if portfolio_qty_after = 0 then
          delete from public.portfolio
          where uid = trade_record.uid and ticker = upper(trade_record.ticker);
        end if;

        update public.users
        set cash = cash + total_cost
        where uid = trade_record.uid;

        update public.trades
        set status = 'FILLED',
          execution_price = current_mkt_price,
          execution_total_price = total_cost,
          trading_type = 'Over-the-Counter (OTC)',
          date = now()
        where trade_id = trade_record.trade_id;
      end if;
    end if;
  end loop;
end;
$$;

-- select run_queued_trades();
