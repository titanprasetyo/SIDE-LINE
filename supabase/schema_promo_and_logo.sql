-- ==============================================================================
-- SKEMA TAMBAHAN: PROMO POTONGAN HARGA MENU & LOGO HEADER CAFÉ
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.
-- ==============================================================================

-- 1. Tambah Kolom Promo Potongan Harga & Batas Waktu ke Tabel Menus
ALTER TABLE public.menus 
ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price NUMERIC(12, 0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promo_end_date TIMESTAMP WITH TIME ZONE;

-- Index untuk mempermudah query menu promo
CREATE INDEX IF NOT EXISTS idx_menus_is_promo ON public.menus(is_promo);

-- 2. Tambah Kolom logo_url ke Tabel cafe_information
ALTER TABLE public.cafe_information
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Storage Bucket cafe-assets (opsional untuk logo & brand asset)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cafe-assets', 'cafe-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Read Policy: Public
DROP POLICY IF EXISTS "Public Access cafe-assets" ON storage.objects;
CREATE POLICY "Public Access cafe-assets" ON storage.objects 
  FOR SELECT USING (bucket_id = 'cafe-assets');

-- Storage Manage Policy: Admin
DROP POLICY IF EXISTS "Admin all cafe-assets" ON storage.objects;
CREATE POLICY "Admin all cafe-assets" ON storage.objects 
  FOR ALL TO authenticated USING (bucket_id = 'cafe-assets') WITH CHECK (bucket_id = 'cafe-assets');
