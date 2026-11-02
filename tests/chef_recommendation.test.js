import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for node environment
const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
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
            select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }),
          };
        }
        return {
          select: () => {
            let filters = [];
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
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "https://example.com/mock.jpg" } }),
          remove: () => Promise.resolve({ error: null }),
        }),
      },
    },
  };
});

import {
  chefRecommendationService,
  DEFAULT_CHEF_POSTER,
} from "../src/services/chefRecommendationService";

describe("Chef Recommendation Poster Service", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    mockBanners = [];
    vi.clearAllMocks();
  });

  it("should return default chef poster when no poster has been saved", async () => {
    const poster = await chefRecommendationService.getPoster(false);
    expect(poster).toBeDefined();
    expect(poster.title).toBe(DEFAULT_CHEF_POSTER.title);
    expect(poster.badge).toBe(DEFAULT_CHEF_POSTER.badge);
    expect(poster.placement).toBe("chef_recommendation");
  });

  it("should save and update chef recommendation poster", async () => {
    const saved = await chefRecommendationService.savePoster({
      title: "Signature Cold Brew Delight",
      subtitle: "Racikan rahasia chef dengan biji kopi pilihan nusantara.",
      badge: "SPECIAL CHEF SELECTION",
      isActive: true,
      currentImageUrl: "https://example.com/poster.jpg",
    });

    expect(saved).toBeDefined();
    expect(saved.title).toBe("Signature Cold Brew Delight");
    expect(saved.badge).toBe("SPECIAL CHEF SELECTION");
    expect(saved.is_active).toBe(true);

    const fetched = await chefRecommendationService.getPoster(false);
    expect(fetched.title).toBe("Signature Cold Brew Delight");
  });

  it("should toggle active state of poster", async () => {
    const saved = await chefRecommendationService.savePoster({
      title: "Menu Spesial",
      isActive: true,
    });

    const toggled = await chefRecommendationService.toggleActive(saved.id, true);
    expect(toggled.is_active).toBe(false);

    // When activeOnly is true and poster is inactive, should return null
    const activePoster = await chefRecommendationService.getPoster(true);
    expect(activePoster).toBeNull();
  });

  it("should delete poster and revert to default", async () => {
    const saved = await chefRecommendationService.savePoster({
      title: "Poster to be deleted",
      isActive: true,
    });

    await chefRecommendationService.deletePoster(saved.id);
    const result = await chefRecommendationService.getPoster(false);
    expect(result.title).toBe(DEFAULT_CHEF_POSTER.title);
  });

  it("should return cached poster synchronously", async () => {
    expect(chefRecommendationService.getCachedPoster()).toBeNull();
    await chefRecommendationService.savePoster({
      title: "Cached Poster",
      isActive: true,
    });
    const cached = chefRecommendationService.getCachedPoster();
    expect(cached).toBeDefined();
    expect(cached.title).toBe("Cached Poster");
  });
});
