-- ==============================================================================
-- MIGRATION: IZINKAN POSTER REKOMENDASI CHEF DI TABEL HOME_BANNERS
-- Jalankan skrip SQL ini di SQL Editor pada Supabase Dashboard Anda.
-- ==============================================================================

-- 1. Perbarui check constraint pada kolom placement agar mengizinkan 'chef_recommendation'
ALTER TABLE public.home_banners 
  DROP CONSTRAINT IF EXISTS home_banners_placement_check;

ALTER TABLE public.home_banners 
  ADD CONSTRAINT home_banners_placement_check 
  CHECK (placement IN ('hero_primary', 'hero_secondary', 'chef_recommendation'));

-- 2. Pastikan Row Level Security (RLS) mengizinkan:
--    - Publik (anon & authenticated) dapat membaca semua banner/poster aktif
--    - Admin (authenticated) dapat menambah, mengubah, dan menghapus
ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read home_banners" ON public.home_banners;
CREATE POLICY "Allow public read home_banners" ON public.home_banners 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin all home_banners" ON public.home_banners;
CREATE POLICY "Allow admin all home_banners" ON public.home_banners 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 3. Berikan permission akses tabel
GRANT SELECT ON public.home_banners TO anon;
GRANT ALL ON public.home_banners TO authenticated;

-- 4. Verifikasi bahwa index placement tetap optimal
CREATE INDEX IF NOT EXISTS idx_home_banners_placement_active 
  ON public.home_banners(placement, is_active, order_index);
