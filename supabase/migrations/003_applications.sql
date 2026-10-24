-- Applications: applicants can only submit a pending profile, once per account,
-- and approval turns their account into a sponsored account.

-- One application per account.
create unique index if not exists sponsored_people_user_id_key
  on public.sponsored_people(user_id) where user_id is not null;

-- Previously an applicant could insert any status (e.g. 'active') and skip review.
drop policy if exists "sponsored_people: anyone can apply (insert)" on public.sponsored_people;

create policy "sponsored_people: anyone can apply (insert)" on public.sponsored_people
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and current_supporters = 0
  );

create or replace function public.handle_person_approved()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only act when status changes to 'active' for the first time
  if new.status = 'active' and old.status = 'pending' then
    insert into public.milestones (person_id, title, description, sort_order) values
      (new.id, 'Stable Housing', 'Secure safe and stable housing', 1),
      (new.id, 'Therapy & Mental Health', 'Begin regular therapy sessions', 2),
      (new.id, 'Job Training', 'Complete a job training or certification program', 3),
      (new.id, 'Savings Goal', 'Build a 3-month emergency fund', 4);

    -- Give the applicant access to My Profile and posting updates (never downgrade an admin)
    if new.user_id is not null then
      update public.profiles
      set role = 'sponsored', updated_at = now()
      where id = new.user_id and role = 'donor';
    end if;
  end if;
  return new;
end;
$$;
