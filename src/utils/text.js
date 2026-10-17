/**
 * Membersihkan teks tampilan dari data admin/database:
 * - "CAFÉ" / "café" menjadi "CAFE" / "cafe"
 * - menghapus penanda "//" (mis. "01 // JUDUL" -> "01 JUDUL")
 * - menghapus nomor urut di depan judul (mis. "01 — JUDUL" -> "JUDUL")
 */
export function cleanText(value, { stripIndex = false } = {}) {
  if (value === null || value === undefined) return "";
  let text = String(value)
    .replace(/[éèêë]/g, "e")
    .replace(/[ÉÈÊË]/g, "E")
    .replace(/cafe['`]/gi, "cafe")
    .replace(/\s*\/\/\s*/g, " ")
    .replace(/\/\//g, " ");

  if (stripIndex) {
    text = text.replace(/^\s*0*\d+\s*[—–\-/|.]*\s+/, "");
  }

  // Ganti teks placeholder 'jl contoh' dengan alamat cafe Side Line
  if (/contoh/i.test(text)) {
    text = text.replace(/jl\.?\s*contoh[^\n\r]*/gi, "Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan");
  }

  return text.replace(/\s{2,}/g, " ").trim();
}

/** Mengubah nomor telepon lokal menjadi link WhatsApp (wa.me). */
export function toWhatsAppLink(phone, message = "") {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  const number = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}

/** Link profil Instagram dari username (@nama atau nama) dengan sanitasi karakter. */
export function toInstagramLink(username) {
  if (!username) return null;
  // Hapus karakter @ dan spasi, izinkan hanya alfanumerik, titik, dan garis bawah
  const clean = String(username).replace("@", "").trim();
  if (!/^[a-zA-Z0-9._]+$/.test(clean)) {
    return null;
  }
  return `https://instagram.com/${clean}`;
}

/**
 * Memvalidasi dan membersihkan URL agar hanya menggunakan protokol http: atau https:.
 * Mencegah serangan XSS berbasis scheme (javascript:, vbscript:, data:, file:).
 */
export function safeUrl(rawUrl, fallback = "") {
  if (!rawUrl || typeof rawUrl !== "string") return fallback;
  const trimmed = rawUrl.trim();
  // Tolak protocol-relative URL (//evil.com) atau backslash
  if (trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }
  try {
    const baseOrigin =
      typeof window !== "undefined" && window?.location?.origin
        ? window.location.origin
        : "https://sidelinecoffee.com";
    const parsed = new URL(trimmed, baseOrigin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      // Jika relative path lokal yang aman
      if (trimmed.startsWith("/")) {
        return trimmed;
      }
      // Jika absolute URL, wajib diawali http:// atau https://
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validasi dan sanitasi input ulasan pelanggan (XSS & boundary protection)
 */
export function validateReviewInput({ name, comment, rating, tag }) {
  const errors = [];
  const cleanName = (name || "").trim().slice(0, 60);
  const cleanComment = (comment || "").trim().slice(0, 1000);
  const cleanTag = (tag || "Pengunjung").trim().slice(0, 30);
  const numRating = Number(rating);

  if (!cleanName || cleanName.length < 2) {
    errors.push("Nama pengulas minimal 2 karakter (maksimal 60 karakter).");
  }

  if (!cleanComment || cleanComment.length < 3) {
    errors.push("Komentar ulasan minimal 3 karakter (maksimal 1000 karakter).");
  }

  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    errors.push("Rating harus bernilai angka antara 1 sampai 5.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      name: cleanName,
      comment: cleanComment,
      tag: cleanTag || "Pengunjung",
      rating: Math.min(5, Math.max(1, Math.round(numRating) || 5)),
    },
  };
}

/**
 * Validasi pergantian kata sandi admin
 */
export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword) {
    throw new Error("Kata sandi saat ini wajib diisi.");
  }
  if (!newPassword) {
    throw new Error("Kata sandi baru wajib diisi.");
  }
  if (newPassword.length < 8) {
    throw new Error("Kata sandi baru minimal 8 karakter.");
  }
  if (newPassword.length > 100) {
    throw new Error("Kata sandi baru terlalu panjang (maksimal 100 karakter).");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Konfirmasi kata sandi baru tidak cocok.");
  }
  if (currentPassword === newPassword) {
    throw new Error("Kata sandi baru tidak boleh sama dengan kata sandi saat ini.");
  }
  return true;
}


