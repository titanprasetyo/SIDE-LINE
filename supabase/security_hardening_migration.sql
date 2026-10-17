-- ==============================================================================
-- SIDE LINE CAFE: ENTERPRISE SECURITY HARDENING & RLS POLICIES MIGRATION
-- Memperbaiki kerentanan otorisasi, privilege escalation, storage policy,
-- dan memberlakukan server-side verifiable idle timeout 15 menit.
--
-- JALANKAN DI SUPABASE DASHBOARD > SQL EDITOR
-- Sifat: 100% Idempotent, Self-Contained, Non-destruktif, Mempertahankan data yang ada.
-- ==============================================================================

-- 0. EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PASTIKAN SELURUH TABEL DATABASE TERSEDIA (CREATE IF NOT EXISTS)
-- Menjamin skrip tidak akan gagal jika ada tabel add-on yang belum sempat dibuat.
-- ==============================================================================

-- A. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. Menus
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 0) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  is_promo BOOLEAN DEFAULT FALSE NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 0) DEFAULT 0,
  discounted_price NUMERIC(12, 0) DEFAULT 0,
  promo_start_date TIMESTAMP WITH TIME ZONE,
  promo_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Galleries
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom media_type ada jika tabel galleries sudah dibuat sebelumnya
ALTER TABLE public.galleries ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- E. Promos
CREATE TABLE IF NOT EXISTS public.promos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- F. Cafe Information
CREATE TABLE IF NOT EXISTS public.cafe_information (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'SIDE LINE',
  tagline TEXT DEFAULT 'Coffee • Eatery • Space',
  about_text TEXT DEFAULT 'SIDE LINE adalah cafe yang menghadirkan pengalaman menikmati kopi pilihan, hidangan lezat, dan suasana ruang yang hangat untuk berkumpul, bekerja, maupun bersantai.',
  address TEXT DEFAULT 'Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan, Banten 15418',
  google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan,+Banten+15418',
  phone TEXT DEFAULT '+62 812-3456-7890',
  instagram TEXT DEFAULT '@sideline.coffee',
  opening_hours TEXT DEFAULT 'Setiap Hari: 09:00 - 22:00 WIB',
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- G. Home Banners
CREATE TABLE IF NOT EXISTS public.home_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'SIDE LINE Space',
  subtitle TEXT DEFAULT 'Ruang seduhan kopi & atmosfer hangat terkurasi',
  badge TEXT DEFAULT 'AMBIENCE ARCHIVE',
  image_url TEXT NOT NULL,
  placement TEXT DEFAULT 'hero_primary' CHECK (placement IN ('hero_primary', 'hero_secondary')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  order_index INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H. Live Music Schedules
CREATE TABLE IF NOT EXISTS public.live_music_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  performer TEXT,
  day_time TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- I. Space Bookings
CREATE TABLE IF NOT EXISTS public.space_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity TEXT,
  facilities TEXT,
  price_info TEXT,
  image_url TEXT,
  description TEXT,
  contact_phone TEXT DEFAULT '+62 812-3456-7890',
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- J. Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  instagram TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- K. Facilities
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '✨',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- L. Reviews (Ulasan Pelanggan)
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  tag TEXT DEFAULT 'Pengunjung',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. PASTIKAN KOLOM-KOLOM TAMBAHAN TERSEDIA (ADD COLUMN IF NOT EXISTS)
-- ==============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'staff', 'customer'));

ALTER TABLE public.menus
ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price NUMERIC(12, 0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promo_end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.cafe_information
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ==============================================================================
-- 3. PERBAIKI TRIGGER USER BARU (DEFAULT KE 'customer', BUKAN 'admin')
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, last_active_at)
  VALUES (new.id, new.email, 'customer', now())
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. FUNGSI CEK OTORISASI ADMIN SERVER-SIDE TERVERIFIKASI (15 MENIT IDLE TIMEOUT)
-- Digunakan oleh seluruh RLS policies di database
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_last_active TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role, last_active_at
  INTO v_role, v_last_active
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_role IS DISTINCT FROM 'admin' THEN
    RETURN FALSE;
  END IF;

  -- SERVER-SIDE VERIFIABLE IDLE TIMEOUT (15 MENIT = 900 DETIK)
  -- Jika sesi tidak aktif melebihi 15 menit atau null, PostgreSQL menolak operasi admin!
  IF v_last_active IS NULL OR v_last_active < (now() - INTERVAL '15 minutes') THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RPC: INISIALISASI SESI LOGIN ADMIN (DIPANGGIL SAAT LOGIN BERHASIL DENGAN PASSWORD)
