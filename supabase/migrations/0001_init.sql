-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.role_type as enum ('owner', 'admin');
create type public.session_status as enum ('scheduled', 'open', 'closed');
create type public.attendance_method as enum ('scan', 'manual');

-- Tables
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  role public.role_type not null default 'admin',
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  external_student_id text,
  badge_token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_students (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.class_admins (
  class_id uuid not null references public.classes(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, profile_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.session_status not null default 'scheduled',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  scanned_by uuid references public.profiles(id) on delete set null,
  scanned_at timestamptz not null default now(),
  method public.attendance_method not null default 'scan',
  unique (session_id, student_id)
);

-- Indexes
create index if not exists students_org_name_idx on public.students (org_id, full_name);
create index if not exists attendance_session_idx on public.attendance (session_id);
create index if not exists sessions_class_start_idx on public.sessions (class_id, start_time);

-- Helper functions
create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

-- RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.class_students enable row level security;
alter table public.class_admins enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;

-- Organizations
create policy "org read" on public.organizations
for select to authenticated
using (true);

create policy "org insert first" on public.organizations
for insert to authenticated
with check (not exists (select 1 from public.organizations));

create policy "org update owner" on public.organizations
for update to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Profiles
create policy "profile read self" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_owner());

create policy "profile update self" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profile update owner" on public.profiles
for update to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Classes
create policy "classes select" on public.classes
for select to authenticated
using (
  public.is_owner() or exists (
    select 1 from public.class_admins ca
    where ca.class_id = classes.id and ca.profile_id = auth.uid()
  )
);

create policy "classes insert" on public.classes
for insert to authenticated
with check (public.is_owner());

create policy "classes update" on public.classes
for update to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "classes delete" on public.classes
for delete to authenticated
using (public.is_owner());

-- Students
create policy "students select" on public.students
for select to authenticated
using (public.is_owner() or org_id = public.current_org_id());

create policy "students insert" on public.students
for insert to authenticated
with check (public.is_owner());

create policy "students update" on public.students
for update to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "students delete" on public.students
for delete to authenticated
using (public.is_owner());

-- Class students
create policy "class_students select" on public.class_students
for select to authenticated
using (
  public.is_owner() or exists (
    select 1 from public.class_admins ca
    where ca.class_id = class_students.class_id and ca.profile_id = auth.uid()
  )
);

create policy "class_students manage" on public.class_students
for insert to authenticated
with check (public.is_owner());

create policy "class_students update" on public.class_students
for update to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "class_students delete" on public.class_students
for delete to authenticated
using (public.is_owner());

-- Class admins
create policy "class_admins select" on public.class_admins
for select to authenticated
using (public.is_owner());

create policy "class_admins manage" on public.class_admins
for insert to authenticated
with check (public.is_owner());

create policy "class_admins update" on public.class_admins
for update to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "class_admins delete" on public.class_admins
for delete to authenticated
using (public.is_owner());

-- Sessions
create policy "sessions select" on public.sessions
for select to authenticated
using (
  public.is_owner() or exists (
    select 1 from public.class_admins ca
    where ca.class_id = sessions.class_id and ca.profile_id = auth.uid()
  )
);

create policy "sessions insert" on public.sessions
for insert to authenticated
with check (public.is_owner());

create policy "sessions update" on public.sessions
for update to authenticated
using (
  public.is_owner() or exists (
    select 1 from public.class_admins ca
    where ca.class_id = sessions.class_id and ca.profile_id = auth.uid()
  )
)
with check (
  public.is_owner() or exists (
    select 1 from public.class_admins ca
    where ca.class_id = sessions.class_id and ca.profile_id = auth.uid()
  )
);

create policy "sessions delete" on public.sessions
for delete to authenticated
using (public.is_owner());

-- Attendance
create policy "attendance select" on public.attendance
for select to authenticated
using (
  public.is_owner() or exists (
    select 1 from public.sessions s
    join public.class_admins ca on ca.class_id = s.class_id
    where s.id = attendance.session_id and ca.profile_id = auth.uid()
  )
);

create policy "attendance insert" on public.attendance
for insert to authenticated
with check (
  public.is_owner() or exists (
    select 1 from public.sessions s
    join public.class_admins ca on ca.class_id = s.class_id
    where s.id = attendance.session_id and ca.profile_id = auth.uid()
  )
);

create policy "attendance delete" on public.attendance
for delete to authenticated
using (public.is_owner());

-- Public badge function
create or replace function public.get_student_badge(token text)
returns table (full_name text, badge_token text)
language sql
security definer
stable
as $$
  select full_name, badge_token
  from public.students
  where badge_token = token
  limit 1;
$$;

grant execute on function public.get_student_badge(text) to anon;

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
