import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Security Audit: SQL Hardening & RLS Migration Schema Integrity", () => {
  const sqlPath = path.resolve(__dirname, "../supabase/security_hardening_migration.sql");
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");

  it("file migrasi SQL security_hardening_migration.sql harus ada dan tidak kosong", () => {
    expect(sqlContent.length).toBeGreaterThan(500);
  });

  it("wajib mendefinisikan fungsi is_admin() dengan pengecekan idle timeout 15 menit", () => {
    expect(sqlContent).toContain("FUNCTION public.is_admin()");
    expect(sqlContent).toMatch(/INTERVAL\s+'15 minutes'/i);
  });

  it("wajib menyediakan RPC touch_admin_session dan terminate_admin_session", () => {
    expect(sqlContent).toContain("FUNCTION public.touch_admin_session()");
    expect(sqlContent).toContain("FUNCTION public.terminate_admin_session()");
  });

  it("wajib mencegah eskalasi hak akses (role escalation) melalui trigger", () => {
    expect(sqlContent).toContain("FUNCTION public.prevent_role_escalation()");
    expect(sqlContent).toContain("trg_prevent_role_escalation");
  });

  it("REGRESSION: handle_new_user TIDAK BOLEH memberikan role admin secara otomatis", () => {
    expect(sqlContent).toContain("FUNCTION public.handle_new_user()");
    // Harus default ke 'customer'
    expect(sqlContent).toMatch(/VALUES\s*\(new\.id,\s*new\.email,\s*'customer'/i);
    // Tidak boleh default ke 'admin'
    expect(sqlContent).not.toMatch(/VALUES\s*\(new\.id,\s*new\.email,\s*'admin'/i);
  });

  it("wajib mengaktifkan RLS dan kebijakan admin is_admin() di seluruh tabel utama", () => {
    const requiredTables = [
      "profiles",
      "categories",
      "menus",
      "galleries",
      "promos",
      "cafe_information",
      "home_banners",
      "live_music_schedules",
      "space_bookings",
      "teams",
      "facilities",
      "reviews",
    ];

    for (const table of requiredTables) {
      expect(sqlContent).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it("wajib mengamankan Supabase Storage dengan membatasi MIME dan hak akses admin", () => {
    expect(sqlContent).toContain("file_size_limit = 5242880");
    expect(sqlContent).toContain("Admin manage menu-images");
    expect(sqlContent).toContain("Admin manage gallery-images");
    expect(sqlContent).toContain("Admin manage promo-images");
    expect(sqlContent).toContain("Admin manage hero-images");
  });
});
