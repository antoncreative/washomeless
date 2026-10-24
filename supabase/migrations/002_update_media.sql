-- Diary updates can now be text, photo, or voice posts.

alter table public.diary_updates
  add column kind text not null default 'text' check (kind in ('text', 'photo', 'voice')),
  add column audio_url text;

alter table public.diary_updates alter column content set default '';

-- Public bucket for update photos and voice notes.
-- Files are stored under <user_id>/..., and users can only upload into their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'diary-media',
  'diary-media',
  true,
  15728640, -- 15 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
)
on conflict (id) do nothing;

create policy "diary-media: public read" on storage.objects
  for select using (bucket_id = 'diary-media');

create policy "diary-media: sponsored person uploads own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'diary-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.sponsored_people sp
      where sp.user_id = auth.uid() and sp.status = 'active'
    )
  );
