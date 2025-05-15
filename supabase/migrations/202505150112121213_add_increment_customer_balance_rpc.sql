-- Run this in Supabase SQL Editor
create or replace function increment_customer_balance(
  column_name text,
  increment_by numeric,
  user_id uuid
)
returns void as $$
begin
  execute format('
    update customers
    set %I = coalesce(%I, 0) + $1
    where id = $2
  ', column_name, column_name)
  using increment_by, user_id;
end;
$$ language plpgsql;
