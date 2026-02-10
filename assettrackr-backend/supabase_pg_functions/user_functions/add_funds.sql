create function add_funds(uid_input text, amount_input numeric)
returns numeric
language plpgsql
as 

$$
declare
  new_balance numeric;

begin
  if uid_input is null or length(trim(uid_input))=0 or amount_input is null then
    raise exception 'Params: UID and Amount are required';
  end if;

  if amount_input <= 0 then
    raise exception 'Invalid Amount: cannot be 0 or less than 0';
  end if;

  update public.users
  set cash = cash + amount_input
  where uid = uid_input
  returning cash into new_balance;

  if new_balance is null then
    raise exception 'User not found';
  end if;

  return new_balance;
end;
$$;