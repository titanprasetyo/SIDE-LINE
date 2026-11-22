import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Sparkles, ChefHat } from "lucide-react";
import { supabase } from "../../services/supabase";
import { parseMenuPromoData, getPromoBadgeLabel } from "../../services/menuService";
import { chefRecommendationService } from "../../services/chefRecommendationService";
import { menuHeroService } from "../../services/menuHeroService";
import { cleanText } from "../../utils/text";

// Bundled high-resolution assets
import bgSideImg from "../../assets/bgside.png";
import glass1Img from "../../assets/coffee-glass-1.png";
import glass2Img from "../../assets/coffee-glass-2.png";
import glass3Img from "../../assets/coffee-glass-3.png";
import logoSidelineRed from "../../assets/logo-sideline-red.png";

// Curated menu item thumbnails
import americanoImg from "../../assets/menu-americano.jpg";
import pisangIjoImg from "../../assets/menu-pisang-ijo.jpg";
import cafeLatteImg from "../../assets/menu-cafe-latte.jpg";
import croissantImg from "../../assets/menu-croissant.jpg";

const DEMO_PROMO_END_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const VALID_CATEGORY_IDS = ["all", "promo", "chef", "coffee", "food", "non-coffee"];

/* ─── Hero Carousel Slides ─────────────────────────────────────────────────── */
// Slide hero kini dikelola admin (Menu Management → Slide Hero Halaman Menu, maks 5 foto)
// dan diambil dari tabel home_banners (placement = 'menu_hero') via menuHeroService.

