-- ==============================================================================
-- MIGRATION: SLIDE HERO HALAMAN MENU (CAROUSEL GELAS 3D, MAKS 5 FOTO)
-- Mengizinkan placement 'menu_hero' pada tabel home_banners.
-- Jalankan skrip SQL ini di SQL Editor pada Supabase Dashboard Anda.
-- (Aman dijalankan ulang; sudah mencakup 'chef_recommendation'.)
-- ==============================================================================

ALTER TABLE public.home_banners
  DROP CONSTRAINT IF EXISTS home_banners_placement_check;

ALTER TABLE public.home_banners
  ADD CONSTRAINT home_banners_placement_check
  CHECK (placement IN ('hero_primary', 'hero_secondary', 'chef_recommendation', 'menu_hero'));

-- Index untuk sorting slide berdasarkan urutan
CREATE INDEX IF NOT EXISTS idx_home_banners_placement_active
  ON public.home_banners(placement, is_active, order_index);
