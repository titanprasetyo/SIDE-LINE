import { describe, it, expect } from "vitest";
import {
  calculateIsAdmin,
  isSessionTimedOut,
  IDLE_TIMEOUT_MS,
} from "../src/context/AuthContext";
import { validatePasswordChange } from "../src/utils/text";

describe("Security Audit: Authentication & Role Authorization", () => {
  it("harus menolak hak admin jika user belum login (user null)", () => {
    expect(calculateIsAdmin(null, { role: "admin" })).toBe(false);
  });

  it("REGRESSION FIX: harus menolak hak admin jika profile null atau gagal di-fetch", () => {
    // Pada implementasi lama yang rentan: (!profile || profile.role === 'admin') menghasilkan true!
    const user = { id: "user-123", email: "guest@example.com" };
    expect(calculateIsAdmin(user, null)).toBe(false);
    expect(calculateIsAdmin(user, undefined)).toBe(false);
  });

  it("harus menolak hak admin untuk pengguna ber-role 'customer'", () => {
    const user = { id: "cust-456", email: "customer@example.com" };
    const profile = { id: "cust-456", role: "customer" };
    expect(calculateIsAdmin(user, profile)).toBe(false);
  });

  it("harus menolak hak admin untuk pengguna ber-role 'staff'", () => {
    const user = { id: "staff-789", email: "staff@sideline.com" };
    const profile = { id: "staff-789", role: "staff" };
    expect(calculateIsAdmin(user, profile)).toBe(false);
  });

  it("harus memberikan hak admin HANYA jika user ada dan profile.role === 'admin'", () => {
    const user = { id: "admin-001", email: "admin@sideline.com" };
    const profile = { id: "admin-001", role: "admin" };
    expect(calculateIsAdmin(user, profile)).toBe(true);
  });
});

describe("Security Audit: 15-Minute Idle Timeout Calculation", () => {
  const timeoutMs = IDLE_TIMEOUT_MS; // 900,000 ms (15 menit)

  it("harus bernilai false jika aktivitas masih dalam batas 15 menit", () => {
    const now = 10000000;
    const lastActive = now - 14 * 60 * 1000; // 14 menit lalu
    expect(isSessionTimedOut(lastActive, timeoutMs, now)).toBe(false);
  });

  it("harus bernilai true jika aktivitas telah mencapai tepat 15 menit", () => {
    const now = 10000000;
    const lastActive = now - 15 * 60 * 1000; // 15 menit lalu
    expect(isSessionTimedOut(lastActive, timeoutMs, now)).toBe(true);
  });

  it("harus bernilai true jika aktivitas melampaui 15 menit (mis. 20 menit)", () => {
    const now = 10000000;
    const lastActive = now - 20 * 60 * 1000;
    expect(isSessionTimedOut(lastActive, timeoutMs, now)).toBe(true);
  });

  it("harus mengembalikan false jika lastActiveTimestamp kosong/null", () => {
    expect(isSessionTimedOut(null, timeoutMs)).toBe(false);
    expect(isSessionTimedOut(undefined, timeoutMs)).toBe(false);
  });
});

describe("Security Audit: Admin Password Change Validation", () => {
  it("harus menolak jika kata sandi saat ini kosong", () => {
    expect(() =>
      validatePasswordChange({
        currentPassword: "",
        newPassword: "NewSecurePassword123!",
        confirmPassword: "NewSecurePassword123!",
      })
    ).toThrow(/Kata sandi saat ini wajib diisi/);
  });

  it("harus menolak jika kata sandi baru kurang dari 8 karakter", () => {
    expect(() =>
      validatePasswordChange({
        currentPassword: "CurrentPassword123!",
        newPassword: "short",
        confirmPassword: "short",
      })
    ).toThrow(/minimal 8 karakter/);
  });

  it("harus menolak jika konfirmasi kata sandi baru tidak cocok", () => {
    expect(() =>
      validatePasswordChange({
        currentPassword: "CurrentPassword123!",
        newPassword: "NewSecurePassword123!",
        confirmPassword: "DifferentPassword456!",
      })
    ).toThrow(/Konfirmasi kata sandi baru tidak cocok/);
  });

  it("harus menolak jika kata sandi baru sama persis dengan kata sandi lama", () => {
    expect(() =>
      validatePasswordChange({
        currentPassword: "SamePassword123!",
        newPassword: "SamePassword123!",
        confirmPassword: "SamePassword123!",
      })
    ).toThrow(/tidak boleh sama/);
  });

  it("harus menerima jika semua kriteria kata sandi terpenuhi", () => {
    expect(
      validatePasswordChange({
        currentPassword: "OldPassword123!",
        newPassword: "NewBrandNewPassword2026#",
        confirmPassword: "NewBrandNewPassword2026#",
      })
    ).toBe(true);
  });
});

