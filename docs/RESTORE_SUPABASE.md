# Bringing Supabase back

On 2026-11-08 the Supabase project (`timzamvdrzbfklxnwlco`) was deleted to free up a project slot.
The website still runs in **offline mode**: it shows example profiles only, and login, apply,
dashboard, admin and payments redirect to `/paused`.

Offline mode turns on whenever `NEXT_PUBLIC_SUPABASE_URL` is missing (`apps/web/lib/supabase/config.ts`).
Once the Supabase env vars are set again, everything switches back on. No code changes are needed.

> **Easiest way:** open this repo in Claude Code and say
> *"Restore Supabase using docs/RESTORE_SUPABASE.md"*. Claude does the technical parts;
> you only need to do the dashboard clicks marked **You**.

---

## What was saved

The backup is **only on this computer**, in `backups/supabase-2026-11-08/`. It is not on GitHub because it
contains personal data.

| File | Contents |
|---|---|
| `profiles.json` | 9 user profiles (with roles: donor / sponsored / admin) |
| `auth_users.json` | 9 login accounts (emails, IDs). **Passwords were not exported.** |
| `sponsored_people.json` | 1 person (status `active`) |
| `diary_updates.json` | 1 update (a voice note) |
| `milestones.json` | 4 milestones |
| `subscriptions.json` | empty, nobody had subscribed |
| `buckets.json` | storage bucket settings (`diary-media` private, `avatars` public) |
| `storage/diary-media/…` | 1 voice note (`.m4a`) |
| `storage/avatars/…` | 1 avatar photo (`.jpg`) |
| `../env.local.bak` | the old `apps/web/.env.local` (old keys, now useless, but has the Stripe keys) |

The database structure (tables, security rules, functions, buckets) is in the repo at
`supabase/migrations/001`–`005`.

---

## Steps

### 1. Create a new project (You)
1. Go to **supabase.com/dashboard** → **New project**.
2. Pick the organization (a free org works), give it a name (e.g. `washomeless`), choose region
   **Canada (Central)**.
3. Set a database password and **save it in a password manager**. Last time it was lost.
4. Wait about 2 minutes for it to finish setting up.

### 2. Copy the keys (You)
In the new project: **Project Settings** → **API**. Copy these 3 values:
- **Project URL**
- **anon / publishable** key
- **service_role / secret** key

Paste them to Claude, or put them in `apps/web/.env.local` yourself (the lines are there, commented out
with `#`; remove the `#` and replace the values).

### 3. Create the tables (Claude, or You via SQL Editor)
Run the migration files **in order**: `001_initial.sql`, `002_update_media.sql`, `003_applications.sql`,
`004_private_updates.sql`, `005_avatars.sql`.
- With the CLI: `supabase link --project-ref <new-ref>` then `supabase db push`.
- Or in the dashboard: **SQL Editor** → paste each file → **Run**, one at a time.

### 4. Restore the data (Claude)
Notes for doing it correctly:
1. **Users first.** Create each user from `auth_users.json` through the Auth admin API
   (`POST /auth/v1/admin/users`) **keeping the same `id`** and email, with `email_confirm: true`.
   The `on_auth_user_created` trigger then creates a `profiles` row for each one with role `donor`.
2. **Then upsert `profiles.json`.** This restores names and roles (admin / sponsored). Upsert, because
   the trigger already created the rows.
3. **Then insert** `sponsored_people.json`, `milestones.json` and `diary_updates.json`, in that order.
   Inserting a person as `active` does **not** fire the approval trigger (it only fires on update from
   `pending`), so the milestones won't be duplicated.
4. **Upload the storage files** to the same paths in the `diary-media` and `avatars` buckets.
5. **Fix URLs.** `avatar_url`, `image_url` and `audio_url` contain the old project address
   `timzamvdrzbfklxnwlco.supabase.co`. Replace it with the new project's address.

### 5. Passwords (You / users)
Passwords could not be backed up. Each user (including you) logs in once with the **magic link**
option on the login page, or uses "forgot password".

### 6. Turn the website back on (You)
Vercel → `washomeless-web` → **Settings** → **Environment Variables** → **Add** these 3, for
Production, Preview and Development:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Then **Deployments** → latest → **⋯** → **Redeploy**. The `NEXT_PUBLIC_` values are baked in at
build time, so a redeploy is required.

### 7. Other settings to redo (You)
- **Auth → URL Configuration:** Site URL `https://washomeless.com`; add redirect URL
  `https://washomeless.com/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).
- **iOS app:** put the new URL + anon key in `apps/mobile/.env.local`
  (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- **Stripe:** nothing changes. The webhook points at washomeless.com, not Supabase.

### 8. Check it works
- washomeless.com shows the real person next to the example profiles.
- **Log in** appears in the menu, and you can log in and open `/admin`.
- The person's profile shows the voice-note update and avatar.
