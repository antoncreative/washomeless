-- Profile photos. Public (donors see them before joining), optional,
-- and the only part of their profile an applicant can change themselves.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Files live under <user_id>/...; people can only add or remove files in their own folder.
create policy "avatars: upload own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: delete own folder" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Applicants can't update sponsored_people directly (that would let them change their
-- supporter count or status), so photo changes go through this function.
-- Pass null to remove the photo. Only URLs inside the caller's own avatars folder are accepted.
create or replace function public.set_my_avatar(p_url text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_url is not null
     and p_url not like '%/storage/v1/object/public/avatars/' || auth.uid()::text || '/%' then
    raise exception 'Invalid avatar URL';
  end if;

  update public.sponsored_people
  set avatar_url = p_url, updated_at = now()
  where user_id = auth.uid();
end;
$$;

revoke execute on function public.set_my_avatar(text) from public, anon;
grant execute on function public.set_my_avatar(text) to authenticated;
