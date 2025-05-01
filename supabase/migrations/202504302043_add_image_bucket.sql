-- 1. Create a private bucket named 'images'
insert into storage.buckets (id, name, public)
values ('images', 'images', false)
on conflict (id) do nothing;

-- 2. Grant authenticated users permission to upload files to 'images' bucket
create policy "Allow authenticated uploads to images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'images');

-- 3. Grant authenticated users permission to read files in 'images' bucket
create policy "Allow authenticated read access to images"
on storage.objects for select
to authenticated
using (bucket_id = 'images');

-- 4. (Optional) Grant authenticated users permission to delete their own files
-- This checks both bucket and file ownership
create policy "Allow authenticated delete of own files in images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images' AND
  auth.uid() = owner
);