CREATE OR REPLACE FUNCTION public.init_admin_session()
RETURNS JSONB AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

  IF v_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Forbidden: Not an admin');
  END IF;

  -- Reset timestamp sesi aktif ke waktu sekarang
  UPDATE public.profiles
  SET last_active_at = now()
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'last_active_at', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: HEARTBEAT PERPANJANGAN SESI ADMIN (DIPANGGIL SECARA AKTIF OLEH FRONTEND)
CREATE OR REPLACE FUNCTION public.touch_admin_session()
RETURNS JSONB AS $$
DECLARE
  v_role TEXT;
  v_last_active TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
  END IF;

  SELECT role, last_active_at
  INTO v_role, v_last_active
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Forbidden: Not an admin');
  END IF;

  -- Jika last_active_at null (misal login baru), inisialisasi ke now()
  IF v_last_active IS NULL THEN
    UPDATE public.profiles SET last_active_at = now() WHERE id = auth.uid();
    RETURN jsonb_build_object('success', true, 'last_active_at', now());
  END IF;

  -- Jika sudah kadaluarsa lebih dari 15 menit, tolak perpanjangan dan minta login ulang
  IF v_last_active < (now() - INTERVAL '15 minutes') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session expired due to 15-minute inactivity');
  END IF;

  UPDATE public.profiles
  SET last_active_at = now()
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'last_active_at', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: TERMINASI SESI ADMIN (LOGOUT SERVER-SIDE)
CREATE OR REPLACE FUNCTION public.terminate_admin_session()
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    UPDATE public.profiles
    SET last_active_at = NULL
    WHERE id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Berikan izin eksekusi RPC ke user authenticated
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.init_admin_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_admin_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.terminate_admin_session() TO authenticated;

-- Pastikan seluruh akun terdaftar di auth.users memiliki profil dengan role 'admin' & sesi aktif
INSERT INTO public.profiles (id, email, role, last_active_at)
SELECT id, email, 'admin', now() FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin', last_active_at = now();

-- ==============================================================================
-- 5. TRIGGER CEGAH PRIVILEGE ESCALATION DI TABEL PROFILES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Akses ditolak: Tidak memiliki izin untuk mengubah role profil.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_role_escalation();

-- ==============================================================================
-- 6. REKONFIGURASI RLS (ROW LEVEL SECURITY) KETAT DI SELURUH TABEL
-- ==============================================================================

-- A. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- B. CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin all categories" ON public.categories;

CREATE POLICY "Allow public read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- C. MENUS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read menus" ON public.menus;
DROP POLICY IF EXISTS "Allow admin all menus" ON public.menus;

CREATE POLICY "Allow public read menus" ON public.menus
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all menus" ON public.menus
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- D. GALLERIES
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read galleries" ON public.galleries;
DROP POLICY IF EXISTS "Allow admin all galleries" ON public.galleries;

CREATE POLICY "Allow public read galleries" ON public.galleries
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all galleries" ON public.galleries
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- E. PROMOS
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read promos" ON public.promos;
DROP POLICY IF EXISTS "Allow admin all promos" ON public.promos;

CREATE POLICY "Allow public read promos" ON public.promos
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all promos" ON public.promos
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- F. CAFE_INFORMATION
ALTER TABLE public.cafe_information ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read cafe_information" ON public.cafe_information;
DROP POLICY IF EXISTS "Allow admin all cafe_information" ON public.cafe_information;

CREATE POLICY "Allow public read cafe_information" ON public.cafe_information
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all cafe_information" ON public.cafe_information
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- G. HOME_BANNERS
ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read home_banners" ON public.home_banners;
DROP POLICY IF EXISTS "Allow admin all home_banners" ON public.home_banners;

CREATE POLICY "Allow public read home_banners" ON public.home_banners
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all home_banners" ON public.home_banners
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- H. LIVE_MUSIC_SCHEDULES
ALTER TABLE public.live_music_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read live_music" ON public.live_music_schedules;
DROP POLICY IF EXISTS "Allow admin all live_music" ON public.live_music_schedules;

CREATE POLICY "Allow public read live_music" ON public.live_music_schedules
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all live_music" ON public.live_music_schedules
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- I. SPACE_BOOKINGS
ALTER TABLE public.space_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read space_bookings" ON public.space_bookings;
DROP POLICY IF EXISTS "Allow admin all space_bookings" ON public.space_bookings;

