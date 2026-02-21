create or replace function remove_funds(uid_input text, amount_input numeric)
returns numeric 
language plpgsql
as 
$$
declare
  new_balance numeric;

begin
  if uid_input is null or length(trim(uid_input))=0 or amount_input is null then
    raise exception 'Missing Params: UID and Amount are required';
  end if;

  if amount_input <= 0 then
    raise exception 'Invalid Amount: cannot be 0 or less than 0';
  end if;

  update public.users
  set cash = cash - amount_input
  where (uid = uid_input and cash >= amount_input)
  returning cash into new_balance;

  if new_balance is null then
    if exists (select 1 from public.users where uid=uid_input) then
      raise exception 'Insufficient Funds';
    else
      raise exception 'User not found';
    end if;
  end if;

  return new_balance;
end;
$$;