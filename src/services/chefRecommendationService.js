import { supabase } from "./supabase";

export const CHEF_RECOMMENDATION_PLACEMENT = "chef_recommendation";
const CATALOG_STORAGE_KEY = "side_line_chef_recommendation_catalog";
const LEGACY_POSTER_STORAGE_KEY = "side_line_chef_recommendation_poster";

export const DEFAULT_CHEF_CATALOG = {
  id: null,
  period_label: "Rekomendasi Bulan Ini",
  title: "Rekomendasi Chef Bulan Ini",
  description:
    "Kurasi sajian kopi, minuman, dan makanan pilihan chef SIDE LINE yang paling cocok dinikmati saat ini.",
  menu_ids: [],
  updated_at: null,
  is_configured: false,
};

const isValidUuid = (val) =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

function clearLegacyPosterCache() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(LEGACY_POSTER_STORAGE_KEY);
    }
  } catch {
    // abaikan jika storage tidak tersedia
  }
}

function normalizeMenuIds(menuIds) {
  if (!Array.isArray(menuIds)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of menuIds) {
    if (raw === null || raw === undefined) continue;
    const id = String(raw).trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

/**
 * Mem-parse baris `home_banners` (placement = 'chef_recommendation') menjadi objek Katalog Rekomendasi Chef.
 * Baris poster lama (non-JSON / bukan type 'chef_catalog') diabaikan agar konten poster lama tidak muncul lagi,
 * namun `id` tetap dipertahankan agar penyimpanan baru menimpa baris tersebut secara bersih.
 */
export function parseChefCatalogRow(row) {
  if (!row) {
    return { ...DEFAULT_CHEF_CATALOG, menu_ids: [] };
  }

  let parsed = null;
  if (typeof row.subtitle === "string" && row.subtitle.trim().startsWith("{")) {
    try {
      const obj = JSON.parse(row.subtitle);
      if (obj && typeof obj === "object" && obj.type === "chef_catalog") {
        parsed = obj;
      }
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    // Baris poster lama ("Pilihan Chef" dengan foto poster) -> abaikan data poster lama
    return {
      ...DEFAULT_CHEF_CATALOG,
      id: isValidUuid(row.id) ? row.id : null,
      menu_ids: [],
      is_configured: false,
    };
  }

  return {
    id: isValidUuid(row.id) ? row.id : null,
    period_label: String(row.badge || "").trim(),
    title: String(row.title || "").trim() || DEFAULT_CHEF_CATALOG.title,
    description: String(parsed.description || "").trim(),
    menu_ids: normalizeMenuIds(parsed.menu_ids),
    updated_at: parsed.updated_at || row.created_at || null,
    is_configured: true,
  };
}

function getLocalCatalog() {
  clearLegacyPosterCache();
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      id: isValidUuid(parsed.id) ? parsed.id : null,
      period_label: String(parsed.period_label ?? "").trim(),
      title: String(parsed.title || "").trim() || DEFAULT_CHEF_CATALOG.title,
      description: String(parsed.description ?? "").trim(),
      menu_ids: normalizeMenuIds(parsed.menu_ids),
      updated_at: parsed.updated_at || null,
      is_configured: Boolean(parsed.is_configured),
    };
  } catch {
    return null;
  }
}

function saveLocalCatalog(catalog) {
  clearLegacyPosterCache();
  try {
    if (typeof localStorage === "undefined") return;
    if (catalog && catalog.is_configured) {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    } else {
      localStorage.removeItem(CATALOG_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("Gagal simpan katalog rekomendasi chef ke local storage:", err);
  }
}

export const chefRecommendationService = {
  /** Ambil katalog rekomendasi chef dari cache lokal secara sinkron. */
  getCachedCatalog() {
    return getLocalCatalog();
  },

  /** Ambil katalog tulisan & daftar menu rekomendasi chef dari Supabase. */
  async getCatalog() {
    clearLegacyPosterCache();
    try {
      const { data, error } = await supabase
        .from("home_banners")
        .select("*")
        .eq("placement", CHEF_RECOMMENDATION_PLACEMENT)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.warn("Gagal mengambil katalog rekomendasi chef dari Supabase:", error.message);
        return getLocalCatalog() || { ...DEFAULT_CHEF_CATALOG, menu_ids: [] };
      }

      if (data && data.length > 0) {
        const parsed = parseChefCatalogRow(data[0]);
        saveLocalCatalog(parsed);
        return parsed;
      }

      saveLocalCatalog(null);
      return { ...DEFAULT_CHEF_CATALOG, menu_ids: [] };
    } catch (err) {
      console.warn("Error saat memuat katalog rekomendasi chef:", err);
      return getLocalCatalog() || { ...DEFAULT_CHEF_CATALOG, menu_ids: [] };
    }
  },

  /** Simpan / perbarui katalog tulisan & menu pilihan rekomendasi chef (Admin). */
  async saveCatalog({
    id = null,
    period_label = "",
    title = "",
    description = "",
    menu_ids = [],
  } = {}) {
    clearLegacyPosterCache();

    const cleanPeriod = String(period_label ?? "").trim();
    const cleanTitle = String(title || "").trim() || DEFAULT_CHEF_CATALOG.title;
    const cleanDescription = String(description ?? "").trim();
    const uniqueMenuIds = normalizeMenuIds(menu_ids);
    const nowIso = new Date().toISOString();

    const subtitleJson = JSON.stringify({
      type: "chef_catalog",
      description: cleanDescription,
      menu_ids: uniqueMenuIds,
      updated_at: nowIso,
    });

    const dbPayload = {
      title: cleanTitle,
      badge: cleanPeriod,
      subtitle: subtitleJson,
      placement: CHEF_RECOMMENDATION_PLACEMENT,
      image_url: "",
      is_active: true,
      order_index: 1,
    };

    let targetId = isValidUuid(id) ? id : null;
    if (!targetId) {
      const { data: existingRows } = await supabase
        .from("home_banners")
        .select("id")
        .eq("placement", CHEF_RECOMMENDATION_PLACEMENT)
        .order("created_at", { ascending: false })
        .limit(1);
      if (existingRows && existingRows.length > 0 && isValidUuid(existingRows[0].id)) {
        targetId = existingRows[0].id;
      }
    }

    let savedRow = null;
    if (targetId) {
      const { data, error } = await supabase
        .from("home_banners")
        .update(dbPayload)
        .eq("id", targetId)
        .select()
        .single();

      if (error) {
        if (error.message && error.message.toLowerCase().includes("check constraint")) {
          throw new Error(
            "Database Supabase belum mengizinkan 'chef_recommendation'. Jalankan script SQL 'supabase/migration_chef_recommendation_poster.sql' di Supabase SQL Editor."
          );
        }
        throw new Error(`Gagal memperbarui katalog rekomendasi chef: ${error.message}`);
      }
      savedRow = data;
    } else {
      const { data, error } = await supabase
        .from("home_banners")
        .insert([{ ...dbPayload, created_at: nowIso }])
        .select()
        .single();

      if (error) {
        if (error.message && error.message.toLowerCase().includes("check constraint")) {
          throw new Error(
            "Database Supabase belum mengizinkan 'chef_recommendation'. Jalankan script SQL 'supabase/migration_chef_recommendation_poster.sql' di Supabase SQL Editor."
          );
        }
        throw new Error(`Gagal menyimpan katalog rekomendasi chef: ${error.message}`);
      }
      savedRow = data;
    }

    const parsed = parseChefCatalogRow(savedRow);
    saveLocalCatalog(parsed);
    return parsed;
  },

  /** Toggle satu menu ke dalam / keluar dari daftar Rekomendasi Chef. */
  async toggleMenuSelection(currentCatalog, menuId) {
    const base = currentCatalog || DEFAULT_CHEF_CATALOG;
    const strId = String(menuId).trim();
    if (!strId) return base;

    const currentIds = normalizeMenuIds(base.menu_ids);
    const exists = currentIds.includes(strId);
    const nextIds = exists
      ? currentIds.filter((id) => id !== strId)
      : [...currentIds, strId];

    return this.saveCatalog({
      id: base.id,
      period_label: base.is_configured ? base.period_label : DEFAULT_CHEF_CATALOG.period_label,
      title: base.is_configured ? base.title : DEFAULT_CHEF_CATALOG.title,
      description: base.is_configured ? base.description : DEFAULT_CHEF_CATALOG.description,
      menu_ids: nextIds,
    });
  },

  /** Hapus ID menu tertentu dari katalog (mis. ketika menu dihapus oleh admin). */
  async removeMenuFromCatalog(currentCatalog, menuId) {
    const base = currentCatalog || DEFAULT_CHEF_CATALOG;
    const strId = String(menuId).trim();
    const currentIds = normalizeMenuIds(base.menu_ids);
    if (!strId || !currentIds.includes(strId)) {
      return base;
    }

    return this.saveCatalog({
      id: base.id,
      period_label: base.period_label,
      title: base.title,
      description: base.description,
      menu_ids: currentIds.filter((id) => id !== strId),
    });
  },
};
