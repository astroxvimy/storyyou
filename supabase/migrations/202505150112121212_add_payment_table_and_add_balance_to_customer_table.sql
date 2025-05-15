CREATE TABLE payments (
  id text primary key, -- from stripe
  price_id text references prices(id),
  product text,
  user_id UUID references users(id),
  metadata JSONB,
  created_at timestamp with time zone default now()
);

alter table payments enable row level security;
create policy "Can only view own payment data." on payments for select using (auth.uid() = user_id);

ALTER TABLE customers
ADD COLUMN basic_balance numeric DEFAULT 0,
ADD COLUMN pro_balance numeric DEFAULT 0,
ADD COLUMN hobby_balance numeric DEFAULT 0;