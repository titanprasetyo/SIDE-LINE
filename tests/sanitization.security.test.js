import { describe, it, expect } from "vitest";
import {
  safeUrl,
  toInstagramLink,
  validateReviewInput,
  cleanText,
  toWhatsAppLink,
} from "../src/utils/text";

describe("Security Audit: URL Sanitization & Anti-XSS (safeUrl)", () => {
  const fallback = "https://maps.google.com";

  it("harus meloloskan URL HTTPS dan HTTP yang valid", () => {
    expect(safeUrl("https://maps.google.com/?q=Pamulang", fallback)).toBe(
      "https://maps.google.com/?q=Pamulang"
    );
    expect(safeUrl("http://example.com", fallback)).toBe("http://example.com");
  });

  it("harus MENOLAK skema URI berbahaya (javascript:, data:, vbscript:)", () => {
    expect(safeUrl("javascript:alert(document.cookie)", fallback)).toBe(fallback);
    expect(safeUrl("javascript:window.location='https://evil.com'", fallback)).toBe(fallback);
    expect(safeUrl("data:text/html,<script>alert(1)</script>", fallback)).toBe(fallback);
    expect(safeUrl("vbscript:msgbox(1)", fallback)).toBe(fallback);
  });

  it("harus menolak input bukan string atau kosong", () => {
    expect(safeUrl(null, fallback)).toBe(fallback);
    expect(safeUrl(undefined, fallback)).toBe(fallback);
    expect(safeUrl("", fallback)).toBe(fallback);
  });

  it("harus mengizinkan relative path lokal yang aman", () => {
    expect(safeUrl("/menu", fallback)).toBe("/menu");
    expect(safeUrl("/contact", fallback)).toBe("/contact");
    // Path traversal atau protocol relative '//evil.com' harus ditolak
    expect(safeUrl("//evil.com", fallback)).toBe(fallback);
  });
});

describe("Security Audit: Instagram Handle Sanitization", () => {
  it("harus memformat username valid dengan benar", () => {
    expect(toInstagramLink("@sideline.coffee")).toBe(
      "https://instagram.com/sideline.coffee"
    );
    expect(toInstagramLink("barista_pro.123")).toBe(
      "https://instagram.com/barista_pro.123"
    );
  });

  it("harus menolak karakter berbahaya dalam username (XSS injection attempt)", () => {
    expect(toInstagramLink("evil<script>alert(1)</script>")).toBeNull();
    expect(toInstagramLink("evil/../../admin")).toBeNull();
    expect(toInstagramLink('user" onclick="alert(1) ')).toBeNull();
  });

  it("harus mengembalikan null untuk input kosong", () => {
    expect(toInstagramLink(null)).toBeNull();
    expect(toInstagramLink("")).toBeNull();
  });
});

describe("Security Audit: Customer Review Validation & Boundaries", () => {
  it("harus menerima ulasan pelanggan yang valid", () => {
    const res = validateReviewInput({
      name: "Budi Santoso",
      comment: "Kopi susu dan tempatnya sangat nyaman!",
      rating: 5,
      tag: "Pengunjung",
    });
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.data.name).toBe("Budi Santoso");
    expect(res.data.rating).toBe(5);
  });

  it("harus menolak jika nama kosong atau kurang dari 2 karakter", () => {
    const res = validateReviewInput({
      name: "A",
      comment: "Enak banget kopinya",
      rating: 5,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/Nama pengulas minimal 2 karakter/);
  });

  it("harus menolak jika komentar terlalu pendek (< 3 karakter)", () => {
    const res = validateReviewInput({
      name: "Budi",
      comment: "Ok",
      rating: 5,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/Komentar ulasan minimal 3 karakter/);
  });

  it("harus membatasi panjang nama maksimal 60 dan komentar maksimal 1000 karakter", () => {
    const longName = "A".repeat(100);
    const longComment = "B".repeat(1500);
    const res = validateReviewInput({
      name: longName,
      comment: longComment,
      rating: 4,
    });
    expect(res.isValid).toBe(true);
    expect(res.data.name.length).toBe(60);
    expect(res.data.comment.length).toBe(1000);
  });

  it("harus membatasi rating berada di rentang 1 sampai 5", () => {
    const resHigh = validateReviewInput({
      name: "Budi",
      comment: "Keren sekali tempatnya",
      rating: 10,
    });
    expect(resHigh.isValid).toBe(false);

    const resLow = validateReviewInput({
      name: "Budi",
      comment: "Keren sekali tempatnya",
      rating: 0,
    });
    expect(resLow.isValid).toBe(false);
  });
});
