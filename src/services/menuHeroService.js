import { supabase } from "./supabase";
import { storageService } from "./storageService";

/**
 * Slide Hero Halaman Menu (carousel gelas 3D di bagian paling atas halaman /menu).
 * Data disimpan di tabel `home_banners` dengan placement = 'menu_hero':
 *   - title     -> nama minuman (contoh: "Minions")
 *   - subtitle  -> label kecil di bawah nama (contoh: "SPECIALTY LATTE")
 *   - badge     -> badge pil putih di atas nama (contoh: "NEW RECIPE")
 *   - image_url -> foto PORTRAIT tanpa background (PNG / WEBP transparan)
 */
export const MENU_HERO_PLACEMENT = "menu_hero";
export const MAX_MENU_HERO_SLIDES = 5;
export const MENU_HERO_ALLOWED_TYPES = ["image/png", "image/webp"];

const CACHE_KEY = "side_line_menu_hero_slides";
const MIGRATION_HINT =
  "Database Supabase belum mengizinkan slide hero menu. Jalankan script 'supabase/migration_menu_hero_slides.sql' di Supabase SQL Editor, lalu coba lagi.";

const isValidUuid = (val) =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(slides) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(slides || []));
  } catch {
    // abaikan (mode private / storage penuh)
  }
}

function toFriendlyError(error, fallback) {
  const msg = error?.message || "";
  if (msg.toLowerCase().includes("check constraint")) {
    return new Error(MIGRATION_HINT);
  }
  return new Error(`${fallback}${msg ? `: ${msg}` : ""}`);
}

function sortSlides(slides) {
  return [...slides].sort(
    (a, b) =>
      (Number(a.order_index) || 0) - (Number(b.order_index) || 0) ||
      String(a.created_at || "").localeCompare(String(b.created_at || ""))
  );
}

export function validateMenuHeroFile(file) {
  if (!file) throw new Error("Pilih foto slide terlebih dahulu.");
  if (file.type && !file.type.toLowerCase().startsWith("image/")) {
    throw new Error("File yang diupload harus berupa gambar.");
  }
  return true;
}

export const menuHeroService = {
  // Ambil slide dari cache lokal secara sinkron (render instan tanpa kedip)
  getCachedSlides(activeOnly = true) {
    const cached = readCache();
    if (!cached) return [];
    const sorted = sortSlides(cached);
    return activeOnly ? sorted.filter((s) => s.is_active) : sorted;
  },

  // Ambil slide dari Supabase
  async getSlides(activeOnly = false) {
    const { data, error } = await supabase
      .from("home_banners")
      .select("*")
      .eq("placement", MENU_HERO_PLACEMENT)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Gagal mengambil slide hero menu:", error.message);
      return this.getCachedSlides(activeOnly);
    }

    const sorted = sortSlides(data || []);
    writeCache(sorted);
    return activeOnly ? sorted.filter((s) => s.is_active) : sorted;
  },

  async create({ title, subtitle, badge, imageFile, orderIndex, isActive = true }) {
    validateMenuHeroFile(imageFile);

    const existing = await this.getSlides(false);
    if (existing.length >= MAX_MENU_HERO_SLIDES) {
      throw new Error(
        `Maksimal ${MAX_MENU_HERO_SLIDES} foto slide. Hapus salah satu slide terlebih dahulu.`
      );
    }

    const imageUrl = await storageService.uploadImage("menu-images", imageFile);

    const payload = {
      title: (title || "").trim() || "Menu Spesial",
      subtitle: (subtitle || "").trim(),
      badge: (badge || "").trim(),
      image_url: imageUrl,
      placement: MENU_HERO_PLACEMENT,
      is_active: Boolean(isActive),
      order_index: Number.isFinite(Number(orderIndex)) ? Number(orderIndex) : existing.length + 1,
    };

    const { data, error } = await supabase
      .from("home_banners")
      .insert([payload])
      .select()
      .single();

    if (error) {
      // Rollback file agar storage tidak menumpuk file yatim
      await storageService.deleteImage("menu-images", imageUrl).catch(() => {});
      throw toFriendlyError(error, "Gagal menyimpan slide hero menu");
    }

    await this.getSlides(false);
    return data;
  },

  async update(id, { title, subtitle, badge, imageFile, currentImageUrl, orderIndex, isActive }) {
    if (!isValidUuid(id)) throw new Error("ID slide tidak valid.");

    let imageUrl = currentImageUrl || "";
    if (imageFile) {
      validateMenuHeroFile(imageFile);
      imageUrl = await storageService.uploadImage("menu-images", imageFile);
    }

    const payload = {
      title: (title || "").trim() || "Menu Spesial",
      subtitle: (subtitle || "").trim(),
      badge: (badge || "").trim(),
      image_url: imageUrl,
      is_active: Boolean(isActive),
      order_index: Number(orderIndex) || 1,
    };

    const { data, error } = await supabase
      .from("home_banners")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (imageFile) {
        await storageService.deleteImage("menu-images", imageUrl).catch(() => {});
      }
      throw toFriendlyError(error, "Gagal memperbarui slide hero menu");
    }

    // Foto lama dihapus hanya setelah update berhasil
    if (imageFile && currentImageUrl && currentImageUrl !== imageUrl) {
      await storageService.deleteImage("menu-images", currentImageUrl).catch(() => {});
    }

    await this.getSlides(false);
    return data;
  },

  async toggleActive(id, currentStatus) {
    if (!isValidUuid(id)) throw new Error("ID slide tidak valid.");
    const { data, error } = await supabase
      .from("home_banners")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .select()
      .single();
    if (error) throw toFriendlyError(error, "Gagal mengubah status slide");
    await this.getSlides(false);
    return data;
  },

  async remove(id, imageUrl) {
    if (!isValidUuid(id)) throw new Error("ID slide tidak valid.");
    const { error } = await supabase.from("home_banners").delete().eq("id", id);
    if (error) throw toFriendlyError(error, "Gagal menghapus slide");
    if (imageUrl) {
      await storageService.deleteImage("menu-images", imageUrl).catch(() => {});
    }
    await this.getSlides(false);
    return true;
  },
};
