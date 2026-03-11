-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ENUM types
do $$ begin
    create type public.user_role as enum ('SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.user_status as enum ('ACTIVE', 'INVITED', 'DISABLED');
exception
    when duplicate_object then null;
end $$;

-- Create COMPANIES table
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique default substring(md5(random()::text) from 0 for 8),
  created_at timestamptz default now()
);

-- Enable RLS on companies
alter table public.companies enable row level security;

-- Create PROFILES table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'EMPLOYEE',
  company_id uuid references public.companies(id),
  status public.user_status not null default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create STORAGE bucket for company files
insert into storage.buckets (id, name, public) 
values ('company_files', 'company_files', false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- TRIGGER FUNCTION: Handle New User Signup
-- ----------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_company_id uuid;
  v_role public.user_role;
  v_role_req text;
begin
  -- Get metadata from signup
  v_role_req := new.raw_user_meta_data->>'role';

  -- 1. Try to find an existing company (Single Tenant Mode)
  select id into v_company_id from public.companies limit 1;

  -- 2. If no company exists, create the default one
  if v_company_id is null then
    insert into public.companies (name) values ('Default Company')
    returning id into v_company_id;
    v_role := 'SUPER_ADMIN'; -- First user of the system becomes Super Admin
  else
    -- 3. Company exists, validate requested role
    if v_role_req = 'SUPER_ADMIN' then
       v_role := 'MANAGER'; -- Prevent joining as Super Admin freely
    elsif v_role_req = 'MANAGER' then
       v_role := 'MANAGER';
    elsif v_role_req = 'CLIENT' then
       v_role := 'CLIENT';
    else
       v_role := 'EMPLOYEE';
    end if;
  end if;

  -- Create Profile
  insert into public.profiles (id, email, full_name, role, company_id, status)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(v_role, 'EMPLOYEE'),
    v_company_id,
    'ACTIVE'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------------------

-- PROFILES Policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can read company profiles" on public.profiles;
create policy "Users can read company profiles"
  on public.profiles for select
  using (company_id = (select company_id from public.profiles where id = auth.uid()));

drop policy if exists "Admins can update company profiles" on public.profiles;
create policy "Admins can update company profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles as p
      where p.id = auth.uid() 
      and p.role in ('SUPER_ADMIN', 'MANAGER')
      and p.company_id = public.profiles.company_id
    )
  );

-- COMPANIES Policies
drop policy if exists "Users can read own company" on public.companies;
create policy "Users can read own company"
  on public.companies for select
  using (id = (select company_id from public.profiles where id = auth.uid()));

drop policy if exists "Super Admin can update company" on public.companies;
create policy "Super Admin can update company"
  on public.companies for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role = 'SUPER_ADMIN'
      and company_id = public.companies.id
    )
  );

-- STORAGE Policies
-- Note: 'storage.objects' policies must handle the bucket_id check
-- 1. Read: Users can read files in their company folder
-- (Since specific policy names are global in storage schema, add prefix if needed)
drop policy if exists "Read company files" on storage.objects;
create policy "Read company files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'company_files'
  and (storage.foldername(name))[1] = (select company_id::text from public.profiles where id = auth.uid())
);

-- 2. Upload: Users can upload to their company folder
drop policy if exists "Upload company files" on storage.objects;
create policy "Upload company files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'company_files'
  and (storage.foldername(name))[1] = (select company_id::text from public.profiles where id = auth.uid())
);

-- ----------------------------------------------------------------
-- AUDIT LOGS
-- ----------------------------------------------------------------

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

-- Only Admins can view audit logs
create policy "Admins view audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role = 'SUPER_ADMIN'
    )
  );

-- Trigger to log role changes
create or replace function public.log_role_change()
returns trigger as $$
begin
  if old.role is distinct from new.role then
    insert into public.audit_logs (user_id, action, details)
    values (
      auth.uid(), -- The user performing the action (admin)
      'ROLE_CHANGE',
      jsonb_build_object(
        'target_user_id', new.id,
        'old_role', old.role,
        'new_role', new.role,
        'company_id', new.company_id
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  after update on public.profiles
  for each row execute function public.log_role_change();

