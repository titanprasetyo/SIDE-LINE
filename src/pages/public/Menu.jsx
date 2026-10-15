import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../services/supabase";
import { cafeService } from "../../services/cafeService";
import { parseMenuPromoData } from "../../services/menuService";
import { cleanText, toWhatsAppLink } from "../../utils/text";

// Bundled high-resolution assets
import bgMenuImg from "../../assets/bgmenu.png";
import glass1Img from "../../assets/coffee-glass-1.png";
import glass2Img from "../../assets/coffee-glass-2.png";
import glass3Img from "../../assets/coffee-glass-3.png";

// Curated menu item thumbnails
import americanoImg from "../../assets/menu-americano.jpg";
import pisangIjoImg from "../../assets/menu-pisang-ijo.jpg";
import cafeLatteImg from "../../assets/menu-cafe-latte.jpg";
import croissantImg from "../../assets/menu-croissant.jpg";

const FALLBACK_PHONE = "6281234567890";
const DEMO_PROMO_END_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

/* ─── Hero Carousel Slides ─────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    id: 1,
    glassImg: glass1Img,
    label: "SIGNATURE COLD BREW",
    drink: "Wild Coffee",
    tagline: "Perpaduan buah segar delima & cold brew espresso dingin yang memukau.",
    badge: "BEST SELLER",
  },
  {
    id: 2,
    glassImg: glass2Img,
    label: "SPECIALTY LATTE",
    drink: "Minions",
    tagline: "Lapisan matcha autentik, susu segar, dan espresso dalam satu tegukan berlapis.",
    badge: "NEW RECIPE",
  },
  {
    id: 3,
    glassImg: glass3Img,
    label: "CLASSIC SWEET",
    drink: "Sweetside",
    tagline: "Susu lembut berpadu limpahan saus karamel legit dan espresso harum.",
    badge: "FAVORIT",
  },
];

/* ─── Baseline Curated Menus ─────────────────────────────────────────────── */
const CURATED_DEFAULT_MENUS = [
  {
    id: "curated-1",
    name: "Americano",
    price: 25000,
    is_promo: true,
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
function MenuHeroCarousel() {
  const [targetAngle, setTargetAngle] = useState(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const animFrameRef = useRef(null);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(null);

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
    setTargetAngle((prev) => prev - 120);
  }, []);

  const goPrev = useCallback(() => {
    setTargetAngle((prev) => prev + 120);
  }, []);

  // Auto-play every 6.5 seconds
  useEffect(() => {
    autoPlayRef.current = setTimeout(goNext, 6500);
    return () => clearTimeout(autoPlayRef.current);
  }, [targetAngle, goNext]);

  // Touch Swipe Handlers for mobile phones
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  // Active slide calculation
  const activeIndex = ((-Math.round(targetAngle / 120) % 3) + 3) % 3;
  const activeSlide = HERO_SLIDES[activeIndex];

  // Direct cup click (clicking side cups smoothly spins them to center)
  const handleCupClick = (idx) => {
    const currentRel = (((idx * 120 + targetAngle) % 360) + 540) % 360 - 180;
    if (currentRel < -30) {
      goPrev();
    } else if (currentRel > 30) {
      goNext();
    }
  };

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#e70404] h-[78vh] sm:h-[82vh] lg:h-[86vh] min-h-[520px] sm:min-h-[560px] max-h-[780px] flex flex-col justify-between"
    >
      {/* ── 1. ORIGINAL SIDELINE RED BANNER BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center bg-[#e70404]">
        <img
          src={bgMenuImg}
          alt="SIDELINE Coffee & Eatery"
          className="w-full h-full object-contain max-h-[68vh] sm:max-h-[78vh] max-w-[95vw] lg:max-w-6xl mx-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* ── 2. DRINK TITLE & BADGE (FLOATING AT TOP, ABOVE SIDELINE BG LOGO) ── */}
      <div className="relative z-20 pt-16 sm:pt-20 px-4 text-center pointer-events-none select-none">
        <div
          key={`title-${activeIndex}`}
          className="transition-all duration-300"
        >
          <span className="inline-block bg-white text-[#C8100A] font-heading font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-3.5 py-0.5 sm:px-4 rounded-full shadow-md mb-1 sm:mb-1.5">
            {activeSlide.badge}
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            {activeSlide.drink}
          </h2>
          <p className="font-heading text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-[0.22em] sm:tracking-[0.25em] mt-1 sm:mt-1.5 drop-shadow-sm">
            {activeSlide.label}
          </p>
        </div>
      </div>

      {/* ── 3. CUPS CAROUSEL CONTAINER (ANCHORED AT BOTTOM & ENLARGED) ── */}
      <div className="relative z-10 w-full flex justify-center items-end px-2 sm:px-4 pb-1 sm:pb-3">
        <div className="relative w-full max-w-3xl h-[310px] sm:h-[400px] md:h-[440px] lg:h-[480px] flex items-end justify-center">
          {HERO_SLIDES.map((slide, idx) => {
            const itemAngle = idx * 120 + displayAngle;
            const rad = (itemAngle * Math.PI) / 180;
            const x = Math.sin(rad) * radiusX;
            const cos = Math.cos(rad);
            const scale = 0.82 + (cos + 0.5) * 0.16;
            const y = -(1 - cos) * 16;
            const rot = Math.sin(rad) * 9;
            const opacity = cos > -0.2 ? 1 : 0.88;
            const zIndex = Math.round((cos + 1) * 15) + 5;
            const isFront = cos > 0.5;

            return (
              <div
                key={slide.id}
                onClick={() => handleCupClick(idx)}
                title={!isFront ? `Pilih ${slide.drink}` : undefined}
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
                  filter: isFront
                    ? "drop-shadow(0 30px 42px rgba(0,0,0,0.65)) brightness(1)"
                    : "drop-shadow(0 18px 24px rgba(0,0,0,0.5)) brightness(0.92)",
                  transformOrigin: "bottom center",
                  willChange: "transform, opacity",
                }}
              >
                <img
                  src={slide.glassImg}
                  alt={slide.drink}
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
  const [allMenus, setAllMenus] = useState(CURATED_DEFAULT_MENUS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cafePhone, setCafePhone] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const menuListRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const fetchMenuData = async () => {
      try {
        const [{ data: menusData }, info] = await Promise.all([
          supabase
            .from("menus")
            .select("*, categories(name)")
            .order("is_featured", { ascending: false })
            .order("name", { ascending: true }),
          cafeService.get().catch(() => null),
        ]);

        if (!ignore) {
          if (info?.phone) setCafePhone(info.phone);

          if (menusData && menusData.length > 0) {
            const parsedDb = menusData.map(parseMenuPromoData);
            const merged = [...CURATED_DEFAULT_MENUS];

            parsedDb.forEach((dbItem) => {
              const normName = (dbItem.name || "").trim().toLowerCase();
              const idx = merged.findIndex((m) => m.name.trim().toLowerCase() === normName);
              if (idx >= 0) {
                merged[idx] = {
                  ...merged[idx],
                  ...dbItem,
                  category_label: dbItem.categories?.name?.toUpperCase() || merged[idx].category_label,
                  image_url: dbItem.image_url || merged[idx].image_url,
                };
              } else {
                merged.push({
                  ...dbItem,
                  category_label: dbItem.categories?.name?.toUpperCase() || "COFFEE",
                });
              }
            });
            setAllMenus(merged);
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
      matchCat = Boolean(
        item.is_promo ||
          Number(item.discount_percent) > 0 ||
          Number(item.discount_amount) > 0 ||
          item.is_featured
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

  const getOrderWALink = (item) => {
    const itemName = cleanText(item.name);
    const text = `Halo Side Line, saya ingin memesan menu: *${itemName}*. Mohon info ketersediaan dan cara pembayarannya.`;
    return toWhatsAppLink(cafePhone || FALLBACK_PHONE, text);
  };

  return (
    <div className="w-full pb-20 md:pb-24">
      {/* ── 1. HERO SECTION WITH 3D ROLLING CUPS (TANPA BAR PREV/NEXT & SIDE LINE SPECIALTY) ── */}
      <MenuHeroCarousel />

      {/* ── 2. CATEGORY TABS & SEARCH (COFFEE SHOP STYLE) ── */}
      <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-6 sm:pt-8 md:pt-10" ref={menuListRef} id="menu-list">
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
      <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-6 sm:pt-8 pb-14">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
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

              {/* Upgraded Coffee Shop Cards Grid: 1-col on mobile, 2-col on md/lg/xl, 3-col on 2xl */}
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                      className={`group rounded-2xl border border-[#141414]/15 bg-[#FFF5CF] p-4 sm:p-5 md:p-6 flex flex-col justify-between hover:border-[#141414] hover:shadow-md transition-all duration-300 ${
                        !item.is_available ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex gap-3.5 sm:gap-4 md:gap-5 items-start">
                        {/* Photo Thumbnail */}
                        <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-[#F5E8BA] shadow-xs">
                          <img
                            src={item.image_url}
                            alt={cleanText(item.name)}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                            loading="lazy"
                          />
                          {!item.is_available && (
                            <div className="absolute inset-0 bg-[#141414]/70 flex items-center justify-center p-1 text-center">
                              <span className="text-[10px] font-heading font-bold text-white uppercase tracking-wider">
                                Habis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          {/* Title & Price Header */}
                          <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1 xs:gap-3">
                            <div className="min-w-0">
                              <h2 className="font-heading font-black text-sm xs:text-base sm:text-lg text-[#141414] leading-snug group-hover:text-[#C8100A] transition-colors">
                                {cleanText(item.name)}
                              </h2>

                              {/* Micro Badges (Category & Availability & Promo) */}
                              <div className="mt-0.5 sm:mt-1 flex items-center flex-wrap gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wider text-[#5C584E]">
                                <span>{cleanText(item.category_label || item.categories?.name || "COFFEE")}</span>
                                <span>•</span>
                                <span className={item.is_available ? "text-[#141414]" : "text-[#C8100A]"}>
                                  {item.is_available ? "TERSEDIA" : "HABIS"}
                                </span>
                                {hasPromo && (
                                  <span className="rounded-full bg-[#C8100A] text-white px-2 py-0.5 text-[8px] sm:text-[9px] font-black">
                                    {item.discount_percent ? `PROMO -${item.discount_percent}%` : "PROMO"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="shrink-0 text-left xs:text-right mt-1 xs:mt-0">
                              {hasPromo ? (
                                <div className="flex xs:flex-col items-baseline xs:items-end gap-1.5 xs:gap-0 leading-none">
                                  <span className="font-heading text-[11px] sm:text-xs text-[#5C584E] line-through font-semibold mb-0 xs:mb-1">
                                    Rp {normalPrice.toLocaleString("id-ID")}
                                  </span>
                                  <span className="font-heading font-black text-sm xs:text-base sm:text-xl text-[#C8100A]">
                                    Rp {Number(finalPrice).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-heading font-black text-sm xs:text-base sm:text-lg text-[#141414]">
                                  Rp {normalPrice.toLocaleString("id-ID")}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tasting Notes / Description */}
                          <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] text-[#5C584E] font-body leading-relaxed line-clamp-2">
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
    </div>
  );
}