create or replace function cancel_trade(trade_id_input uuid, uid_input text)
returns text
language plpgsql 
as

$$
begin

  if not exists (select 1 from public.trades where trade_id = trade_id_input) then
    return 'error: trade_id does not exist';
  end if;

  update public.trades
  set status = 'CANCELLED', execution_price = 0, execution_total_price = 0
  where trade_id = trade_id_input 
    and status = 'QUEUED'
    and uid = uid_input;

  if not found then
    return 'error: trade cannot be cancelled';
  end if;

  return 'cancelled';

end;
$$;