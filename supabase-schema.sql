-- ============================================
-- Portfolio Database Schema - Supabase
-- ============================================
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  full_name text,
  title text,
  bio text,
  photo_url text,
  location text,
  email text,
  phone text,
  resume_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 2. SOCIAL LINKS TABLE
-- ============================================
create table social_links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  url text not null,
  icon text not null default 'fa-link',
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- 3. CERTIFICATE CATEGORIES TABLE
-- ============================================
create table certificate_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- 4. CERTIFICATES TABLE
-- ============================================
create table certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references certificate_categories(id) on delete cascade,
  name text not null,
  image_url text,
  issuer text,
  credential_url text,
  completed boolean default false,
  completed_at timestamptz,
  progress int default 0 check (progress >= 0 and progress <= 100),
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- 5. PROJECTS TABLE
-- ============================================
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  github_url text,
  demo_url text,
  image_url text,
  technologies text[] default '{}',
  featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table social_links enable row level security;
alter table certificate_categories enable row level security;
alter table certificates enable row level security;
alter table projects enable row level security;

-- PUBLIC READ POLICIES (anyone can view the portfolio)
create policy "Public read profiles" on profiles for select using (true);
create policy "Public read social_links" on social_links for select using (true);
create policy "Public read certificate_categories" on certificate_categories for select using (true);
create policy "Public read certificates" on certificates for select using (true);
create policy "Public read projects" on projects for select using (true);

-- OWNER WRITE POLICIES (only authenticated owner can modify)
create policy "Owner insert profiles" on profiles for insert with check (auth.uid() = user_id);
create policy "Owner update profiles" on profiles for update using (auth.uid() = user_id);
create policy "Owner delete profiles" on profiles for delete using (auth.uid() = user_id);

create policy "Owner insert social_links" on social_links for insert with check (auth.uid() = user_id);
create policy "Owner update social_links" on social_links for update using (auth.uid() = user_id);
create policy "Owner delete social_links" on social_links for delete using (auth.uid() = user_id);

create policy "Owner insert certificate_categories" on certificate_categories for insert with check (auth.uid() = user_id);
create policy "Owner update certificate_categories" on certificate_categories for update using (auth.uid() = user_id);
create policy "Owner delete certificate_categories" on certificate_categories for delete using (auth.uid() = user_id);

create policy "Owner insert certificates" on certificates for insert with check (auth.uid() = user_id);
create policy "Owner update certificates" on certificates for update using (auth.uid() = user_id);
create policy "Owner delete certificates" on certificates for delete using (auth.uid() = user_id);

create policy "Owner insert projects" on projects for insert with check (auth.uid() = user_id);
create policy "Owner update projects" on projects for update using (auth.uid() = user_id);
create policy "Owner delete projects" on projects for delete using (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in the SQL Editor as well

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('certificates', 'certificates', true);
insert into storage.buckets (id, name, public) values ('projects', 'projects', true);

-- Storage policies - public read
create policy "Public read avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Public read certificates" on storage.objects for select using (bucket_id = 'certificates');
create policy "Public read projects" on storage.objects for select using (bucket_id = 'projects');

-- Storage policies - authenticated upload/update/delete
create policy "Auth upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Auth update avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Auth delete avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Auth upload certificates" on storage.objects for insert with check (bucket_id = 'certificates' and auth.role() = 'authenticated');
create policy "Auth update certificates" on storage.objects for update using (bucket_id = 'certificates' and auth.role() = 'authenticated');
create policy "Auth delete certificates" on storage.objects for delete using (bucket_id = 'certificates' and auth.role() = 'authenticated');

create policy "Auth upload projects" on storage.objects for insert with check (bucket_id = 'projects' and auth.role() = 'authenticated');
create policy "Auth update projects" on storage.objects for update using (bucket_id = 'projects' and auth.role() = 'authenticated');
create policy "Auth delete projects" on storage.objects for delete using (bucket_id = 'projects' and auth.role() = 'authenticated');

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
