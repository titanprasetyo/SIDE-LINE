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

/** Link profil Instagram dari username (@nama atau nama). */
export function toInstagramLink(username) {
  const clean = (username || "").replace("@", "").trim();
  return clean ? `https://instagram.com/${clean}` : null;
}