/* ─── Baseline Curated Menus ─────────────────────────────────────────────── */
const CURATED_DEFAULT_MENUS = [
  {
    id: "curated-1",
    name: "Americano",
    price: 25000,
    is_promo: true,
    discount_type: "nominal",
    promo_label_type: "hemat_lebih",
    discount_percent: 12,
    discount_amount: 3000,
    discounted_price: 22000,
    promo_end_date: DEMO_PROMO_END_DATE,
    category_id: "coffee",
    category_label: "COFFEE",
    description: "Kopi hitam klasik dengan body seimbang dan aroma sangrai khas, cocok untuk penikmat kopi sejati.",
    image_url: americanoImg,
    is_featured: false,
    is_available: true,
  },
  {
    id: "curated-2",
    name: "Pisang Ijo",
    price: 34000,
    is_promo: false,
    discount_percent: 0,
    discount_amount: 0,
    discounted_price: 34000,
    category_id: "food",
    category_label: "FOOD",
    description: "Pisang raja manis berbalut adonan pandan lembut, disiram saus santan gurih dan sirup merah klasik.",
    image_url: pisangIjoImg,
    is_featured: false,
    is_available: true,
  },
  {
    id: "curated-3",
    name: "Cafe Latte",
    price: 32000,
    is_promo: true,
    discount_type: "nominal",
    promo_label_type: "hemat_lebih",
    discount_percent: 12.5,
    discount_amount: 4000,
    discounted_price: 28000,
    promo_end_date: DEMO_PROMO_END_DATE,
    category_id: "coffee",
    category_label: "COFFEE",
    description: "Perpaduan espresso ganda dan susu segar micro-foam lembut dengan rasa yang seimbang dan manis alami.",
    image_url: cafeLatteImg,
    is_featured: false,
    is_available: true,
  },
  {
    id: "curated-4",
    name: "Croissant Butter",
    price: 25000,
    is_promo: false,
    discount_percent: 0,
    discount_amount: 0,
    discounted_price: 25000,
    category_id: "food",
    category_label: "FOOD",
    description: "Pastry renyah berlapis dengan aroma butter Prancis autentik, disajikan hangat dari oven.",
    image_url: croissantImg,
    is_featured: false,
    is_available: true,
  },
  {
    id: "curated-5",
    name: "Wild Coffee",
    price: 32000,
    is_promo: false,
    discount_percent: 0,
    discount_amount: 0,
    discounted_price: 32000,
    category_id: "coffee",
    category_label: "COFFEE",
    description: "Cold brew espresso dingin berpadu sari buah delima segar dengan aroma buah yang semerbak.",
    image_url: glass1Img,
    is_featured: true,
    is_available: true,
  },
  {
    id: "curated-6",
    name: "Minions Matcha",
    price: 30000,
    is_promo: false,
    discount_percent: 0,
    discount_amount: 0,
    discounted_price: 30000,
    category_id: "non-coffee",
    category_label: "NON-COFFEE",
    description: "Matcha murni berkualitas tinggi disajikan dengan susu segar dingin dan lapisan foam gurih.",
    image_url: glass2Img,
    is_featured: false,
    is_available: true,
  },
  {
    id: "curated-7",
    name: "Sweetside Caramel",
    price: 32000,
    is_promo: false,
    discount_percent: 0,
    discount_amount: 0,
    discounted_price: 32000,
    category_id: "coffee",
    category_label: "COFFEE",
    description: "Espresso hangat berpadu sirup karamel bakar dan susu creamy dengan taburan sea salt lembut.",
    image_url: glass3Img,
    is_featured: false,
    is_available: true,
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HERO CAROUSEL (3D ROLLING GLASSES - TANPA BAR BUTTON NEXT & PREV)           */
/* ─────────────────────────────────────────────────────────────────────────── */
function MenuHeroCarousel({ slides = [] }) {
  const [targetAngle, setTargetAngle] = useState(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const animFrameRef = useRef(null);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(null);

  // Jumlah slide dinamis (1–5) dari admin; jarak sudut antar gelas = 360° / N
  const count = slides.length;
  const stepAngle = count > 0 ? 360 / count : 360;

  // Responsive horizontal spread radius for the side cups
  const getResponsiveRadius = () => {
    if (typeof window === "undefined") return 190;
    const w = window.innerWidth;
    if (w < 360) return 76;
    if (w < 420) return 88;
    if (w < 480) return 108;
    if (w < 640) return 135;
    if (w < 1024) return 175;
    return 210;
  };

  const [radiusX, setRadiusX] = useState(getResponsiveRadius);

  useEffect(() => {
    const handleResize = () => {
      setRadiusX(getResponsiveRadius());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset posisi putaran saat jumlah slide berubah (mis. data admin baru dimuat)
  useEffect(() => {
    setTargetAngle(0);
    setDisplayAngle(0);
  }, [count]);

  // 60FPS continuous physics easing
  useEffect(() => {
    const step = () => {
      setDisplayAngle((curr) => {
        const diff = targetAngle - curr;
        if (Math.abs(diff) < 0.05) return targetAngle;
        return curr + diff * 0.082;
      });
      animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [targetAngle]);

  const goNext = useCallback(() => {
    setTargetAngle((prev) => prev - stepAngle);
  }, [stepAngle]);

  const goPrev = useCallback(() => {
    setTargetAngle((prev) => prev + stepAngle);
  }, [stepAngle]);

  // Auto-play every 6.5 seconds (hanya jika slide lebih dari 1)
  useEffect(() => {
    if (count < 2) return;
    autoPlayRef.current = setTimeout(goNext, 6500);
    return () => clearTimeout(autoPlayRef.current);
  }, [targetAngle, goNext, count]);

  // Touch Swipe Handlers for mobile phones
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || count < 2) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  // Active slide calculation
  const activeIndex =
    count > 0 ? ((-Math.round(targetAngle / stepAngle) % count) + count) % count : 0;
  const activeSlide = count > 0 ? slides[activeIndex] : null;

  // Direct cup click (clicking side cups smoothly spins them to center)
  const handleCupClick = (idx) => {
    if (count < 2) return;
    const currentRel = (((idx * stepAngle + targetAngle) % 360) + 540) % 360 - 180;
    if (Math.abs(currentRel) > stepAngle / 4) {
      setTargetAngle((prev) => prev - Math.round(currentRel / stepAngle) * stepAngle);
    }
  };

  return (
    <section
      aria-label="Sorotan Menu Signature SIDE LINE"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#e70404] h-[78vh] sm:h-[82vh] lg:h-[86vh] min-h-[520px] sm:min-h-[560px] max-h-[780px] flex flex-col justify-between"
    >
      {/* ── 1. ORIGINAL SIDELINE RED BANNER BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center bg-[#f50b0b]">
        <img
          src={bgSideImg}
          alt="Banner SIDE LINE Coffee & Eatery"
          className="w-full h-full object-contain max-h-[68vh] sm:max-h-[78vh] max-w-[95vw] lg:max-w-6xl mx-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* ── 2. DRINK TITLE & BADGE (FLOATING AT TOP, ABOVE SIDELINE BG LOGO) ── */}
      <div className="relative z-20 pt-16 sm:pt-20 px-4 text-center pointer-events-none select-none">
        {activeSlide && (
          <div
            key={`title-${activeSlide.id}`}
            className="transition-all duration-300"
          >
            {activeSlide.badge && (
              <span className="inline-block bg-white text-[#C8100A] font-heading font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-3.5 py-0.5 sm:px-4 rounded-full shadow-md mb-1 sm:mb-1.5">
                {cleanText(activeSlide.badge)}
              </span>
            )}
            <h2 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              {cleanText(activeSlide.title)}
            </h2>
            {activeSlide.subtitle && (
              <p className="font-heading text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-[0.22em] sm:tracking-[0.25em] mt-1 sm:mt-1.5 drop-shadow-sm">
                {cleanText(activeSlide.subtitle)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 3. CUPS CAROUSEL CONTAINER (ANCHORED AT BOTTOM & ENLARGED) ── */}
      <div className="relative z-10 w-full flex justify-center items-end px-2 sm:px-4 pb-1 sm:pb-3">
        <div className="relative w-full max-w-3xl h-[310px] sm:h-[400px] md:h-[440px] lg:h-[480px] flex items-end justify-center">
          {slides.map((slide, idx) => {
            const itemAngle = idx * stepAngle + displayAngle;
            const rad = (itemAngle * Math.PI) / 180;
            const x = Math.sin(rad) * radiusX;
            const cos = Math.cos(rad);
            const scale = 0.82 + (cos + 0.5) * 0.16;
            const y = -(1 - cos) * 16;
            const rot = Math.sin(rad) * 9;
            // Gelas yang berada di belakang (4–5 slide) memudar agar tidak menumpuk
            const opacity =
              cos > -0.2 ? 1 : cos >= -0.55 ? 0.88 : Math.max(0, ((cos + 0.8) / 0.25) * 0.88);
            const zIndex = Math.round((cos + 1) * 15) + 5;
            const isFront = cos > 0.5;

            return (
              <div
                key={slide.id}
                onClick={() => handleCupClick(idx)}
                title={!isFront ? `Pilih ${cleanText(slide.title)}` : undefined}
                className={`absolute bottom-0 select-none ${
                  isFront ? "cursor-default" : "cursor-pointer group"
                }`}
                style={{
                  left: "50%",
                  width: "clamp(200px, 48vw, 380px)",
                  height: "clamp(270px, 64vw, 500px)",
                  transform: `translateX(calc(-50% + ${x.toFixed(2)}px)) translateY(${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                  zIndex,
                  opacity,
                  pointerEvents: opacity < 0.1 ? "none" : "auto",
                  filter: isFront
                    ? "drop-shadow(0 30px 42px rgba(0,0,0,0.65)) brightness(1)"
                    : "drop-shadow(0 18px 24px rgba(0,0,0,0.5)) brightness(0.92)",
                  transformOrigin: "bottom center",
                  willChange: "transform, opacity",
                }}
              >
                <img
                  src={slide.image_url}
                  alt={
                    cleanText(slide.title)
                      ? `${cleanText(slide.title)} — Minuman Signature SIDE LINE Coffee`
                      : "Minuman signature SIDE LINE Coffee"
                  }
                  className={`w-full h-full object-contain object-bottom transition-transform duration-200 ${
                    !isFront ? "group-hover:scale-[1.03]" : ""
                  }`}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN MENU PAGE (UPGRADED COFFEE SHOP LAYOUT)                               */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function Menu() {
  const location = useLocation();
  const [allMenus, setAllMenus] = useState(CURATED_DEFAULT_MENUS);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const kategori = new URLSearchParams(location.search).get("kategori");
    return VALID_CATEGORY_IDS.includes(kategori) ? kategori : "all";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMenuModal, setSelectedMenuModal] = useState(null);
  const [chefPoster, setChefPoster] = useState(() => chefRecommendationService.getCachedPoster());
  const [heroSlides, setHeroSlides] = useState(() => menuHeroService.getCachedSlides(true));
  const [isPosterZoomOpen, setIsPosterZoomOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const menuListRef = useRef(null);
  const menuGridRef = useRef(null);

  // Sinkronkan URL → filter. Contoh: /menu?kategori=promo#daftar-menu
  // (dipakai tombol "Lihat Menu Kami" & "Detail Promo"). location.key berubah di
  // setiap klik link, jadi klik ulang ke URL yang sama tetap memicu scroll.
  useEffect(() => {
    const kategori = new URLSearchParams(location.search).get("kategori");
    if (kategori && VALID_CATEGORY_IDS.includes(kategori)) {
      setSelectedCategory(kategori);
      setSearchQuery("");
      setCurrentPage(1);
    }
    if (location.hash === "#daftar-menu") {
      // Tunggu render filter baru selesai sebelum scroll
      requestAnimationFrame(() => {
        menuGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.key, location.search, location.hash]);

  // Close modal on Escape key and prevent background scroll when open
  useEffect(() => {
    if (!selectedMenuModal && !isPosterZoomOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedMenuModal(null);
        setIsPosterZoomOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedMenuModal, isPosterZoomOpen]);

  useEffect(() => {
    let ignore = false;
    const fetchMenuData = async () => {
      try {
        const [{ data: menusData }, poster, slides] = await Promise.all([
          supabase
            .from("menus")
            .select("*, categories(name)")
            .order("is_featured", { ascending: false })
            .order("name", { ascending: true }),
          chefRecommendationService.getPoster(false).catch(() => null),
          menuHeroService.getSlides(true).catch(() => null),
        ]);

        if (!ignore) {
          if (poster) setChefPoster(poster);
          if (Array.isArray(slides)) setHeroSlides(slides);

          if (menusData && menusData.length > 0) {
            const parsedDb = menusData.map((item) => {
              const parsed = parseMenuPromoData(item);
              return {
                ...parsed,
                category_label:
                  parsed.categories?.name?.toUpperCase() ||
                  parsed.category_label ||
                  "COFFEE",
              };
            });
            setAllMenus(parsedDb);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat menu Supabase:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMenuData();
    return () => {
      ignore = true;
    };
  }, []);

  const categoryTabs = [
    { id: "all", name: "Semua Menu" },
    { id: "promo", name: "Promo Diskon 🔥" },
    { id: "coffee", name: "Coffee" },
    { id: "food", name: "Food & Pastry" },
    { id: "non-coffee", name: "Non-Coffee" },
  ];

  const filteredMenus = allMenus.filter((item) => {
    const cat = (item.category_label || item.categories?.name || "").toLowerCase();
    let matchCat = true;
    if (selectedCategory === "promo") {
      const normalPrice = Number(item.price) || 0;
      const finalPrice =
        item.discounted_price ||
        Math.max(0, normalPrice - (Number(item.discount_amount) || 0));
      matchCat = Boolean(
        item.is_promo &&
          !item.is_expired &&
          (finalPrice < normalPrice ||
            Number(item.discount_percent) > 0 ||
            Number(item.discount_amount) > 0)
      );
    } else if (selectedCategory === "chef") {
      // Rekomendasi Chef: sajian featured atau sajian signature pilihan
      matchCat = Boolean(
        item.is_featured ||
          item.is_promo ||
          Number(item.price) >= 30000 ||
          cat.includes("coffee")
      );
    } else if (selectedCategory === "coffee") {
      matchCat = cat.includes("coffee") && !cat.includes("non");
    } else if (selectedCategory === "food") {
      matchCat = cat.includes("food") || cat.includes("snack") || cat.includes("dessert") || cat.includes("pastry");
    } else if (selectedCategory === "non-coffee") {
      matchCat = cat.includes("non") || cat.includes("tea") || cat.includes("matcha") || cat.includes("juice") || cat.includes("jus");
    }

    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchSearch =
      !cleanQuery ||
      item.name.toLowerCase().includes(cleanQuery) ||
      (item.description && item.description.toLowerCase().includes(cleanQuery));

    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage) || 1;
  const paginatedMenus = filteredMenus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    menuListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full pb-20 md:pb-24">
      <h1 className="sr-only">
        Daftar Menu SIDE LINE Coffee &amp; Eatery — Kopi, Makanan, Pastry &amp; Promo
      </h1>

      {/* ── 1. HERO SECTION WITH 3D ROLLING CUPS (TANPA BAR PREV/NEXT & SIDE LINE SPECIALTY) ── */}
      <MenuHeroCarousel slides={heroSlides} />

      {/* ── 2. CATEGORY TABS & SEARCH (COFFEE SHOP STYLE) ── */}
      <section aria-label="Filter dan Pencarian Menu" className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-6 sm:pt-8 md:pt-10" ref={menuListRef} id="menu-list">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#141414]/15 pb-6">
            {/* Category Filter Pills (Smooth scroll on mobile) */}
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#C8100A] text-white shadow-sm"
                        : "bg-[#FFF5CF] border border-[#141414]/20 text-[#141414] hover:border-[#141414] hover:bg-[#F5E8BA]"
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Aesthetic Search Box */}
            <div className="w-full lg:w-80">
              <div className="relative flex items-center rounded-full border border-[#141414]/30 bg-[#FFF5CF] px-4 py-2.5 shadow-2xs">
                <svg
                  className="w-4 h-4 text-[#5C584E] shrink-0 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Cari menu SIDE LINE"
                  placeholder="Cari menu promo, kopi, makanan..."
                  className="w-full text-xs font-body text-[#141414] placeholder-[#858074] bg-transparent outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="text-xs font-bold text-[#C8100A] hover:opacity-75 cursor-pointer ml-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. UPGRADED COFFEE SHOP MENU LISTINGS ── */}
      <section aria-label="Daftar Menu SIDE LINE" className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-6 sm:pt-8 pb-14">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
          <h2 className="sr-only">Katalog Menu SIDE LINE Coffee &amp; Eatery</h2>
          {/* ── CHEF RECOMMENDATION POSTER HIGHLIGHT (Tampil di Tab "Semua Menu") ── */}
          {(selectedCategory === "all" || selectedCategory === "chef") &&
            !searchQuery.trim() &&
            currentPage === 1 &&
            Boolean(chefPoster?.is_active) && (
            <div className="mb-8 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#141414]/15 bg-[#FAF4E6] p-4 sm:p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
                {/* Poster Image with Lightbox Zoom Trigger */}
                <div
                  className="relative w-full lg:w-1/2 aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] max-h-[380px] overflow-hidden rounded-xl sm:rounded-2xl bg-[#F5E8BA] shadow-xs border border-[#141414]/10 group cursor-pointer"
                  onClick={() => setIsPosterZoomOpen(true)}
                >
                  <img
                    src={chefPoster?.image_url || bgSideImg}
                    alt={
                      cleanText(chefPoster?.title) ||
                      "Poster Rekomendasi Chef SIDE LINE Coffee & Eatery"
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 text-zinc-900 px-3.5 py-1.5 text-xs font-bold font-heading shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8100A]" /> Klik untuk melihat poster ukuran penuh
                    </span>
                  </div>
                </div>

                {/* Poster Details & Chef Note */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#C8100A] text-white px-3 py-1 text-[10px] font-heading font-black tracking-widest uppercase mb-3 shadow-2xs">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>{chefPoster?.badge || "PILIHAN CHEF"}</span>
                    </div>
                    <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#141414] leading-tight">
                      {cleanText(chefPoster?.title || "Rekomendasi Spesial Chef Bulan Ini")}
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm md:text-base text-[#474238] font-body leading-relaxed whitespace-pre-line">
                      {cleanText(
                        chefPoster?.subtitle ||
                          "Racikan artisan kopi segar berpadu kreasi menu istimewa pilihan chef SIDE LINE. Diciptakan dengan kehangatan dan dedikasi rasa terbaik untuk pengalaman santai Anda."
                      )}
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/menu?kategori=all#daftar-menu"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#141414] hover:bg-[#C8100A] text-[#FAF4E6] px-5 py-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition shadow-md cursor-pointer"
                    >
                      <span>Lihat Menu Kami</span>
                    </Link>
                    <Link
                      to="/menu?kategori=promo#daftar-menu"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#141414]/20 hover:border-[#141414] bg-white px-4 py-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#141414] transition cursor-pointer"
                    >
                      <span>Detail Promo</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={menuGridRef} id="daftar-menu" className="scroll-mt-24">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#141414]/30 border-t-[#C8100A] mb-3" />
              <p className="font-heading text-xs uppercase tracking-widest text-[#5C584E]">
                Menyiapkan daftar sajian...
              </p>
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#F5E8BA]/60 p-8 sm:p-10">
              <h3 className="font-heading text-base font-bold uppercase text-[#141414]">
                Menu Tidak Ditemukan
              </h3>
              <p className="font-body text-xs text-[#5C584E] mt-1.5">
                Tidak ada sajian yang sesuai pencarian atau filter ini.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 inline-block font-heading text-xs uppercase tracking-wider text-[#C8100A] font-bold underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              {/* Menu Counter Bar */}
              <div className="mb-5 sm:mb-6 flex items-center justify-between text-xs text-[#5C584E] font-heading">
                <span>
                  Menampilkan <strong className="text-[#141414]">{filteredMenus.length}</strong> sajian terpilih
                </span>
                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="text-[#C8100A] font-bold hover:underline cursor-pointer"
                  >
                    Lihat Semua Menu
                  </button>
                )}
              </div>

              {/* Upgraded Coffee Shop Cards Grid: 2-col on mobile (HP), 2-col on md/lg/xl, 3-col on 2xl */}
              <div className="grid grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-6 lg:gap-8">
                {paginatedMenus.map((item) => {
                  const normalPrice = Number(item.price) || 0;
                  const finalPrice =
                    item.discounted_price ||
                    Math.max(0, normalPrice - (Number(item.discount_amount) || 0));
                  const hasPromo = Boolean(
                    item.is_promo && finalPrice < normalPrice
                  );

                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedMenuModal(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedMenuModal(item);
                        }
                      }}
                      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#141414]/12 bg-[#FAF4E6] p-2.5 xs:p-3 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#141414]/35 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
                        !item.is_available ? "opacity-75" : ""
                      }`}
                    >
                      {/* Red decorative curve accent in bottom-left corner (matches design reference) */}
                      <svg
                        className="absolute bottom-0 left-0 w-16 xs:w-20 sm:w-28 h-10 xs:h-12 sm:h-16 pointer-events-none z-0"
                        viewBox="0 0 100 56"
                        fill="none"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id={`card-red-curve-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D32F2F" />
                            <stop offset="45%" stopColor="#BA1A1A" />
                            <stop offset="100%" stopColor="#8A0C0A" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0,0 C 14,22 45,44 100,56 L 0,56 Z"
                          fill={`url(#card-red-curve-${item.id})`}
                        />
                      </svg>

                      {/* Small SIDE LINE logo in top-right corner */}
                      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 pointer-events-none" aria-hidden="true">
                        <img
                          src={logoSidelineRed}
                          alt=""
                          className="h-3 sm:h-4 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 md:gap-5 items-start z-10 w-full">
                        {/* Photo Thumbnail */}
                        <div className="relative w-full aspect-[4/3] xs:aspect-square sm:aspect-auto sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-[#F5E8BA] shadow-xs">
                          <img
                            src={item.image_url}
                            alt={`${cleanText(item.name)} — Menu ${cleanText(item.category_label || item.categories?.name || "Coffee")} SIDE LINE Coffee & Eatery`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                            loading="lazy"
                          />
                          {!item.is_available && (
                            <div className="absolute inset-0 bg-[#141414]/70 flex items-center justify-center p-1 text-center">
                              <span className="text-[9px] sm:text-[10px] font-heading font-bold text-white uppercase tracking-wider">
                                Habis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="w-full sm:flex-1 min-w-0 sm:pr-6">
                          {/* Title */}
                          <h3 className="font-heading font-black text-xs xs:text-sm sm:text-lg text-[#141414] leading-snug group-hover:text-[#C8100A] transition-colors line-clamp-1">
                            {cleanText(item.name)}
                          </h3>

                          {/* Category and Availability right below name */}
                          <div className="mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 text-[8px] xs:text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider text-[#5C584E] flex-wrap">
                            <span>{cleanText(item.category_label || item.categories?.name || "COFFEE")}</span>
                            <span>•</span>
                            <span className={item.is_available ? "text-[#141414]" : "text-[#C8100A]"}>
                              {item.is_available ? "TERSEDIA" : "HABIS"}
                            </span>
                          </div>

                          {/* Promo Discount Pill Badge */}
                          {hasPromo && (
                            <div className="mt-1 sm:mt-1.5">
                              <span className="rounded-full bg-[#C8100A] text-white px-2 py-0.5 sm:px-2.5 text-[7px] xs:text-[8px] sm:text-[9px] font-black tracking-wider uppercase shadow-2xs inline-flex items-center">
                                {getPromoBadgeLabel(item)}
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="mt-1 sm:mt-1.5">
                            {hasPromo ? (
                              <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-heading text-[10px] sm:text-xs text-[#5C584E] line-through font-semibold">
                                  Rp {normalPrice.toLocaleString("id-ID")}
                                </span>
                                <span className="font-heading font-black text-xs xs:text-sm sm:text-lg md:text-xl text-[#C8100A] leading-none">
                                  Rp {Number(finalPrice).toLocaleString("id-ID")}
                                </span>
                              </div>
                            ) : (
                              <span className="font-heading font-black text-xs xs:text-sm sm:text-lg text-[#141414] leading-none">
                                Rp {normalPrice.toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>

                          {/* Tasting Notes / Short Description */}
                          <p className="mt-1 sm:mt-2 text-[10px] xs:text-xs sm:text-[13px] text-[#5C584E] font-body leading-relaxed line-clamp-2">
                            {cleanText(item.description) || "Racikan istimewa pilihan barista Side Line."}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 sm:mt-12 pt-6 border-t border-[#141414]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="font-heading text-[11px] uppercase tracking-widest text-[#5C584E] font-medium text-center sm:text-left">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredMenus.length)} dari {filteredMenus.length} sajian
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="rounded-full border border-[#141414] bg-[#FFF5CF] px-3.5 sm:px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePageChange(num)}
                          className={`h-8 w-8 rounded-full text-xs font-heading font-bold transition cursor-pointer flex items-center justify-center ${
                            currentPage === num
                              ? "bg-[#C8100A] text-white border border-[#C8100A]"
                              : "bg-[#FFF5CF] text-[#141414] border border-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="rounded-full border border-[#141414] bg-[#FFF5CF] px-3.5 sm:px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>

          {/* Bottom Footer Note */}
          <div className="mt-12 sm:mt-16 border-t border-[#141414]/20 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-heading uppercase tracking-wider text-[#5C584E] gap-2.5 sm:gap-3">
            <p className="font-medium text-center sm:text-left">
              SELURUH HARGA SUDAH TERMASUK PAJAK &amp; DISAJIKAN SEGAR DI CAFE.
            </p>
            <p className="font-extrabold text-[#C8100A] tracking-widest shrink-0">
              SIDE LINE COFFEE • EATERY
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. SHOW MENU DETAIL MODAL (COMPACT SINGLE-SCREEN VIEW) ── */}
      {selectedMenuModal && (() => {
        const modalNormalPrice = Number(selectedMenuModal.price) || 0;
        const modalFinalPrice =
          selectedMenuModal.discounted_price ||
          Math.max(0, modalNormalPrice - (Number(selectedMenuModal.discount_amount) || 0));
        const modalHasPromo = Boolean(
          selectedMenuModal.is_promo && modalFinalPrice < modalNormalPrice
        );

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#141414]/75 backdrop-blur-xs transition-opacity duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedMenuModal(null);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-menu-title"
          >
            <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl sm:rounded-3xl border border-[#141414]/20 bg-[#FAF4E6] shadow-2xl transition-all my-auto flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#141414]/10 bg-[#FAF4E6] z-10 shrink-0">
                <div className="flex items-center gap-1.5">
                  <img
                    src={logoSidelineRed}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-auto object-contain"
                  />
                  <span className="text-[10px] font-heading font-black tracking-widest uppercase text-[#5C584E]">
                    SIDE LINE COFFEE • EATERY
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMenuModal(null)}
                  aria-label="Tutup detail menu"
                  className="rounded-full p-1 text-[#5C584E] hover:text-[#141414] hover:bg-[#141414]/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body - Designed to fit comfortably in single viewport without scroll */}
              <div className="flex flex-col">
                {/* 1. Drink Photo - Full Uncropped View (Just like in menu card) */}
                <div className="pt-3 sm:pt-4 px-4 flex justify-center shrink-0">
                  <div className="relative w-36 h-36 xs:w-40 xs:h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-[#F5E8BA] shadow-xs border border-[#141414]/10">
                    <img
                      src={selectedMenuModal.image_url}
                      alt={`${cleanText(selectedMenuModal.name)} — SIDE LINE Coffee & Eatery`}
                      className="w-full h-full object-contain bg-[#F5E8BA]"
                    />
                    {!selectedMenuModal.is_available && (
                      <div className="absolute inset-0 bg-[#141414]/75 flex items-center justify-center p-2 text-center">
                        <span className="rounded-full bg-[#C8100A] px-3 py-1 text-[10px] font-heading font-bold text-white uppercase tracking-widest shadow-md">
                          Stok Habis
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Content Details - Compact & Clear */}
                <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                  {/* Category, Availability & Promo Badge */}
                  <div>
                    <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                      <span className="text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider text-[#5C584E]">
                        {cleanText(selectedMenuModal.category_label || selectedMenuModal.categories?.name || "COFFEE")}
                      </span>
                      <span className="text-[#5C584E]">•</span>
                      <span className={`text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider ${
                        selectedMenuModal.is_available ? "text-emerald-700 font-extrabold" : "text-[#C8100A]"
                      }`}>
                        {selectedMenuModal.is_available ? "TERSEDIA" : "HABIS"}
                      </span>

                      {modalHasPromo && (
                        <span className="rounded-full bg-[#C8100A] text-white px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-2xs">
                          {getPromoBadgeLabel(selectedMenuModal)}
                        </span>
                      )}
                    </div>

                    <h3 id="modal-menu-title" className="font-heading font-black text-lg sm:text-xl text-[#141414] leading-tight">
                      {cleanText(selectedMenuModal.name)}
                    </h3>
                  </div>

                  {/* Price Box */}
                  <div className="rounded-xl sm:rounded-2xl bg-[#F5E8BA]/60 border border-[#141414]/10 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-2xs">
                    <span className="text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider text-[#5C584E]">
                      Harga Sajian
                    </span>
                    <div className="text-right">
                      {modalHasPromo ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-[10px] sm:text-xs text-[#5C584E] line-through font-semibold">
                            Rp {modalNormalPrice.toLocaleString("id-ID")}
                          </span>
                          <span className="font-heading font-black text-base sm:text-lg md:text-xl text-[#C8100A]">
                            Rp {Number(modalFinalPrice).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ) : (
                        <span className="font-heading font-black text-base sm:text-lg md:text-xl text-[#141414]">
                          Rp {modalNormalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider text-[#5C584E] mb-0.5">
                      Deskripsi Menu
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#2B2720] font-body leading-relaxed whitespace-pre-line">
                      {cleanText(selectedMenuModal.description) || "Racikan istimewa pilihan barista Side Line dengan bahan berkualitas tinggi dan cita rasa autentik."}
                    </p>
                  </div>

                  {/* Button "Lihat Menu Lainnya" */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedMenuModal(null)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#141414] hover:bg-[#C8100A] text-[#FAF4E6] py-2.5 sm:py-3 px-4 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <span>Lihat Menu Lainnya</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 5. CHEF POSTER LIGHTBOX FULLSCREEN ZOOM MODAL ── */}
      {isPosterZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#141414]/85 backdrop-blur-sm transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPosterZoomOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-2xl w-full bg-[#FAF4E6] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#141414]/10 bg-[#FAF4E6] shrink-0">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#C8100A]" />
                <span className="text-xs font-heading font-black tracking-widest uppercase text-[#141414]">
                  {chefPoster?.title || "Poster Rekomendasi Chef"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPosterZoomOpen(false)}
                aria-label="Tutup poster"
                className="rounded-full p-1.5 text-[#5C584E] hover:text-[#141414] hover:bg-[#141414]/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Image */}
            <div className="overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-black/5">
              <img
                src={chefPoster?.image_url || bgSideImg}
                alt={
                  cleanText(chefPoster?.title) ||
                  "Poster Rekomendasi Chef SIDE LINE Coffee & Eatery"
                }
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}