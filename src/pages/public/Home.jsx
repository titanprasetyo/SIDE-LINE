import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { cafeService } from "../../services/cafeService";
import heroImg from "../../assets/hero.png";

export default function Home() {
  const [cafeInfo, setCafeInfo] = useState(null);
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [activePromos, setActivePromos] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [liveMusics, setLiveMusics] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  const outletCtx = useOutletContext();
  const onOpenProfile = outletCtx?.onOpenProfile;

  useEffect(() => {
    let ignore = false;
    const loadHomeData = async () => {
      try {
        const [
          infoData,
          { data: menusData },
          { data: promosData },
          { data: facilitiesData },
          { data: liveMusicData },
          { data: galleriesData },
        ] = await Promise.all([
          cafeService.get(),
          supabase
            .from("menus")
            .select("*, categories(name)")
            .eq("is_available", true)
            .eq("is_featured", true)
            .limit(6),
          supabase
            .from("promos")
            .select("*")
            .eq("is_active", true)
            .limit(1),
          supabase
            .from("facilities")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("live_music_schedules")
            .select("*")
            .eq("is_active", true)
            .limit(2),
          supabase
            .from("galleries")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (!ignore) {
          setCafeInfo(infoData);
          setFeaturedMenus(menusData || []);
          setActivePromos(promosData || []);
          setFacilities(facilitiesData || []);
          setLiveMusics(liveMusicData || []);
          setGalleryPreview(galleriesData || []);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Gagal memuat konten beranda:", err);
        if (!ignore) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      ignore = true;
    };
  }, []);

  // Primary visual image: prefer real gallery image from Supabase if available, fallback to heroImg
  const primaryHeroImage =
    galleryPreview.length > 0 && galleryPreview[0]?.image_url
      ? galleryPreview[0].image_url
      : heroImg;

  const secondaryHeroImage =
    galleryPreview.length > 1 && galleryPreview[1]?.image_url
      ? galleryPreview[1].image_url
      : heroImg;

  return (
    <div className="space-y-24 md:space-y-36 pb-24">
      {/* =========================================================================
          1. HERO SECTION: EDITORIAL ASYMMETRIC OPENING
      ========================================================================= */}
      <section className="relative px-6 lg:px-12 pt-8 md:pt-14">
        <div className="mx-auto max-w-7xl">
          {/* Top Overline & Archival Index */}
          <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#FF0000]" />
              <span className="text-[#141414] font-bold">PORTFOLIO EDITION</span>
              <span className="text-[#141414]/30">/</span>
              <span>EST. 2024</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>{cafeInfo?.address?.split(",")[0] || "SPECIALTY COFFEE"}</span>
              <span className="text-[#141414]/30">/</span>
              <span className="text-[#FF0000] font-bold">DAILY BREW</span>
            </div>
          </div>

          {/* Large Editorial Headline & Asymmetric Layout */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            {/* Left Column: Bold Typography & Brand Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block">
                <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000] block mb-2">
                  [ 01 // IDENTITY ]
                </span>
                <h1 className="font-heading text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
                  Crafted Brews, <br />
                  <span className="text-[#FF0000] italic font-light">
                    Quiet Space
                  </span>{" "}
                  <br />
                  & Honest Taste.
                </h1>
              </div>

              <p className="font-body text-sm sm:text-base text-[#5C584E] max-w-xl leading-relaxed pt-2">
                {cafeInfo?.about_text ||
                  "SIDE LINE adalah destinasi kopi terkurasi dan ruang komunal hangat yang memadukan presisi seduhan barista dengan estetika arsitektural yang menenangkan."}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/menu"
                  className="bg-[#FF0000] px-7 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] active:scale-[0.98] transition cursor-pointer"
                >
                  Explore Menu →
                </Link>

                <Link
                  to="/contact"
                  className="border border-[#141414] px-7 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer"
                >
                  Visit Location
                </Link>

                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    type="button"
                    className="text-xs font-heading font-semibold uppercase tracking-wider text-[#5C584E] hover:text-[#FF0000] transition underline underline-offset-4 cursor-pointer"
                  >
                    Curator Note
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Featured Image with Architectural Framing */}
            <div className="lg:col-span-5">
              <div className="relative border border-[#141414] p-2 bg-[#FFF5CF]">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5E8BA]">
                  <img
                    src={primaryHeroImage}
                    alt="SIDE LINE Atmosphere"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {/* Photo Stamp */}
                  <div className="absolute top-3 left-3 bg-[#141414] text-white px-2.5 py-1 text-[9px] font-heading font-bold uppercase tracking-widest">
                    AMBIENCE ARCHIVE
                  </div>
                </div>

                {/* Sub-label */}
                <div className="pt-3 px-1 flex items-center justify-between text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                  <span>{cafeInfo?.name || "SIDE LINE"}</span>
                  <span className="text-[#FF0000]">
                    {cafeInfo?.opening_hours || "09:00 — 22:00"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Editorial Strip: Manifesto & Details */}
          <div className="mt-14 pt-6 border-t border-[#141414]/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <p className="font-heading text-[10px] uppercase tracking-widest text-[#5C584E]">
                01 / PHILOSOPHY
              </p>
              <p className="font-heading font-bold text-[#141414] mt-1">
                Precision Extraction
              </p>
              <p className="font-body text-[11px] text-[#5C584E] mt-0.5">
                Biji kopi pilihan roasted to balance.
              </p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-widest text-[#5C584E]">
                02 / SPACE
              </p>
              <p className="font-heading font-bold text-[#141414] mt-1">
                Warm Minimalism
              </p>
              <p className="font-body text-[11px] text-[#5C584E] mt-0.5">
                Kenyamanan bekerja & bertukar ide.
              </p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-widest text-[#5C584E]">
                03 / HOURS
              </p>
              <p className="font-heading font-bold text-[#141414] mt-1">
                {cafeInfo?.opening_hours || "09:00 — 22:00 WIB"}
              </p>
              <p className="font-body text-[11px] text-[#5C584E] mt-0.5">
                Dine-in, takeaway & coffee space.
              </p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-widest text-[#5C584E]">
                04 / LOCATION
              </p>
              <p className="font-heading font-bold text-[#141414] mt-1 truncate">
                {cafeInfo?.address?.split(",")[0] || "Café SIDE LINE"}
              </p>
              <Link
                to="/contact"
                className="font-heading text-[11px] text-[#FF0000] font-bold mt-0.5 inline-block hover:underline"
              >
                Get Directions →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ABOUT / PHILOSOPHY STORYTELLING BLOCK
      ========================================================================= */}
      <section className="px-6 lg:px-12">
        <div className="mx-auto max-w-7xl border-y border-[#141414] py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Image */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative border border-[#141414] p-2 bg-[#FFF5CF]">
                <div className="aspect-[4/3] overflow-hidden bg-[#F5E8BA]">
                  <img
                    src={secondaryHeroImage}
                    alt="SIDE LINE Interior & Coffee"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                    [ 02 // ARCHIVE PERSPECTIVE ]
                  </span>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000]">
                About The Brand
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#141414] uppercase tracking-tight leading-tight">
                Not Just A Café, <br />
                A Thoughtful Interlude.
              </h2>
              <div className="space-y-4 font-body text-sm sm:text-base text-[#5C584E] leading-relaxed">
                <p>
                  SIDE LINE bermula dari sebuah gagasan sederhana: menciptakan tempat perlindungan dari kesibukan harian, di mana aroma seduhan kopi segar dan kehangatan interior menyatu dalam harmoni.
                </p>
                <p>
                  Setiap sudut ditata dengan cermat agar Anda dapat menikmati waktu berkualitas—baik saat mengerjakan proyek penting, menikmati bacaan, maupun mengobrol hangat bersama teman terdekat.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <Link
                  to="/about"
                  className="font-heading text-xs font-bold uppercase tracking-widest text-[#141414] border-b-2 border-[#FF0000] pb-1 hover:text-[#FF0000] transition"
                >
                  Read Full Story & Concept →
                </Link>
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    type="button"
                    className="font-heading text-xs font-bold uppercase tracking-widest text-[#5C584E] hover:text-[#141414] transition cursor-pointer"
                  >
                    Founder Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED MENU: EDITORIAL CAFÉ PRESENTATION (NOT REPETITIVE CARDS)
      ========================================================================= */}
      <section className="px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#141414] pb-5 gap-4">
            <div>
              <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
                Selected Offerings
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#141414] uppercase tracking-tight">
                Curated Menu Highlights
              </h2>
            </div>
            <Link
              to="/menu"
              className="font-heading text-xs font-bold uppercase tracking-widest text-[#141414] hover:text-[#FF0000] transition flex items-center gap-2"
            >
              <span>View Complete Menu</span>
              <span>→</span>
            </Link>
          </div>

          {/* Menu Items: Editorial List Layout */}
          <div className="mt-8">
            {loading ? (
              <div className="py-16 text-center text-xs font-heading uppercase tracking-widest text-[#5C584E]">
                Loading curated selections...
              </div>
            ) : featuredMenus.length === 0 ? (
              <div className="py-16 text-center text-sm font-body text-[#5C584E]">
                Belum ada menu yang ditandai unggulan. Kunjungi halaman menu untuk melihat semua pilihan sajian.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {featuredMenus.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-b border-[#141414]/15 pb-6 flex gap-4 items-start group"
                  >
                    {/* Index Number */}
                    <span className="font-heading text-xs font-bold text-[#FF0000] pt-1">
                      0{index + 1}
                    </span>

                    {/* Image if available: selective, editorial thumbnail */}
                    {item.image_url && (
                      <div className="h-20 w-20 shrink-0 border border-[#141414] overflow-hidden bg-[#F5E8BA]">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-[#141414] group-hover:text-[#FF0000] transition">
                          {item.name}
                        </h3>
                        <span className="font-heading font-black text-sm sm:text-base text-[#141414] shrink-0">
                          Rp {Number(item.price).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {item.categories?.name && (
                        <span className="text-[10px] font-heading uppercase tracking-wider text-[#FF0000] font-semibold">
                          {item.categories.name}
                        </span>
                      )}

                      <p className="font-body text-xs text-[#5C584E] leading-relaxed line-clamp-2">
                        {item.description || "Racikan istimewa pilihan SIDE LINE."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/menu"
              className="inline-block border border-[#141414] px-8 py-3 text-xs font-heading font-bold uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition"
            >
              Browse Full Catalog & Beverages →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PROMO & SPECIAL OFFERS (IF AVAILABLE)
      ========================================================================= */}
      {activePromos.length > 0 && (
        <section className="px-6 lg:px-12">
          <div className="mx-auto max-w-7xl border border-[#141414] bg-[#FFF5CF] p-8 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-block bg-[#FF0000] text-white px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest">
                  SPECIAL CAMPAIGN
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#141414] uppercase tracking-tight">
                  {activePromos[0].title}
                </h2>
                <p className="font-body text-sm text-[#5C584E] leading-relaxed max-w-xl">
                  {activePromos[0].description}
                </p>

                {(activePromos[0].start_date || activePromos[0].end_date) && (
                  <p className="font-heading text-xs uppercase tracking-wider text-[#141414] font-semibold pt-2">
                    Valid:{" "}
                    {activePromos[0].start_date
                      ? new Date(activePromos[0].start_date).toLocaleDateString("id-ID")
                      : "Today"}{" "}
                    —{" "}
                    {activePromos[0].end_date
                      ? new Date(activePromos[0].end_date).toLocaleDateString("id-ID")
                      : "Ongoing"}
                  </p>
                )}

                <div className="pt-2">
                  <Link
                    to="/promo"
                    className="inline-block bg-[#FF0000] px-6 py-3 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
                  >
                    View Promo Details & Space Booking →
                  </Link>
                </div>
              </div>

              {activePromos[0].image_url && (
                <div className="lg:col-span-5 border border-[#141414] p-2 bg-[#FFF5CF]">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F5E8BA]">
                    <img
                      src={activePromos[0].image_url}
                      alt={activePromos[0].title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          5. LIVE MUSIC SCHEDULE (IF AVAILABLE)
      ========================================================================= */}
      {liveMusics.length > 0 && (
        <section className="px-6 lg:px-12">
          <div className="mx-auto max-w-7xl border-t border-[#141414] pt-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#141414] pb-4 mb-8 gap-4">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
                  Acoustic & Sessions
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
                  Live Music Schedule
                </h2>
              </div>
              <Link
                to="/promo"
                className="font-heading text-xs font-bold uppercase tracking-widest text-[#141414] hover:text-[#FF0000] transition"
              >
                View Full Lineup →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {liveMusics.map((music) => (
                <div
                  key={music.id}
                  className="border border-[#141414] p-6 space-y-3 bg-[#FFF5CF]"
                >
                  <div className="flex items-center justify-between text-[11px] font-heading font-bold uppercase tracking-widest">
                    <span className="text-[#FF0000]">LIVE PERFORMANCE</span>
                    <span className="border border-[#141414] px-2 py-0.5">
                      {music.day_time}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#141414]">
                    {music.title}
                  </h3>
                  {music.performer && (
                    <p className="font-heading text-xs uppercase tracking-wider text-[#5C584E]">
                      Performer: {music.performer}
                    </p>
                  )}
                  {music.description && (
                    <p className="font-body text-xs text-[#5C584E]">
                      {music.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6. GALLERY PREVIEW: ASYMMETRIC PHOTOGRAPHY COLLAGE
      ========================================================================= */}
      {galleryPreview.length > 0 && (
        <section className="px-6 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#141414] pb-4 mb-8 gap-4">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
                  Spatial Archive
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
                  Café Ambience & Moments
                </h2>
              </div>
              <Link
                to="/gallery"
                className="font-heading text-xs font-bold uppercase tracking-widest text-[#141414] hover:text-[#FF0000] transition"
              >
                Explore Full Gallery ({galleryPreview.length}+) →
              </Link>
            </div>

            {/* Asymmetric collage grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryPreview.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative border border-[#141414] overflow-hidden bg-[#F5E8BA] ${
                    index === 0
                      ? "col-span-2 row-span-2 aspect-[4/3] md:aspect-auto"
                      : "aspect-square"
                  }`}
                >
                  <img
                    src={item.image_url}
                    alt={item.title || "Suasana"}
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-[#141414]/80 text-[#FFF5CF] p-2 text-[10px] font-heading uppercase tracking-widest opacity-0 group-hover:opacity-100 transition truncate">
                    {item.title || "SIDE LINE Space"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          7. FACILITIES & AMENITIES: ARCHITECTURAL LIST
      ========================================================================= */}
      {facilities.length > 0 && (
        <section className="px-6 lg:px-12">
          <div className="mx-auto max-w-7xl border-t border-[#141414] pt-12">
            <div className="max-w-xl mb-8">
              <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
                Hospitality & Amenities
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
                Designed for Your Comfort
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((fac, idx) => (
                <div
                  key={fac.id}
                  className="border border-[#141414] p-5 space-y-2 bg-[#FFF5CF]"
                >
                  <div className="flex items-center justify-between text-[10px] font-heading font-bold uppercase tracking-widest text-[#5C584E]">
                    <span>0{idx + 1}</span>
                    <span className="text-[#FF0000]">{fac.icon || "•"}</span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#141414] uppercase">
                    {fac.name}
                  </h3>
                  <p className="font-body text-xs text-[#5C584E] leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          8. VISIT & ACTION SECTION
      ========================================================================= */}
      <section className="px-6 lg:px-12">
        <div className="mx-auto max-w-7xl border-2 border-[#141414] p-8 md:p-14 bg-[#FFF5CF]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000]">
                We Look Forward to Welcoming You
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#141414] uppercase tracking-tight">
                Plan Your Visit to SIDE LINE
              </h2>
              <p className="font-body text-sm text-[#5C584E]">
                {cafeInfo?.address || "Jl. Contoh Alamat Café SIDE LINE"}
              </p>
              <p className="font-heading text-xs uppercase tracking-wider font-semibold text-[#141414]">
                Operating: {cafeInfo?.opening_hours || "Setiap Hari: 09:00 — 22:00 WIB"}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              {cafeInfo?.google_maps_url && (
                <a
                  href={cafeInfo.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center bg-[#FF0000] px-6 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
                >
                  Open in Google Maps ↗
                </a>
              )}
              <Link
                to="/contact"
                className="w-full text-center border border-[#141414] px-6 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition"
              >
                Contact & Inquiries
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}