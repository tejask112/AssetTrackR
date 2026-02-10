create or replace function add_to_watchlist(uid_input text, ticker_input text)
returns boolean
language plpgsql
as 

$$
declare
  company_name text;  
  ticker_input_UC text := upper(ticker_input);
  company_name_map constant jsonb := '{
    "NVDA": "NVIDIA Corporation",
    "GOOG": "Alphabet Inc.",
    "AAPL": "Apple Inc.",
    "TSLA": "Tesla, Inc.",
    "AMZN": "Amazon.com, Inc.",
    "MSFT": "Microsoft Corporation",
    "META": "Meta Platforms, Inc.",
    "ORCL": "Oracle Corporation",
    "UBER": "Uber Technologies, Inc.",
    "NFLX": "Netflix, Inc.",
    "SHOP": "Shopify Inc.",
    "TSM":  "Taiwan Semiconductor Manufacturing Company Limited",
    "AMD":  "Advanced Micro Devices, Inc.",
    "AVGO": "Broadcom Inc.",
    "MU":   "Micron Technology, Inc."
  }'::jsonb;
  
begin
  if uid_input is null or ticker_input_UC is null then
    raise exception 'Missing Params: UID, Ticker'; 
  end if;

  if not (company_name_map ? ticker_input_UC) then
    raise exception 'Unrecognised Ticker';
  end if;

  company_name := company_name_map ->> ticker_input_UC;

  update public.users
  set watchlist = coalesce(watchlist, '{}'::jsonb) || jsonb_build_object(ticker_input_UC, company_name)
  where uid = uid_input;

  if not found then
    raise exception 'User not found';
  end if;

  return true; 
end;
$$;