create or replace function remove_from_watchlist(uid_input text, ticker_input text)
returns boolean
language plpgsql
as 

$$
declare
  ticker_input_UC text := upper(ticker_input); 
begin
  if uid_input is null or ticker_input_UC is null then
    raise exception 'Missing Params: UID, Ticker';
  end if;

  if ticker_input_UC not in ('NVDA', 'GOOG', 'AAPL', 'TSLA', 'AMZN', 'MSFT', 'META', 'ORCL', 'UBER', 'NFLX', 'SHOP', 'TSM', 'AMD', 'AVGO', 'MU') then
    raise exception 'Unrecognised Ticker';
  end if;

  update public.users 
  set watchlist = coalesce(watchlist, '{}'::jsonb) - ticker_input_UC
  where uid = uid_input;

  if not found then
    raise exception 'User not found';
  end if;

  return true;
end;
$$;