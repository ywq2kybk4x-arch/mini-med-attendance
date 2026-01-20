# Mini Med Attendance (MVP)

QR-based attendance system built with Next.js 14, Tailwind, and Supabase.

## Features
- Mobile-first QR scanner for admins and fullscreen student badge pages
- Desktop admin dashboard with sessions, classes, students
- Supabase Auth + RLS permissions (owner/admin roles)
- Concurrent scanning with dedupe on `(session_id, student_id)`
- CSV export and manual overrides
- PWA manifest + service worker for Add to Home Screen

## Local setup

### 1) Start Supabase (local)
```bash
supabase start
```

### 2) Apply migrations
```bash
supabase db reset
```

### 3) Env vars
Copy `.env.example` to `.env.local` and fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### 4) Install deps + run
```bash
npm install
npm run dev
```

### 5) Create owner
Option A: seed script (recommended)
```bash
npm run seed
```
This creates:
- 1 org
- 1 owner user
- 2 admin users
- 1 class + 20 students
- 1 open session (1-hour window)

Option B: manual setup
1. Sign up in the app (`/login`).
2. Run SQL to promote your profile:
```sql
update public.profiles set role = 'owner' where id = '<your-auth-user-id>';
```
3. Visit `/admin/setup` to create the organization.

## Notes
- Admin scanning requires HTTPS in production and camera permissions in iOS Safari.
- PWA Add to Home Screen works after visiting `/admin` or a student badge page.
- The `/student/badge/[token]` and `/student/print/[token]` routes are public by token.

## Deployment
Deploy to Vercel and set the same env vars. Ensure Supabase URL/keys point to your hosted project.
