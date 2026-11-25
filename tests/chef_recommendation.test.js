import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for node environment
const store = {};
globalThis.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, val) => {
    store[key] = String(val);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key in store) delete store[key];
  },
};

// In-memory mock database for home_banners
let mockBanners = [];

vi.mock("../src/services/supabase", () => {
  return {
    supabase: {
      from: (table) => {
        if (table !== "home_banners") {
          return {
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        return {
          select: () => {
            const filters = [];
            const builder = {
              eq: (col, val) => {
                filters.push({ col, val });
                return builder;
              },
              order: () => builder,
              limit: () => {
                let result = [...mockBanners];
                for (const f of filters) {
                  result = result.filter((b) => b[f.col] === f.val);
                }
                return Promise.resolve({ data: result, error: null });
              },
            };
            return builder;
          },
          insert: (records) => {
            const inserted = records.map((r) => ({
              ...r,
              id: "11111111-2222-3333-4444-555555555555",
            }));
            mockBanners.push(...inserted);
            return {
              select: () => ({
                single: () => Promise.resolve({ data: inserted[0], error: null }),
              }),
            };
          },
          update: (payload) => ({
            eq: (col, val) => {
              const idx = mockBanners.findIndex((b) => b[col] === val);
              if (idx >= 0) {
                mockBanners[idx] = { ...mockBanners[idx], ...payload };
              }
              const updated = mockBanners[idx] || { ...payload, id: val };
              return {
                select: () => ({
                  single: () => Promise.resolve({ data: updated, error: null }),
                }),
              };
            },
          }),
          delete: () => ({
            eq: (col, val) => {
              mockBanners = mockBanners.filter((b) => b[col] !== val);
              return Promise.resolve({ error: null });
            },
          }),
        };
      },
    },
  };
});

import {
  chefRecommendationService,
  DEFAULT_CHEF_CATALOG,
  parseChefCatalogRow,
} from "../src/services/chefRecommendationService";

describe("Chef Recommendation Catalog Service (Tulisan Katalog & Multi-Select Menu)", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    mockBanners = [];
    vi.clearAllMocks();
  });

  it("mengembalikan katalog default kosong ketika admin belum mengatur rekomendasi chef", async () => {
    const catalog = await chefRecommendationService.getCatalog();
    expect(catalog).toBeDefined();
    expect(catalog.title).toBe(DEFAULT_CHEF_CATALOG.title);
    expect(catalog.period_label).toBe(DEFAULT_CHEF_CATALOG.period_label);
    expect(catalog.menu_ids).toEqual([]);
    expect(catalog.is_configured).toBe(false);
  });

  it("mengabaikan baris poster lama ('PILIHAN CHEF') dan menimpanya bersih saat admin menyimpan katalog baru", async () => {
    mockBanners.push({
      id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      placement: "chef_recommendation",
      title: "Poster GTV Lama",
      badge: "PILIHAN CHEF",
      subtitle: "Kombinasi autentik cold brew poster lama",
      image_url: "https://example.com/old-poster.jpg",
      is_active: true,
    });

    const parsedLegacy = await chefRecommendationService.getCatalog();
    expect(parsedLegacy.is_configured).toBe(false);
    expect(parsedLegacy.title).toBe(DEFAULT_CHEF_CATALOG.title);
    expect(parsedLegacy.menu_ids).toEqual([]);
    expect(parsedLegacy.id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");

    // Saat admin menyimpan katalog baru, baris lama ditimpa & image_url dibersihkan
    const saved = await chefRecommendationService.saveCatalog({
      id: parsedLegacy.id,
      period_label: "Spesial Musim Hujan",
      title: "Sajian Hangat Pilihan Chef",
      description: "Cocok dinikmati saat hujan sore hari di SIDE LINE.",
      menu_ids: ["menu-1", "menu-2", "menu-1"],
    });

    expect(saved.is_configured).toBe(true);
    expect(saved.period_label).toBe("Spesial Musim Hujan");
    expect(saved.title).toBe("Sajian Hangat Pilihan Chef");
    expect(saved.description).toBe("Cocok dinikmati saat hujan sore hari di SIDE LINE.");
    expect(saved.menu_ids).toEqual(["menu-1", "menu-2"]);
    expect(mockBanners).toHaveLength(1);
    expect(mockBanners[0].image_url).toBe("");
  });

  it("menyimpan, memperbarui, dan membaca cache sinkron untuk katalog & menu terpilih", async () => {
    localStorage.setItem("side_line_chef_recommendation_poster", '{"old":true}');
    expect(chefRecommendationService.getCachedCatalog()).toBeNull();
    // Cache poster lama otomatis dibersihkan
    expect(localStorage.getItem("side_line_chef_recommendation_poster")).toBeNull();

    const saved = await chefRecommendationService.saveCatalog({
      period_label: "Bulan Ini • November",
      title: "Rekomendasi Chef Bulan Ini",
      description: "Pilihan kopi & pastry paling pas untuk bulan ini.",
      menu_ids: ["menu-a", "menu-b", "menu-c"],
    });

    expect(saved.id).toBe("11111111-2222-3333-4444-555555555555");
    expect(saved.menu_ids).toEqual(["menu-a", "menu-b", "menu-c"]);

    const cached = chefRecommendationService.getCachedCatalog();
    expect(cached).toBeDefined();
    expect(cached.title).toBe("Rekomendasi Chef Bulan Ini");
    expect(cached.period_label).toBe("Bulan Ini • November");
    expect(cached.menu_ids).toEqual(["menu-a", "menu-b", "menu-c"]);

    const fetched = await chefRecommendationService.getCatalog();
    expect(fetched.title).toBe("Rekomendasi Chef Bulan Ini");
    expect(fetched.menu_ids).toEqual(["menu-a", "menu-b", "menu-c"]);
  });

  it("mendukung toggle satu menu masuk/keluar serta pembersihan saat menu dihapus", async () => {
    const initial = await chefRecommendationService.saveCatalog({
      period_label: "Pilihan Saat Ini",
      title: "Rekomendasi Chef Hari Ini",
      description: "Racikan terbaik hari ini.",
      menu_ids: ["m-1"],
    });

    const added = await chefRecommendationService.toggleMenuSelection(initial, "m-2");
    expect(added.menu_ids).toEqual(["m-1", "m-2"]);

    const removedByToggle = await chefRecommendationService.toggleMenuSelection(added, "m-1");
    expect(removedByToggle.menu_ids).toEqual(["m-2"]);

    const cleanedAfterDelete = await chefRecommendationService.removeMenuFromCatalog(
      removedByToggle,
      "m-2"
    );
    expect(cleanedAfterDelete.menu_ids).toEqual([]);
  });

  it("parseChefCatalogRow menangani input null dan JSON tidak valid secara aman", () => {
    expect(parseChefCatalogRow(null).is_configured).toBe(false);
    expect(parseChefCatalogRow({ id: "bad", subtitle: "{broken" }).is_configured).toBe(false);
  });
});
