-- ==============================================================================
-- FIX PERMISSIONS: JALANKAN INI DI SUPABASE SQL EDITOR
-- Menyelesaikan error: "permission denied for table categories"
-- ==============================================================================

-- 1. Berikan hak akses schema public ke role anon dan authenticated
grant usage on schema public to anon, authenticated;

-- 2. Berikan izin SELECT ke public/anon untuk seluruh tabel
grant select on all tables in schema public to anon;

-- 3. Berikan izin penuh (SELECT, INSERT, UPDATE, DELETE) ke authenticated (admin)
grant all on all tables in schema public to authenticated;

-- 4. Berikan izin sequences (auto increment / serial)
grant all on all sequences in schema public to authenticated, anon;
grant all on all routines in schema public to authenticated, anon;

-- 5. Atur default privileges agar tabel-tabel selanjutnya otomatis memiliki izin
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant all on sequences to authenticated, anon;
alter default privileges in schema public grant all on routines to authenticated, anon;