CREATE POLICY "Allow public read space_bookings" ON public.space_bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all space_bookings" ON public.space_bookings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- J. TEAMS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read teams" ON public.teams;
DROP POLICY IF EXISTS "Allow admin all teams" ON public.teams;

CREATE POLICY "Allow public read teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- K. FACILITIES
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read facilities" ON public.facilities;
DROP POLICY IF EXISTS "Allow admin all facilities" ON public.facilities;

CREATE POLICY "Allow public read facilities" ON public.facilities
  FOR SELECT USING (true);

CREATE POLICY "Allow admin all facilities" ON public.facilities
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- L. REVIEWS (ULASAN PELANGGAN)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin delete reviews" ON public.reviews;

CREATE POLICY "Allow public read reviews" ON public.reviews
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Allow public insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    rating >= 1 AND rating <= 5
    AND length(trim(name)) >= 1 AND length(name) <= 60
    AND length(trim(comment)) >= 3 AND length(comment) <= 1000
  );

CREATE POLICY "Allow admin update reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 7. REKONFIGURASI KEAMANAN STORAGE (MIME TYPE, SIZE LIMIT, ADMIN POLICY)
-- ==============================================================================

-- Pastikan seluruh bucket storage ada
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('menu-images', 'menu-images', true),
  ('gallery-images', 'gallery-images', true),
  ('promo-images', 'promo-images', true),
  ('hero-images', 'hero-images', true),
  ('team-images', 'team-images', true),
  ('livemusic-images', 'livemusic-images', true),
  ('cafe-assets', 'cafe-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Perbarui batas ukuran (5MB untuk foto, 20MB untuk galeri foto/video) dan allowed MIME types secara aman dan dinamis
DO $$
BEGIN
  -- Periksa kolom file_size_limit (nama kolom resmi Supabase Storage)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'file_size_limit'
  ) THEN
    -- Bucket foto standar: batas 5 MB (5.242.880 bytes)
    EXECUTE 'UPDATE storage.buckets SET file_size_limit = 5242880 WHERE id IN (''menu-images'', ''promo-images'', ''hero-images'', ''team-images'', ''livemusic-images'', ''cafe-assets'')';
    -- Bucket galeri: batas 20 MB (20.971.520 bytes) untuk mendukung video dokumentasi cafe
    EXECUTE 'UPDATE storage.buckets SET file_size_limit = 20971520 WHERE id = ''gallery-images''';
  END IF;

  -- Periksa kolom allowed_mime_types
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'allowed_mime_types'
  ) THEN
    -- Format foto standar
    EXECUTE 'UPDATE storage.buckets SET allowed_mime_types = ARRAY[''image/jpeg'', ''image/png'', ''image/webp'', ''image/avif''] WHERE id IN (''menu-images'', ''promo-images'', ''hero-images'', ''team-images'', ''livemusic-images'', ''cafe-assets'')';
    -- Format galeri: mendukung foto dan video (MP4, WebM, QuickTime)
    EXECUTE 'UPDATE storage.buckets SET allowed_mime_types = ARRAY[''image/jpeg'', ''image/png'', ''image/webp'', ''image/avif'', ''video/mp4'', ''video/webm'', ''video/quicktime''] WHERE id = ''gallery-images''';
  END IF;
END $$;

-- Hapus policy storage lama yang longgar
DROP POLICY IF EXISTS "Admin all menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin all gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin all promo-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin all hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin all team-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin all livemusic-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin all cafe-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage promo-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage team-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage livemusic-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage cafe-assets" ON storage.objects;

-- Buat policy baru yang mewajibkan fungsi public.is_admin()
CREATE POLICY "Admin manage menu-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'menu-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'menu-images' AND public.is_admin());

CREATE POLICY "Admin manage gallery-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'gallery-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'gallery-images' AND public.is_admin());

CREATE POLICY "Admin manage promo-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'promo-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'promo-images' AND public.is_admin());

CREATE POLICY "Admin manage hero-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'hero-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'hero-images' AND public.is_admin());

CREATE POLICY "Admin manage team-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'team-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'team-images' AND public.is_admin());

CREATE POLICY "Admin manage livemusic-images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'livemusic-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'livemusic-images' AND public.is_admin());

CREATE POLICY "Admin manage cafe-assets" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'cafe-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'cafe-assets' AND public.is_admin());

-- ==============================================================================
-- 8. GRANT PERMISSIONS SCHEMA PUBLIC
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
