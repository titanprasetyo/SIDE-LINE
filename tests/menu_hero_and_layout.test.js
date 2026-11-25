import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

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

import {
  menuHeroService,
  validateMenuHeroFile,
  MAX_MENU_HERO_SLIDES,
} from "../src/services/menuHeroService";
import {
  mergeAndDedupeReviews,
  getReviewSignature,
} from "../src/services/reviewService";

describe("Menu Hero Slides, Chef Banner Buttons & Homepage Event Priority", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("membatasi maksimal 5 foto slide hero menu (MAX_MENU_HERO_SLIDES = 5)", () => {
    expect(MAX_MENU_HERO_SLIDES).toBe(5);
  });

  it("tidak menggunakan data dummy jika admin belum menginput slide hero menu", () => {
    const cached = menuHeroService.getCachedSlides(true);
    expect(cached).toEqual([]);
  });

  it("validasi file slide hero membebaskan admin mengupload gambar format apa saja (JPG, PNG, WEBP, dll)", () => {
    expect(
      validateMenuHeroFile({ type: "image/jpeg", size: 500 * 1024 })
    ).toBe(true);
    expect(
      validateMenuHeroFile({ type: "image/png", size: 500 * 1024 })
    ).toBe(true);
    expect(
      validateMenuHeroFile({ type: "image/webp", size: 500 * 1024 })
    ).toBe(true);
  });

  it("menyimpan dan membaca cache slide hero menu dengan benar serta memfilter is_active", () => {
    const sampleSlides = [
      {
        id: 1,
        placement: "menu_hero",
        title: "Wild Coffee",
        subtitle: "Cold Brew & Pomegranate",
        badge: "Best Seller",
        image_url: "https://example.com/cup1.png",
        order_index: 1,
        is_active: true,
      },
      {
        id: 2,
        placement: "menu_hero",
        title: "Hidden Cup",
        subtitle: "Matcha",
        badge: "New",
        image_url: "https://example.com/cup2.png",
        order_index: 2,
        is_active: false,
      },
    ];

    localStorage.setItem(
      "side_line_menu_hero_slides",
      JSON.stringify(sampleSlides)
    );
    expect(menuHeroService.getCachedSlides(false)).toHaveLength(2);
    expect(menuHeroService.getCachedSlides(true)).toHaveLength(1);
    expect(menuHeroService.getCachedSlides(true)[0].title).toBe("Wild Coffee");
  });

  it("Poster 'Pilihan Chef' lama dihapus dari customer & admin, diganti tab 'Rekomendasi Chef' dengan katalog tulisan & pilihan menu admin", () => {
    const menuPagePath = path.resolve(__dirname, "../src/pages/public/Menu.jsx");
    const menuContent = fs.readFileSync(menuPagePath, "utf-8");
    const adminMenuPath = path.resolve(__dirname, "../src/pages/admin/MenuManagement.jsx");
    const adminMenuContent = fs.readFileSync(adminMenuPath, "utf-8");
    const chefManagerPath = path.resolve(
      __dirname,
      "../src/components/admin/ChefRecommendationManager.jsx"
    );
    const chefManagerContent = fs.readFileSync(chefManagerPath, "utf-8");

    // Poster Pilihan Chef lama sudah dihapus dari publik & admin
    expect(menuContent).not.toContain("PILIHAN CHEF");
    expect(menuContent).not.toContain("isPosterZoomOpen");
    expect(menuContent).not.toContain("Klik untuk melihat poster ukuran penuh");
    expect(menuContent).not.toContain("Pesan Menu Chef via WA");
    expect(adminMenuContent).not.toContain("Poster Rekomendasi Chef");
    expect(adminMenuContent).not.toContain("Unggah Poster Chef");
    expect(adminMenuContent).not.toContain("isChefPosterModalOpen");

    // Tab Semua Menu dihapus, tab Rekomendasi Chef berada di urutan pertama & menjadi default
    expect(menuContent).not.toContain('name: "Semua Menu"');
    const chefTabIdx = menuContent.indexOf('{ id: "chef", name: "Rekomendasi Chef"');
    const promoTabIdx = menuContent.indexOf('{ id: "promo", name: "Promo Diskon');
    expect(chefTabIdx).toBeGreaterThan(-1);
    expect(promoTabIdx).toBeGreaterThan(chefTabIdx);
    expect(menuContent).toContain('VALID_CATEGORY_IDS.includes(kategori) ? kategori : "chef"');
    expect(menuContent).toContain('selectedCategory === "chef"');
    expect(menuContent).toContain("chefMenuIdSet.has(String(item.id))");

    // Admin memiliki komponen Katalog Rekomendasi Chef & modal Edit Menu yang lebih lebar + tombol X (tanpa duplikasi checkbox rekomendasi chef)
    expect(adminMenuContent).toContain("ChefRecommendationManager");
    expect(adminMenuContent).not.toContain("Jadikan Rekomendasi Menu Chef");
    expect(adminMenuContent).toContain('aria-label="Tutup modal menu"');
    expect(adminMenuContent).toContain("max-w-3xl");
    expect(chefManagerContent).toContain("@phosphor-icons/react");
    expect(chefManagerContent).not.toContain("lucide-react");
    expect(chefManagerContent).not.toContain("font-mono");
  });

  it("Home.jsx menempatkan slide Event di urutan pertama dan kartu Event di atas slogan pada tampilan mobile", () => {
    const homePagePath = path.resolve(__dirname, "../src/pages/public/Home.jsx");
    const homeContent = fs.readFileSync(homePagePath, "utf-8");

    const eventSpreadIdx = homeContent.indexOf("...activePromos.map");
    const berandaSlideIdx = homeContent.indexOf('id: "beranda"');
    expect(eventSpreadIdx).toBeGreaterThan(-1);
    expect(berandaSlideIdx).toBeGreaterThan(eventSpreadIdx);

    expect(homeContent).toContain("order-1 lg:order-2");
    expect(homeContent).toContain("order-2 lg:order-1");
  });

  it("MenuHeroSlidesManager.jsx membebaskan orientasi & format gambar (tanpa blokir portrait)", () => {
    const managerPath = path.resolve(
      __dirname,
      "../src/components/admin/MenuHeroSlidesManager.jsx"
    );
    const managerContent = fs.readFileSync(managerPath, "utf-8");

    expect(managerContent).not.toContain("Foto harus PORTRAIT");
    expect(managerContent).toContain('accept="image/*"');
  });

  it("Menu.jsx hanya memasukkan menu yang benar-benar aktif promo ke tab Promo Diskon (bukan is_featured)", () => {
    const menuPagePath = path.resolve(__dirname, "../src/pages/public/Menu.jsx");
    const menuContent = fs.readFileSync(menuPagePath, "utf-8");

    const promoBlockMatch = menuContent.match(
      /if \(selectedCategory === "promo"\) \{[\s\S]*?\}/
    );
    expect(promoBlockMatch).not.toBeNull();
    expect(promoBlockMatch[0]).not.toContain("item.is_featured");
  });

  it("migrasi SQL mengizinkan placement 'menu_hero' pada tabel home_banners", () => {
    const migrationPath = path.resolve(
      __dirname,
      "../supabase/migration_menu_hero_slides.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("'menu_hero'");
  });

  it("Admin Dashboard menggunakan font Outfit untuk seluruh teks di semua halaman admin dan Phosphor Icons secara konsisten", () => {
    const indexHtml = fs.readFileSync(
      path.resolve(__dirname, "../index.html"),
      "utf-8"
    );
    const indexCss = fs.readFileSync(
      path.resolve(__dirname, "../src/index.css"),
      "utf-8"
    );
    const sidebar = fs.readFileSync(
      path.resolve(__dirname, "../src/components/admin/Sidebar.jsx"),
      "utf-8"
    );
    const dashboard = fs.readFileSync(
      path.resolve(__dirname, "../src/pages/admin/Dashboard.jsx"),
      "utf-8"
    );
    const homeHero = fs.readFileSync(
      path.resolve(__dirname, "../src/pages/admin/HomeHeroManagement.jsx"),
      "utf-8"
    );

    expect(indexHtml).toContain("Outfit:");
    expect(indexCss).toContain('--font-admin: "Outfit"');
    expect(indexCss).toContain('.admin-shell *');
    expect(indexCss).toContain('.admin-sidebar-scroll');
    expect(indexCss).toContain('scrollbar-width: none');
    expect(sidebar).toContain("admin-sidebar-scroll");
    expect(sidebar).toContain("@phosphor-icons/react");
    expect(sidebar).not.toContain("lucide-react");
    expect(dashboard).toContain("@phosphor-icons/react");
    expect(homeHero).not.toContain("font-mono");
    expect(homeHero).not.toContain("font-fraunces");
  });

  it("ReviewService menggabungkan & mendeduplikasi ulasan Customer dan Admin serta menghormati daftar hapus", () => {
    const customerLocal = [
      {
        id: 1793602700000,
        name: "Pelanggan Baru",
        rating: 5,
        tag: "Pecinta Kopi",
        comment: "Kopi sangat nikmat dan tempatnya nyaman sekali!",
        created_at: "2026-11-02T07:00:00.000Z",
      },
    ];
    const supabaseRows = [
      {
        id: 15,
        name: "Pelanggan Baru",
        rating: 5,
        tag: "Pecinta Kopi",
        comment: "Kopi sangat nikmat dan tempatnya nyaman sekali!",
        created_at: "2026-11-02T07:00:00.000Z",
        _fromDb: true,
      },
      {
        id: 12,
        name: "Spammer",
        rating: 1,
        tag: "Lainnya",
        comment: "Komentar yang sudah dihapus admin",
        created_at: "2026-11-01T07:00:00.000Z",
        _fromDb: true,
      },
    ];

    const deletedIds = new Set(["12"]);
    const deletedSigs = new Set([getReviewSignature(supabaseRows[1])]);

    const merged = mergeAndDedupeReviews(
      [supabaseRows, customerLocal],
      deletedIds,
      deletedSigs
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(15);
    expect(merged[0].name).toBe("Pelanggan Baru");
  });

  it("security_hardening_migration.sql memberikan izin GRANT SELECT, INSERT ON TABLE public.reviews TO anon", () => {
    const secSql = fs.readFileSync(
      path.resolve(__dirname, "../supabase/security_hardening_migration.sql"),
      "utf-8"
    );
    expect(secSql).toContain("GRANT SELECT, INSERT ON TABLE public.reviews TO anon;");
  });
});
