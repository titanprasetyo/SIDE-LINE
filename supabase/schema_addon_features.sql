-- ==============================================================================
-- ADDON FEATURES: LIVE MUSIC, VENUE BOOKING, TIM & OWNER, FASILITAS CAFÉ
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda
-- ==============================================================================

-- 1. TABEL LIVE MUSIC (Jadwal & Foto Live Music)
create table if not exists public.live_music_schedules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  performer text,
  day_time text not null,
  image_url text,
  description text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed data awal live music
insert into public.live_music_schedules (title, performer, day_time, description, is_active)
values 
  ('Acoustic Sunset Session', 'Special Guest Musician', 'Setiap Sabtu | 19:30 - 22:00 WIB', 'Menemani malam akhir pekan Anda dengan lantunan lagu-lagu akustik favorit santai dan hangat.', true),
  ('Jazz & Chill Night', 'Local Jazz Community', 'Setiap Minggu | 19:00 - 21:30 WIB', 'Nikmati suasana santai dengan alunan smooth jazz bersama secangkir kopi pilihan.', true)
on conflict do nothing;


-- 2. TABEL SPACE BOOKINGS (Paket Sewa Tempat, Ruang Meeting & Event)
create table if not exists public.space_bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  capacity text,
  facilities text,
  price_info text,
  image_url text,
  description text,
  contact_phone text default '+62 812-3456-7890',
  is_available boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed data awal ruang / booking tempat
insert into public.space_bookings (name, capacity, facilities, price_info, description, contact_phone, is_available)
values 
  ('Meeting & Co-working Space', '10 - 20 Orang', 'Wi-Fi Cepat, TV Screen/Proyektor, Stopkontak tiap meja, AC dingin', 'Mulai Rp 50.000 / orang (Free Drink)', 'Ruang kondusif dan nyaman untuk meeting kantor, diskusi proyek, atau belajar bersama kelompok.', '+62 812-3456-7890', true),
  ('Private Gathering & Birthday Party', '30 - 60 Orang', 'Area Semi-Outdoor / Indoor, Sound System, Mic, Pilihan Menu Paket Buffet', 'Paket fleksibel sesuai kebutuhan acara', 'Rayakan momen spesial ulang tahun, reuni, bridal shower, atau nobar komunitas bersama kami.', '+62 812-3456-7890', true)
on conflict do nothing;


-- 3. TABEL TEAMS (Daftar Owner & Pegawai)
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  photo_url text,
  bio text,
  instagram text,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed data tim awal
insert into public.teams (name, role, bio, instagram, order_index)
values 
  ('Owner SIDE LINE', 'Founder & Owner', 'Mendedikasikan antusiasme kopi dan kenyamanan ruang untuk masyarakat.', '@sideline.coffee', 1),
  ('Head Barista', 'Head Barista & Roaster', 'Menjaga standar kualitas dan konsistensi racikan espresso serta manual brew.', '@sideline.coffee', 2),
  ('Service Lead', 'Head of Hospitality', 'Memastikan setiap pengunjung merasakan keramahan dan kenyamanan terbaik.', '@sideline.coffee', 3)
on conflict do nothing;


-- 4. TABEL FACILITIES (Fasilitas Café: Toilet, Game, Musholla, dll)
create table if not exists public.facilities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text default '✨',
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed fasilitas café lengkap
insert into public.facilities (name, icon, description)
values 
  ('Toilet Bersih & Wangi', '🚻', 'Toilet pria dan wanita yang senantiasa terjaga kebersihan dan kenyamanannya.'),
  ('Board Games & Card Games', '🎲', 'Koleksi permainan seru (Uno, Werewolf, Catur, dll) untuk bermain bareng sahabat.'),
  ('Wi-Fi Berkecepatan Tinggi', '📶', 'Koneksi internet stabil dan kencang untuk kerja (WFC) atau browsing santai.'),
  ('Stopkontak di Tiap Meja', '🔌', 'Tersedia colokan listrik di hampir setiap sudut meja kerja dan santai.'),
  ('Musholla Nyaman', '🕌', 'Tempat ibadah yang bersih dan tenang lengkap dengan peralatan sholat.'),
  ('Area Smoking & Non-Smoking', '🌿', 'Zonasi ruangan yang terpisah dengan sirkulasi udara baik dan ruangan ber-AC.'),
  ('Area Parkir Luas & Aman', '🅿️', 'Kapasitas parkir kendaraan roda 2 dan roda 4 yang memadai dengan penjagaan.')
on conflict do nothing;


-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & GRANTS
-- ==============================================================================

alter table public.live_music_schedules enable row level security;
alter table public.space_bookings enable row level security;
alter table public.teams enable row level security;
alter table public.facilities enable row level security;

-- Public can Read
drop policy if exists "Allow public read live_music" on public.live_music_schedules;
create policy "Allow public read live_music" on public.live_music_schedules for select using (true);

drop policy if exists "Allow public read space_bookings" on public.space_bookings;
create policy "Allow public read space_bookings" on public.space_bookings for select using (true);

drop policy if exists "Allow public read teams" on public.teams;
create policy "Allow public read teams" on public.teams for select using (true);

drop policy if exists "Allow public read facilities" on public.facilities;
create policy "Allow public read facilities" on public.facilities for select using (true);

-- Admin can ALL
drop policy if exists "Allow admin all live_music" on public.live_music_schedules;
create policy "Allow admin all live_music" on public.live_music_schedules for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all space_bookings" on public.space_bookings;
create policy "Allow admin all space_bookings" on public.space_bookings for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all teams" on public.teams;
create policy "Allow admin all teams" on public.teams for all to authenticated using (true) with check (true);

drop policy if exists "Allow admin all facilities" on public.facilities;
create policy "Allow admin all facilities" on public.facilities for all to authenticated using (true) with check (true);

-- PostgreSQL Role Permissions (GRANT)
grant select on all tables in schema public to anon;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated, anon;


-- ==============================================================================
-- 6. STORAGE BUCKETS TAMBAHAN (team-images, livemusic-images)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('team-images', 'team-images', true),
  ('livemusic-images', 'livemusic-images', true)
on conflict (id) do update set public = true;

-- Public Read Storage Policies
drop policy if exists "Public Access team-images" on storage.objects;
create policy "Public Access team-images" on storage.objects for select using (bucket_id = 'team-images');

drop policy if exists "Public Access livemusic-images" on storage.objects;
create policy "Public Access livemusic-images" on storage.objects for select using (bucket_id = 'livemusic-images');

-- Admin Manage Storage Policies
drop policy if exists "Admin all team-images" on storage.objects;
create policy "Admin all team-images" on storage.objects for all to authenticated using (bucket_id = 'team-images') with check (bucket_id = 'team-images');

drop policy if exists "Admin all livemusic-images" on storage.objects;
create policy "Admin all livemusic-images" on storage.objects for all to authenticated using (bucket_id = 'livemusic-images') with check (bucket_id = 'livemusic-images');
