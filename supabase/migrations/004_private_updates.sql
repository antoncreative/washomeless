-- Updates are private to a person's circle. Everyone else only sees a teaser
-- (type, headline, date). Photos and voice notes move to private storage.

-- 1. Full updates: the person themselves, their active supporters, and admins.
drop policy if exists "diary_updates: anyone can read" on public.diary_updates;

create policy "diary_updates: owner, supporters and admins read" on public.diary_updates
  for select using (
    exists (
      select 1 from public.sponsored_people sp
      where sp.id = person_id and sp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.subscriptions s
      where s.person_id = diary_updates.person_id
        and s.user_id = auth.uid()
        and s.status = 'active'
    )
    or public.is_admin()
  );

-- 2. Teasers for everyone: no content, no media.
create or replace function public.update_teasers(p_person_id uuid default null)
returns table (id uuid, person_id uuid, kind text, title text, created_at timestamptz)
language sql
stable
security definer set search_path = public
as $$
  select d.id, d.person_id, d.kind, d.title, d.created_at
  from public.diary_updates d
  join public.sponsored_people sp on sp.id = d.person_id
  where sp.status = 'active'
    and (p_person_id is null or d.person_id = p_person_id)
  order by d.created_at desc
  limit 200;
$$;

grant execute on function public.update_teasers(uuid) to anon, authenticated;

-- 3. Private media. Files live under <owner user_id>/..., readable by the owner,
--    their active supporters, and admins (via short-lived signed URLs).
update storage.buckets set public = false where id = 'diary-media';

drop policy if exists "diary-media: public read" on storage.objects;

create policy "diary-media: owner, supporters and admins read" on storage.objects
  for select using (
    bucket_id = 'diary-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1
        from public.sponsored_people sp
        join public.subscriptions s on s.person_id = sp.id
        where sp.user_id::text = (storage.foldername(name))[1]
          and s.user_id = auth.uid()
          and s.status = 'active'
      )
    )
  );
