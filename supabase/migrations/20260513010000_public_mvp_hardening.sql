alter table public.swimmer_profiles
  add column if not exists prefers_simple_explanations boolean not null default true,
  add column if not exists auto_easy_on_soreness boolean not null default true;

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_name text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists app_events_user_idx on public.app_events(user_id, created_at desc);
create index if not exists app_events_name_idx on public.app_events(event_name, created_at desc);

alter table public.app_events enable row level security;

grant select on public.app_events to authenticated;
grant select, insert, update, delete on public.app_events to service_role;

drop policy if exists "app_events_select_own" on public.app_events;
create policy "app_events_select_own" on public.app_events
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_all_own" on public.subscriptions;
drop policy if exists "usage_tracking_all_own" on public.usage_tracking;

revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke insert, update, delete on public.usage_tracking from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.usage_tracking to authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;
grant select, insert, update, delete on public.usage_tracking to service_role;

create policy if not exists "subscriptions_select_own" on public.subscriptions
for select to authenticated
using ((select auth.uid()) = user_id);

create policy if not exists "usage_tracking_select_own" on public.usage_tracking
for select to authenticated
using ((select auth.uid()) = user_id);

revoke execute on function public.increment_usage_metric(uuid, text, integer) from public;
revoke execute on function public.increment_usage_metric(uuid, text, integer) from anon;
revoke execute on function public.increment_usage_metric(uuid, text, integer) from authenticated;
grant execute on function public.increment_usage_metric(uuid, text, integer) to service_role;

do $$
begin
  update storage.buckets
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
  where id = 'swim-uploads';
exception
  when undefined_table then
    null;
end $$;

drop policy if exists "swim_uploads_select_own" on storage.objects;
drop policy if exists "swim_uploads_insert_own" on storage.objects;
drop policy if exists "swim_uploads_update_own" on storage.objects;
drop policy if exists "swim_uploads_delete_own" on storage.objects;

create policy "swim_uploads_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'swim-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "swim_uploads_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'swim-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "swim_uploads_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'swim-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'swim-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "swim_uploads_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'swim-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]
);
