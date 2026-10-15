-- ==============================================================================
-- TABEL & STORAGE: HOME HERO & BANNER BERANDA
-- Fitur pengelolaan foto khusus halaman beranda (Hero Primary & Secondary)
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ==============================================================================

-- 1. TABEL HOME_BANNERS
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

-- Index untuk sorting
create index if not exists idx_home_banners_placement_active on public.home_banners(placement, is_active, order_index);

-- 2. ROW LEVEL SECURITY (RLS)
alter table public.home_banners enable row level security;

-- Public (anon & authenticated) dapat melihat banner aktif
drop policy if exists "Allow public read home_banners" on public.home_banners;
create policy "Allow public read home_banners" on public.home_banners 
  for select using (true);

-- Admin (authenticated) dapat menambah, mengubah, dan menghapus banner
drop policy if exists "Allow admin all home_banners" on public.home_banners;
create policy "Allow admin all home_banners" on public.home_banners 
  for all to authenticated using (true) with check (true);

-- 3. PERMISSIONS (GRANT)
grant select on public.home_banners to anon;
grant all on public.home_banners to authenticated;

-- 4. STORAGE BUCKET: hero-images
insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do update set public = true;

-- Storage Read Policy: Public
drop policy if exists "Public Access hero-images" on storage.objects;
create policy "Public Access hero-images" on storage.objects 
  for select using (bucket_id = 'hero-images');

-- Storage Manage Policy: Admin
drop policy if exists "Admin all hero-images" on storage.objects;
create policy "Admin all hero-images" on storage.objects 
  for all to authenticated using (bucket_id = 'hero-images') with check (bucket_id = 'hero-images');
