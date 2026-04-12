-- ============================================
-- MIGRAÇÃO - Rodar no Supabase SQL Editor
-- Apenas o que é NOVO (tabelas e policies já existentes não estão incluídas)
-- ============================================

-- 1. Nova tabela: arquivos de projeto vinculados a certificados
create table certificate_project_files (
  id uuid default uuid_generate_v4() primary key,
  certificate_id uuid references certificates(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  description text,
  created_at timestamptz default now()
);

-- 2. RLS para a nova tabela
alter table certificate_project_files enable row level security;

create policy "Public read certificate_project_files" on certificate_project_files for select using (true);

create policy "Owner insert certificate_project_files" on certificate_project_files for insert with check (
  exists (select 1 from certificates c where c.id = certificate_id and c.user_id = auth.uid())
);

create policy "Owner delete certificate_project_files" on certificate_project_files for delete using (
  exists (select 1 from certificates c where c.id = certificate_id and c.user_id = auth.uid())
);

-- 3. Novo bucket de storage para arquivos de projeto
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', true);

create policy "Public read project-files" on storage.objects for select using (bucket_id = 'project-files');
create policy "Auth upload project-files" on storage.objects for insert with check (bucket_id = 'project-files' and auth.role() = 'authenticated');
create policy "Auth update project-files" on storage.objects for update using (bucket_id = 'project-files' and auth.role() = 'authenticated');
create policy "Auth delete project-files" on storage.objects for delete using (bucket_id = 'project-files' and auth.role() = 'authenticated');

-- ============================================
-- 4. Novas colunas na tabela profiles
-- (github_username, whatsapp_number, company_name, company_start_date)
-- ============================================
alter table profiles add column if not exists github_username text;
alter table profiles add column if not exists whatsapp_number text;
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists company_start_date date;

-- ============================================
-- 5. Nova tabela: radio_tracks (músicas da rádio)
-- ============================================
create table radio_tracks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  youtube_id text not null,
  active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

alter table radio_tracks enable row level security;

create policy "Public read radio_tracks" on radio_tracks for select using (true);
create policy "Owner insert radio_tracks" on radio_tracks for insert with check (auth.uid() = user_id);
create policy "Owner update radio_tracks" on radio_tracks for update using (auth.uid() = user_id);
create policy "Owner delete radio_tracks" on radio_tracks for delete using (auth.uid() = user_id);

-- ============================================
-- 6. Nova tabela: companies (empresas contribuídas)
-- ============================================
create table companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  website_url text,
  description text,
  display_order int default 0,
  created_at timestamptz default now()
);

alter table companies enable row level security;

create policy "Public read companies" on companies for select using (true);
create policy "Owner insert companies" on companies for insert with check (auth.uid() = user_id);
create policy "Owner update companies" on companies for update using (auth.uid() = user_id);
create policy "Owner delete companies" on companies for delete using (auth.uid() = user_id);

-- Bucket para logos de empresas
insert into storage.buckets (id, name, public) values ('companies', 'companies', true);

create policy "Public read companies bucket" on storage.objects for select using (bucket_id = 'companies');
create policy "Auth upload companies bucket" on storage.objects for insert with check (bucket_id = 'companies' and auth.role() = 'authenticated');
create policy "Auth update companies bucket" on storage.objects for update using (bucket_id = 'companies' and auth.role() = 'authenticated');
create policy "Auth delete companies bucket" on storage.objects for delete using (bucket_id = 'companies' and auth.role() = 'authenticated');

-- ============================================
-- 7. Bucket para currículo (PDFs)
-- ============================================
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true);

create policy "Public read resumes" on storage.objects for select using (bucket_id = 'resumes');
create policy "Auth upload resumes" on storage.objects for insert with check (bucket_id = 'resumes' and auth.role() = 'authenticated');
create policy "Auth update resumes" on storage.objects for update using (bucket_id = 'resumes' and auth.role() = 'authenticated');
create policy "Auth delete resumes" on storage.objects for delete using (bucket_id = 'resumes' and auth.role() = 'authenticated');
