# SkillBuddy

Website and admin panel for SkillBuddy's live cohort programs, built from the `SkillBuddy_Prototype.html` design.

- **Frontend:** Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4
- **Backend:** Supabase: Postgres with Row Level Security, Auth (admin login), Storage (images)

## What's included

**Public site**
- `/`: home page (hero, upcoming cohorts, filterable programs, how it works, mentors, reviews, FAQs, call-back form)
- `/courses/[slug]`: cohort page (enrol card with batch picker, outcomes, curriculum, projects, typical week, lead mentor, application form, counsellor form)
- Forms write to Supabase. Visitors can only *insert* rows; they can never read them back.

**Admin panel** (`/admin`)
- Dashboard with counts and the latest submissions
- Applications and call-back leads: filter, change status, add notes, call / WhatsApp links, CSV export
- Courses: every field on the cohort page, including batches, outcomes, modules, projects and the weekly plan (add, reorder, remove), plus publish/feature toggles
- Mentors and reviews with photo upload to Supabase Storage, FAQs, site settings (announcement bar, hero copy)

Public pages are cached and rebuilt at most every 60 s. Saving anything in the admin panel refreshes them immediately.

## Setup

### 1. Create the database

Use a Supabase project ([supabase.com](https://supabase.com)). Then **either**:

- **CLI:** `npx supabase login`, `npx supabase link --project-ref <ref>`, `npx supabase db push`, then run `supabase/seed.sql` in the SQL editor to load the prototype content; **or**
- **Dashboard:** open the SQL editor and run `supabase/migrations/20261108000000_init.sql`, then `supabase/seed.sql`.

### 2. Configure the app

```bash
cp .env.example .env.local   # fill in URL + publishable key
npm install
npm run dev
```

Without `.env.local` the public site still runs on the built-in demo content, so you can preview the design. The admin panel needs Supabase.

### 3. Create your first admin

1. Supabase dashboard → **Authentication → Users → Add user** (email + password, tick "auto confirm").
2. In the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign in at `/admin/login`.

Also turn off public sign-ups (**Authentication → Sign In / Providers → Allow new users to sign up**). Accounts without the `admin` role can't reach the admin panel or any data, but there's no reason to allow sign-ups at all.

## Local Supabase (optional, needs Docker)

```bash
npx supabase start     # applies the migration + seed
npx supabase status    # prints the URL and publishable key for .env.local
```

## Project layout

```
src/app/page.tsx                    home
src/app/courses/[slug]/page.tsx     cohort page
src/app/actions.ts                  public form actions (lead, application)
src/app/admin/login/                sign-in / sign-out
src/app/admin/(panel)/…             admin pages + server actions
src/app/admin/export/[kind]/        CSV export
src/lib/data.ts                     public queries (demo fallback)
src/lib/auth.ts                     requireAdmin() – used by every admin page and action
src/lib/demo-data.ts                prototype content → also generates supabase/seed.sql
src/proxy.ts                        refreshes the session, guards /admin
supabase/migrations/                schema, RLS policies, storage bucket
```

## Security model

- Every table has RLS. Anonymous visitors can read only published content and can only insert `new` leads and applications.
- `public.is_admin()` checks `profiles.role = 'admin'`. All admin writes go through the visitor's own session, so the database enforces this itself. No service-role key is used by the app.
- Every admin server action calls `requireAdmin()` again; it doesn't rely on the page that rendered the form.
- Public forms validate input server-side and have a honeypot field. Before launch, consider adding rate limiting or a CAPTCHA (e.g. Cloudflare Turnstile).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run seed:sql` | Regenerate `supabase/seed.sql` from `src/lib/demo-data.ts` |

## Before launch

The content keeps the prototype's placeholders (`[Mentor name]`, `[Company]`, learner quotes, the EMI and refund FAQ answers). Replace them in the admin panel. The footer's legal links (privacy, terms, refund) still point to placeholder anchors.
