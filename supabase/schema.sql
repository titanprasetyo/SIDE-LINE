-- ==============================================================================
-- SKEMA DATABASE LENGKAP: SIDE LINE COMPANY PROFILE & ADMIN CMS
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ==============================================================================

-- 1. EXTENSION (Untuk generate UUID jika diperlukan)
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. TABEL PROFILES (Untuk menyimpan info role admin berdasarkan auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  role text default 'admin' check (role in ('admin', 'staff')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger otomatis membuat profile setiap kali user baru terdaftar di Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==============================================================================
-- 3. TABEL CATEGORIES (Kategori Menu, misal: Coffee, Non-Coffee, Food, Snacks)
-- ==============================================================================
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed kategori awal
insert into public.categories (name, slug)
values 
  ('Coffee', 'coffee'),
  ('Non-Coffee', 'non-coffee'),
  ('Food', 'food'),
  ('Signature', 'signature')
on conflict (name) do nothing;


-- ==============================================================================
-- 4. TABEL MENUS (Daftar Menu Café)
-- ==============================================================================
create table if not exists public.menus (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12, 0) not null default 0,
  image_url text,
  is_available boolean default true not null,
  is_featured boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==============================================================================
-- 5. TABEL GALLERIES (Foto Suasana & Kegiatan Café)
-- ==============================================================================
create table if not exists public.galleries (
  id uuid default gen_random_uuid() primary key,
  title text,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==============================================================================
-- 6. TABEL PROMOS (Promo & Event Café)
-- ==============================================================================
create table if not exists public.promos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  start_date date,
  end_date date,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==============================================================================
-- 7. TABEL CAFE_INFORMATION (Informasi Profil, Kontak, Alamat & Jam Buka)
-- ==============================================================================
create table if not exists public.cafe_information (
  id int primary key default 1 check (id = 1),
  name text not null default 'SIDE LINE',
  tagline text default 'Coffee • Eatery • Space',
  about_text text default 'SIDE LINE adalah cafe yang menghadirkan pengalaman menikmati kopi pilihan, hidangan lezat, dan suasana ruang yang hangat untuk berkumpul, bekerja, maupun bersantai.',
  address text default 'Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan, Banten 15418',
  google_maps_url text default 'https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan,+Banten+15418',
  phone text default '+62 812-3456-7890',
  instagram text default '@sideline.coffee',
  opening_hours text default 'Setiap Hari: 09:00 - 22:00 WIB',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert data profil default awal
insert into public.cafe_information (
  id, name, tagline, about_text, address, google_maps_url, phone, instagram, opening_hours
)
values (
  1,
  'SIDE LINE',
  'Coffee • Eatery • Space',
  'SIDE LINE adalah cafe yang menghadirkan pengalaman menikmati kopi pilihan, hidangan lezat, dan suasana ruang yang hangat untuk berkumpul, bekerja, maupun bersantai.',
  'Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan, Banten 15418',
  'https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan,+Banten+15418',
  '+62 812-3456-7890',
  '@sideline.coffee',
  'Setiap Hari: 09:00 - 22:00 WIB'
)
on conflict (id) do nothing;


-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) - KEAMANAN DATA
-- ==============================================================================

-- Aktifkan RLS di setiap tabel
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.menus enable row level security;
alter table public.galleries enable row level security;
alter table public.promos enable row level security;
alter table public.cafe_information enable row level security;

-- A. KEBIJAKAN PUBLIC (Anonim & Authenticated bisa membaca data publik)
drop policy if exists "Allow public read categories" on public.categories;
create policy "Allow public read categories" on public.categories for select using (true);

drop policy if exists "Allow public read menus" on public.menus;
create policy "Allow public read menus" on public.menus for select using (true);

drop policy if exists "Allow public read galleries" on public.galleries;
create policy "Allow public read galleries" on public.galleries for select using (true);

drop policy if exists "Allow public read promos" on public.promos;
create policy "Allow public read promos" on public.promos for select using (true);

drop policy if exists "Allow public read cafe_information" on public.cafe_information;
create policy "Allow public read cafe_information" on public.cafe_information for select using (true);

-- B. KEBIJAKAN ADMIN (Hanya user authenticated yang boleh INSERT, UPDATE, DELETE)
drop policy if exists "Allow admin all categories" on public.categories;
create policy "Allow admin all categories" on public.categories 
  for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all menus" on public.menus;
create policy "Allow admin all menus" on public.menus 
  for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all galleries" on public.galleries;
create policy "Allow admin all galleries" on public.galleries 
  for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all promos" on public.promos;
create policy "Allow admin all promos" on public.promos 
  for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all cafe_information" on public.cafe_information;
create policy "Allow admin all cafe_information" on public.cafe_information 
  for all to authenticated using (true) with check (true);

-- C. KEBIJAKAN PROFILES
drop policy if exists "Allow users to read their own profile" on public.profiles;
create policy "Allow users to read their own profile" on public.profiles 
  for select to authenticated using (auth.uid() = id);

drop policy if exists "Allow users to update their own profile" on public.profiles;
create policy "Allow users to update their own profile" on public.profiles 
  for update to authenticated using (auth.uid() = id);


-- ==============================================================================
-- 9. STORAGE BUCKETS (menu-images, gallery-images, promo-images)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('menu-images', 'menu-images', true),
  ('gallery-images', 'gallery-images', true),
  ('promo-images', 'promo-images', true)
on conflict (id) do update set public = true;

-- Storage Policies: Public Read
drop policy if exists "Public Access menu-images" on storage.objects;
create policy "Public Access menu-images" on storage.objects 
  for select using (bucket_id = 'menu-images');

drop policy if exists "Public Access gallery-images" on storage.objects;
create policy "Public Access gallery-images" on storage.objects 
  for select using (bucket_id = 'gallery-images');

drop policy if exists "Public Access promo-images" on storage.objects;
create policy "Public Access promo-images" on storage.objects 
  for select using (bucket_id = 'promo-images');

-- Storage Policies: Admin Upload, Update, Delete
drop policy if exists "Admin all menu-images" on storage.objects;
create policy "Admin all menu-images" on storage.objects 
  for all to authenticated using (bucket_id = 'menu-images') with check (bucket_id = 'menu-images');

drop policy if exists "Admin all gallery-images" on storage.objects;
create policy "Admin all gallery-images" on storage.objects 
  for all to authenticated using (bucket_id = 'gallery-images') with check (bucket_id = 'gallery-images');

drop policy if exists "Admin all promo-images" on storage.objects;
create policy "Admin all promo-images" on storage.objects 
  for all to authenticated using (bucket_id = 'promo-images') with check (bucket_id = 'promo-images');


-- ==============================================================================
-- 9B. TABEL HOME_BANNERS (Banner & Foto Khusus Halaman Beranda / Hero)
-- ==============================================================================
create table if not exists public.home_banners (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'SIDE LINE Space',
  subtitle text default 'Ruang seduhan kopi & atmosfer hangat terkurasi',
  badge text default 'AMBIENCE ARCHIVE',
  image_url text not null,
  placement text default 'hero_primary' check (placement in ('hero_primary', 'hero_secondary')),
  is_active boolean default true not null,
  order_index int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.home_banners enable row level security;
drop policy if exists "Allow public read home_banners" on public.home_banners;
create policy "Allow public read home_banners" on public.home_banners for select using (true);

drop policy if exists "Allow admin all home_banners" on public.home_banners;
create policy "Allow admin all home_banners" on public.home_banners for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access hero-images" on storage.objects;
create policy "Public Access hero-images" on storage.objects for select using (bucket_id = 'hero-images');

drop policy if exists "Admin all hero-images" on storage.objects;
create policy "Admin all hero-images" on storage.objects for all to authenticated using (bucket_id = 'hero-images') with check (bucket_id = 'hero-images');

-- ==============================================================================
-- 10. GRANT PERMISSIONS (MEMBERIKAN HAK AKSES TABEL KE ROLE SUPABASE)
-- Wajib dijalankan agar role anon dan authenticated memiliki izin tabel di PostgreSQL
-- ==============================================================================
grant usage on schema public to anon, authenticated;

-- Izin membaca (SELECT) untuk role anon (pengunjung publik)
grant select on all tables in schema public to anon;
alter default privileges in schema public grant select on tables to anon;

-- Izin penuh (ALL) untuk role authenticated (admin yang sudah login)
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all routines in schema public to authenticated;

alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant all on routines to authenticated;
