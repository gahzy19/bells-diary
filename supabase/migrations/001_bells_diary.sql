create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) >= 3),
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists posts_public_order_idx
  on public.posts (status, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Published posts are publicly readable" on public.posts;
create policy "Published posts are publicly readable"
on public.posts for select
using (status = 'published' or (select auth.role()) = 'authenticated');

drop policy if exists "Authenticated author can create posts" on public.posts;
create policy "Authenticated author can create posts"
on public.posts for insert
to authenticated
with check (true);

drop policy if exists "Authenticated author can update posts" on public.posts;
create policy "Authenticated author can update posts"
on public.posts for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated author can delete posts" on public.posts;
create policy "Authenticated author can delete posts"
on public.posts for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Post images are publicly readable" on storage.objects;
create policy "Post images are publicly readable"
on storage.objects for select
using (bucket_id = 'post-images');

drop policy if exists "Authenticated author can upload post images" on storage.objects;
create policy "Authenticated author can upload post images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'post-images');

drop policy if exists "Authenticated author can update post images" on storage.objects;
create policy "Authenticated author can update post images"
on storage.objects for update
to authenticated
using (bucket_id = 'post-images')
with check (bucket_id = 'post-images');

drop policy if exists "Authenticated author can delete post images" on storage.objects;
create policy "Authenticated author can delete post images"
on storage.objects for delete
to authenticated
using (bucket_id = 'post-images');

insert into public.posts (
  id, title, slug, excerpt, content, category, status, created_at, updated_at, published_at
)
values
(
  '10000000-0000-4000-8000-000000000001',
  'The Things I Never Said Out Loud',
  'the-things-i-never-said-out-loud',
  $$Some feelings never become conversations. They simply stay with us, quietly asking to be understood.$$, 
  $$There are things I have rehearsed in my head a hundred times and still never said. Not because they were unimportant, but because sometimes words become heavier the closer they get to the truth.

Maybe writing is the place where those words can finally exist without asking for permission. A page does not interrupt, judge, or ask us to explain ourselves before we are ready.

So I keep them here — not as unfinished conversations, but as proof that even the quietest feelings once mattered.$$, 
  'Personal Essay', 'published', '2026-09-12 08:00:00+00', '2026-09-12 08:00:00+00', '2026-09-12 08:00:00+00'
),
(
  '10000000-0000-4000-8000-000000000002',
  'A Letter to September',
  'a-letter-to-september',
  $$To slower mornings, changing skies, and the strange comfort of beginning again.$$, 
  $$September, I hope you arrive gently. I hope your days teach me that not everything meaningful needs to happen quickly.

I want to notice the small things this month: pages folded at the corner, coffee becoming cold while I read, sunlight moving across a room, and conversations that make an ordinary day feel warmer.

If nothing extraordinary happens, let that be okay too. Maybe peace is already enough of a story.$$, 
  'Little Notes', 'published', '2026-09-05 08:00:00+00', '2026-09-05 08:00:00+00', '2026-09-05 08:00:00+00'
),
(
  '10000000-0000-4000-8000-000000000003',
  'Maybe Growing Up Feels Like This',
  'maybe-growing-up-feels-like-this',
  $$Perhaps growing up is less about becoming someone else and more about learning how to stay with yourself.$$, 
  $$I used to think change would always announce itself. That I would notice the exact moment I became braver, calmer, or more certain about who I wanted to be.

But most changes are quiet. They look like saying no without guilt, choosing rest without explanation, and realizing that some things no longer belong in the life you are building.

Maybe this is what growing up feels like: not having every answer, but trusting yourself enough to keep going anyway.$$, 
  'Reflection', 'published', '2026-08-24 08:00:00+00', '2026-08-24 08:00:00+00', '2026-08-24 08:00:00+00'
)
on conflict (slug) do nothing;
