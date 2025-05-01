create table stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  story_name text,
  story_detail text,
  user_picture text,
  hobbies text[],
  story_status text default 'pending',
  story_pdf text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  page_number int,
  page_text text,
  page_image text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS on both tables
alter table stories enable row level security;
alter table story_pages enable row level security;

create policy "Users can view their own stories"
on stories
for select
using (auth.uid() = user_id);

create policy "Users can insert their own stories"
on stories
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own stories"
on stories
for update
using (auth.uid() = user_id);

create policy "Users can view pages of their own stories"
on story_pages
for select
using (
  auth.uid() = (
    select user_id from stories where stories.id = story_pages.story_id
  )
);

create policy "Allow background inserts of pages"
on story_pages
for insert
with check (
  auth.uid() = (
    select user_id from stories where stories.id = story_pages.story_id
  )
);
