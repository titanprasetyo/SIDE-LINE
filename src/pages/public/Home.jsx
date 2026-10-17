import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { cafeService } from "../../services/cafeService";
import { homeBannerService } from "../../services/homeBannerService";
import defaultHeroPrimary from "../../assets/hero-default-primary.jpg";
import defaultHeroSecondary from "../../assets/hero-default-secondary.jpg";
import HeroFoliage3D from "../../components/public/HeroFoliage3D";
import { cleanText, toWhatsAppLink, safeUrl } from "../../utils/text";
import { reviewService } from "../../services/reviewService";

export default function Home() {
  const [cafeInfo, setCafeInfo] = useState(null);
  const [heroBanner, setHeroBanner] = useState(null);
  const [aboutStories, setAboutStories] = useState([]);
  const [activePromos, setActivePromos] = useState([]);
  const [liveMusics, setLiveMusics] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [_loading, setLoading] = useState(true);

  // Review Input Form State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    tag: "Pecinta Kopi",
    comment: "",
  });

  // Hero Slider state
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState("right"); // "right" | "left"
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const outletCtx = useOutletContext();
  const onOpenProfile = outletCtx?.onOpenProfile;

  useEffect(() => {
    let ignore = false;
    const loadHomeData = async () => {
      try {
        const [
          infoData,
          heroData,
          storiesData,
          { data: promosData },
          { data: liveMusicData },
          reviewsData,
        ] = await Promise.all([
          cafeService.get(),
          homeBannerService.getHero(),
          homeBannerService.getAboutStories(true),
          supabase
            .from("promos")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("live_music_schedules")
            .select("*")
            .eq("is_active", true)
            .limit(2),
          reviewService.getAll(),
        ]);

        if (!ignore) {
          setCafeInfo(infoData);
          setHeroBanner(heroData);
          setAboutStories(storiesData || []);
          setActivePromos(promosData || []);
          setLiveMusics(liveMusicData || []);
          setReviews(reviewsData || []);
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

  // Handle Review Submission dari Pelanggan
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setReviewNotice("Nama dan ulasan wajib diisi.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewNotice("");
      const created = await reviewService.create(reviewForm);
      setReviews((prev) => [created, ...prev]);
      setReviewNotice("Terima kasih! Ulasan Anda berhasil ditambahkan.");
      setReviewForm({
        name: "",
        rating: 5,
        tag: "Pecinta Kopi",
        comment: "",
      });
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewNotice("");
      }, 2000);
    } catch (err) {
      setReviewNotice("Gagal mengirim ulasan: " + (err.message || ""));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ─── Slider: build slides array ─────────────────────────────────────────
  const heroImageUrl = heroBanner?.image_url || defaultHeroPrimary;

  const slides = [
    // Slide 0: Konten Beranda (dari admin)
    {
      id: "beranda",
      type: "beranda",
      image: heroImageUrl,
      badge: "BERANDA",
      title: cleanText(cafeInfo?.name) || "SIDE LINE",
      subtitle: "COFFEE & EATERY",
      caption: "Seduhan istimewa, ruang tenang & cita rasa otentik.",
      link: null,
    },
    // Slide 1+: Event aktif dari admin
    ...activePromos.map((evt) => ({
      id: evt.id,
      type: "event",
      image: evt.image_url || defaultHeroPrimary,
      badge: "EVENT",
      title: cleanText(evt.title),
      subtitle: "AGENDA",
      caption: cleanText(evt.description),
      dateStart: evt.start_date,
      dateEnd: evt.end_date,
      link: "/event",
    })),
  ];

  const total = slides.length;

  // ─── Slider navigation ───────────────────────────────────────────────────
  const goTo = useCallback(
    (nextIdx, dir = "right") => {
      if (isAnimating || total < 2) return;
      setSlideDir(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setSlideIndex(nextIdx);
        setIsAnimating(false);
      }, 420);
    },
    [isAnimating, total]
  );

  const goNext = useCallback(() => {
    goTo((slideIndex + 1) % total, "right");
  }, [goTo, slideIndex, total]);

  const goPrev = useCallback(() => {
    goTo((slideIndex - 1 + total) % total, "left");
  }, [goTo, slideIndex, total]);

  // ─── Auto-play ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (total < 2 || isPaused) return;
    timerRef.current = setInterval(goNext, 4500);
    return () => clearInterval(timerRef.current);
  }, [goNext, isPaused, total]);

  // ─── Touch swipe handlers ────────────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true); // pause while touching
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    setTimeout(() => setIsPaused(false), 1200);
  };

  const currentSlide = slides[slideIndex] || slides[0];

  // ─── Format date helper ───────────────────────────────────────────────────
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  // Fallback About Story jika admin belum input
  const displayStories =
    aboutStories.length > 0
      ? aboutStories
      : [
          {
            id: "default-1",
            image_url: defaultHeroSecondary,
            photo_label: "Sudut favorit pengunjung di sore hari",
            kicker: "Tentang Side Line",
            heading: "Lebih dari sekadar tempat ngopi.",
            paragraph1:
              "Side Line berawal dari ide sederhana: bikin tempat buat rehat sebentar dari hari yang padat. Kopi diseduh segar, dapurnya jalan terus, dan ruangannya dibuat supaya kamu nyaman duduk lama.",
            paragraph2:
              "Mau kerja, baca buku, atau ngobrol panjang sama teman, selalu ada meja yang pas.",
            highlight1_title: "Kopi yang diseduh serius",
            highlight1_desc:
              "Biji kopi pilihan dengan profil sangrai yang kami uji sendiri, supaya rasanya konsisten tiap cangkir.",
            highlight2_title: "Ruang yang bikin betah",
            highlight2_desc:
              "Aksen kayu hangat, cahaya alami, dan pilihan meja untuk kerja sendiri maupun rame-rame.",
          },
        ];

  return (
    <div className="pb-16">
      {/* =========================================================================
          1. HERO SECTION (UPGRADED EDITORIAL SCRAPBOOK + 3D LEAVES & SHADOWS)
      ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-12 2xl:px-16 pt-6 sm:pt-8 md:pt-14 pb-6 md:pb-8 overflow-hidden">
        {/* 3D Animated Botanical Foliage & Dappled Sunlight Shadows */}
        <HeroFoliage3D />

        <div className="relative z-10 mx-auto max-w-7xl 2xl:max-w-[1600px]">
          {/* Main Hero Content Grid: Left Narrative & Right Scrapbook Collage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 items-center">
            
            {/* -------------------------------------------------------------
                LEFT COLUMN: TYPOGRAPHY, BRAND NARRATIVE & PILLARS
            ------------------------------------------------------------- */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-5 sm:space-y-6 lg:space-y-7">
              {/* Overline / Kicker with red dash */}
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-[2px] bg-[#E5251F]" />
                <span className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#141414]">
                  SIDE LINE COFFEE &amp; EATERY
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] 2xl:text-[5.25rem] font-black uppercase tracking-tight text-[#141414] leading-[0.96] sm:leading-[0.93]">
                SEDUHAN <br />
                ISTIMEWA, <br />
                <span className="text-[#E5251F] italic font-black">
                  RUANG TENANG
                </span> <br />
                & CITA RASA <br />
                OTENTIK.
              </h1>

              {/* Editorial Description */}
              <p className="font-body text-xs sm:text-sm md:text-[15px] text-[#5C584E] max-w-xl leading-relaxed">
                SIDE LINE adalah cafe yang menghadirkan pengalaman menikmati kopi pilihan,
                hidangan lezat, dan suasana ruang yang hangat untuk berkumpul, bekerja, maupun bersantai.
              </p>

              {/* 3 Key Pillars / Feature Highlights with Red Outline Icons */}
              <div className="grid grid-cols-1 xs:grid-cols-3 divide-y xs:divide-y-0 xs:divide-x divide-[#141414]/15 border-y border-[#141414]/15 py-2.5 xs:py-3.5 max-w-xl gap-2 xs:gap-0">
                {/* Pillar 1: Coffee */}
                <div className="flex items-center gap-2.5 pr-0 xs:pr-2 sm:pr-3 py-1 xs:py-0">
                  <div className="text-[#E5251F] shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-extrabold text-[11px] sm:text-xs text-[#141414] uppercase leading-tight">
                      KOPI PILIHAN
                    </span>
                    <span className="font-heading text-[9px] sm:text-[10px] md:text-[11px] text-[#5C584E] tracking-wider uppercase">
                      SPECIALTY
                    </span>
                  </div>
                </div>

                {/* Pillar 2: WiFi */}
                <div className="flex items-center gap-2.5 px-0 xs:px-2 sm:px-3 py-1 xs:py-0">
                  <div className="text-[#E5251F] shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <circle cx="12" cy="20" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-extrabold text-[11px] sm:text-xs text-[#141414] uppercase leading-tight">
                      WI-FI KENCANG &
                    </span>
                    <span className="font-heading text-[9px] sm:text-[10px] md:text-[11px] text-[#5C584E] tracking-wider uppercase">
                      RAMAH WFC
                    </span>
                  </div>
                </div>

                {/* Pillar 3: Warm Ambience */}
                <div className="flex items-center gap-2.5 pl-0 xs:pl-2 sm:pl-3 py-1 xs:py-0">
                  <div className="text-[#E5251F] shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-extrabold text-[11px] sm:text-xs text-[#141414] uppercase leading-tight">
                      SUASANA HANGAT
                    </span>
                    <span className="font-heading text-[9px] sm:text-[10px] md:text-[11px] text-[#5C584E] tracking-wider uppercase">
                      TERKURASI
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto text-center bg-[#E5251F] px-6 sm:px-7 py-3 sm:py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#C91E19] active:scale-[0.98] transition cursor-pointer shadow-md rounded-xs sm:rounded-none"
                >
                  LIHAT DAFTAR MENU →
                </Link>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto text-center border border-[#141414] bg-transparent px-6 sm:px-7 py-3 sm:py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer rounded-xs sm:rounded-none"
                >
                  KUNJUNGI LOKASI
                </Link>
              </div>
            </div>

            {/* -------------------------------------------------------------
                RIGHT COLUMN: HERO CARD SLIDER (AUTO-SLIDE + PAUSE ON HOVER)
            ------------------------------------------------------------- */}
            <div className="lg:col-span-6 xl:col-span-5 relative mt-8 lg:mt-0">
              <div
                className="relative w-full select-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* ── FOTO + OVERLAY INFO ── */}
                <div className="relative w-full group overflow-hidden">

                  {/* Foto */}
                  <img
                    key={currentSlide.id}
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className={`block w-full h-auto transition-all duration-[420ms] ease-in-out
                      ${isAnimating
                        ? slideDir === "right"
                          ? "-translate-x-6 opacity-0"
                          : "translate-x-6 opacity-0"
                        : "translate-x-0 opacity-100"
                      }`}
                  />

                  {/* Gradient bawah supaya teks terbaca */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 via-[#141414]/15 to-transparent pointer-events-none" />

                  {/* Badge + counter di atas kiri */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-heading font-black uppercase tracking-[0.2em] text-white
                        ${currentSlide.type === "event" ? "bg-[#E5251F]" : "bg-[#141414]/80"}`}
                    >
                      {currentSlide.badge}
                    </span>
                    {total > 1 && (
                      <span className="text-[10px] font-heading font-bold text-white/70 tracking-widest bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded">
                        {String(slideIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Info bawah: judul, tanggal, deskripsi, tombol */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 px-5 pb-5 pt-12 space-y-1.5 transition-all duration-[420ms] ease-in-out
                      ${isAnimating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
                  >
                    <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-white/60 font-semibold">
                      {currentSlide.subtitle}
                    </p>
                    <h3 className="font-heading font-black text-white uppercase leading-tight text-xl sm:text-2xl line-clamp-2 drop-shadow-lg">
                      {currentSlide.title}
                    </h3>

                    {/* Tanggal — khusus slide event */}
                    {currentSlide.type === "event" && (currentSlide.dateStart || currentSlide.dateEnd) && (
                      <p className="text-white/75 text-[11px] font-heading font-semibold tracking-wide">
                        {fmtDate(currentSlide.dateStart) || "Mulai"}
                        {" – "}
                        {fmtDate(currentSlide.dateEnd) || "Selesai"}
                      </p>
                    )}

                    {/* Deskripsi / caption */}
                    {currentSlide.caption && (
                      <p className="text-white/65 text-[12px] font-body leading-snug line-clamp-2">
                        {currentSlide.caption}
                      </p>
                    )}

                    {/* Tombol CTA khusus event */}
                    {currentSlide.type === "event" && currentSlide.link && (
                      <Link
                        to={currentSlide.link}
                        className="inline-flex items-center gap-1.5 mt-1 bg-[#E5251F] hover:bg-[#C91E19] text-white text-[10px] font-heading font-bold uppercase tracking-widest px-3.5 py-1.5 transition"
                      >
                        Lihat Event <span>→</span>
                      </Link>
                    )}
                  </div>

                  {/* Prev / Next arrows — muncul saat hover */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={goPrev}
                        aria-label="Slide sebelumnya"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-base sm:text-lg transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                      >
                        ‹
                      </button>
                      <button
                        onClick={goNext}
                        aria-label="Slide berikutnya"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-base sm:text-lg transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {/* ── DOTS + PROGRESS di bawah foto ── */}
                {total > 1 && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    {/* Dots */}
                    <div className="flex items-center gap-2">
                      {slides.map((s, i) => (
                        <button
                          key={s.id}
                          onClick={() => goTo(i, i > slideIndex ? "right" : "left")}
                          aria-label={`Slide ${i + 1}`}
                          className={`transition-all duration-300 rounded-full cursor-pointer
                            ${i === slideIndex
                              ? "w-6 h-2 bg-[#E5251F]"
                              : "w-2 h-2 bg-[#141414]/25 hover:bg-[#141414]/50"
                            }`}
                        />
                      ))}
                    </div>

                    {/* Progress bar */}
                    {!isPaused && (
                      <div className="w-full h-[2px] bg-[#141414]/10 overflow-hidden rounded-full">
                        <div
                          key={`progress-${slideIndex}`}
                          className="h-full w-full bg-[#E5251F] animate-slider-progress"
                          style={{ transformOrigin: "left" }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              4 CARDS: FILOSOFI, KENYAMANAN, JAM, LOKASI (CLEAN, MINIMAL, TIGHT GAP)
          ------------------------------------------------------------- */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {/* Card 1 - Filosofi */}
            <div className="rounded-xl border border-[#141414]/15 bg-[#FFF5CF] p-4 sm:p-5 flex flex-col justify-between hover:border-[#141414] transition-colors">
              <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-[#E5251F]">
                Filosofi
              </span>
              <p className="mt-2 font-heading font-black text-sm sm:text-base text-[#141414] uppercase leading-tight">
                Kopi, Manusia, dan Cerita
              </p>
              <div className="mt-3 h-[2px] w-6 bg-[#E5251F]" />
            </div>

            {/* Card 2 - Kenyamanan */}
            <div className="rounded-xl border border-[#141414] bg-[#141414] p-4 sm:p-5 flex flex-col justify-between shadow-sm">
              <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-[#FFF5CF]/60">
                Kenyamanan
              </span>
              <p className="mt-2 font-heading font-black text-sm sm:text-base text-[#FFF5CF] uppercase leading-tight">
                Tempat yang Bikin Betah
              </p>
              <div className="mt-3 h-[2px] w-6 bg-[#FFF5CF]/40" />
            </div>

            {/* Card 3 - Jam Operasional */}
            <div className="rounded-xl border border-[#141414]/15 bg-[#FFF5CF] p-4 sm:p-5 flex flex-col justify-between hover:border-[#141414] transition-colors">
              <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-[#5C584E]">
                Jam Buka
              </span>
              <p className="mt-2 font-heading font-black text-xs sm:text-sm text-[#141414] uppercase leading-tight">
                {cleanText(cafeInfo?.opening_hours) || "Setiap Hari: 09:00 – 22:00 WIB"}
              </p>
              <div className="mt-3 h-[2px] w-6 bg-[#141414]/40" />
            </div>

            {/* Card 4 - Lokasi */}
            <div className="rounded-xl border border-[#E5251F] bg-[#E5251F] p-4 sm:p-5 flex flex-col justify-between shadow-sm text-white">
              <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-white/70">
                Lokasi
              </span>
              <p className="mt-2 font-heading font-black text-xs sm:text-sm text-white uppercase leading-tight line-clamp-2">
                {cleanText(cafeInfo?.address) || "Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan"}
              </p>
              <div className="mt-3 h-[2px] w-6 bg-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ABOUT SECTION (PEPET / CLOSE TO HERO CONTENT)
      ========================================================================= */}
      <section id="about" className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-4 md:pt-6 space-y-8 sm:space-y-10 md:space-y-14">
        {displayStories.map((story, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={story.id || index}
              className="mx-auto max-w-7xl 2xl:max-w-[1600px] pt-4 pb-6 sm:pb-8 border-t border-[#141414]/15"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Visual Image */}
                <div
                  className={`lg:col-span-5 ${
                    isEven ? "order-2 lg:order-1" : "order-2 lg:order-2"
                  }`}
                >
                  <div className="overflow-hidden rounded-2xl border border-[#141414]/20 bg-[#F5E8BA] shadow-sm">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={story.image_url}
                        alt={cleanText(story.heading) || cleanText(story.photo_label) || "Side Line Story"}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                    {story.photo_label && (
                      <div className="px-4 py-2.5 bg-[#FFF5CF] border-t border-[#141414]/10 flex items-center justify-between text-[11px] font-heading font-semibold text-[#5C584E]">
                        <span className="truncate">{cleanText(story.photo_label)}</span>
                        <span className="text-[#E5251F] font-bold text-[10px] uppercase">
                          {cleanText(story.badge) || "Side Line"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Narrative Text Column */}
                <div
                  className={`lg:col-span-7 space-y-5 ${
                    isEven ? "order-1 lg:order-2" : "order-1 lg:order-1"
                  }`}
                >
                  {story.kicker && (
                    <span className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#E5251F]">
                      {cleanText(story.kicker)}
                    </span>
                  )}

                  <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-black text-[#141414] uppercase tracking-tight leading-tight">
                    {cleanText(story.heading)}
                  </h2>

                  <div className="space-y-3 font-body text-sm sm:text-base text-[#5C584E] leading-relaxed">
                    {story.paragraph1 && <p>{cleanText(story.paragraph1)}</p>}
                    {story.paragraph2 && <p>{cleanText(story.paragraph2)}</p>}
                  </div>

                  {/* Highlight Cards */}
                  {(story.highlight1_title || story.highlight2_title) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {story.highlight1_title && (
                        <div className="rounded-xl border border-[#141414]/15 bg-[#FFF5CF] p-4">
                          <p className="text-xs font-heading font-bold uppercase tracking-wide text-[#141414] mb-1">
                            {cleanText(story.highlight1_title, { stripIndex: true })}
                          </p>
                          <p className="text-xs font-body text-[#5C584E] leading-relaxed">
                            {cleanText(story.highlight1_desc)}
                          </p>
                        </div>
                      )}

                      {story.highlight2_title && (
                        <div className="rounded-xl border border-[#141414]/15 bg-[#FFF5CF] p-4">
                          <p className="text-xs font-heading font-bold uppercase tracking-wide text-[#141414] mb-1">
                            {cleanText(story.highlight2_title, { stripIndex: true })}
                          </p>
                          <p className="text-xs font-body text-[#5C584E] leading-relaxed">
                            {cleanText(story.highlight2_desc)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Links */}
                  <div className="pt-2 flex flex-wrap items-center gap-5">
                    <Link
                      to="/menu"
                      className="font-heading text-xs font-bold uppercase tracking-wider text-[#141414] border-b-2 border-[#E5251F] pb-1 hover:text-[#E5251F] transition-colors"
                    >
                      Jelajahi Menu & Minuman →
                    </Link>
                    {onOpenProfile && (
                      <button
                        onClick={onOpenProfile}
                        type="button"
                        className="font-heading text-xs font-bold uppercase tracking-wider text-[#5C584E] hover:text-[#141414] transition-colors cursor-pointer"
                      >
                        Profil Pendiri
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* =========================================================================
          3. CUSTOMER REVIEWS (ULASAN PELANGGAN)
      ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-12 sm:pt-14 md:pt-20">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] border-t border-[#141414]/15 pt-10 sm:pt-12 md:pt-16">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-[#141414]/15">
            <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
              <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#E5251F]">
                Suara Pelanggan
              </span>
              <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#141414] leading-[1] sm:leading-[0.95]">
                Apa Kata Mereka Tentang Side Line.
              </h2>
              <p className="font-body text-xs sm:text-sm md:text-base text-[#5C584E] leading-relaxed">
                Cerita dan pengalaman jujur dari teman-teman yang sering mampir, bekerja, dan menikmati kopi di sudut ruang kami.
              </p>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-2.5 rounded-2xl bg-[#141414] px-4 py-2.5 sm:py-3 text-[#FFF5CF] justify-center xs:justify-start">
                <span className="text-lg text-amber-400">★</span>
                <div>
                  <div className="font-heading text-sm font-black tracking-tight text-white">
                    4.9 / 5.0
                  </div>
                  <div className="text-[10px] text-[#FFF5CF]/65">
                    {reviews.length} Ulasan Terverifikasi
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReviewNotice("");
                  setIsReviewModalOpen(true);
                }}
                className="w-full xs:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#E5251F] px-5 sm:px-6 py-3 sm:py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#C91E19] active:scale-95 transition cursor-pointer shadow-sm"
              >
                <span>+</span>
                <span>Tulis Ulasan Kamu</span>
              </button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {reviews.map((rev, index) => {
              const stars = Number(rev.rating) || 5;
              const reviewerName = cleanText(rev.name) || "Pelanggan Side Line";
              const comment = cleanText(rev.comment);
              const tag = cleanText(rev.tag) || "Pengunjung";
              const initial = reviewerName.charAt(0).toUpperCase();

              return (
                <div
                  key={rev.id || index}
                  className="flex flex-col justify-between rounded-2xl border border-[#141414]/15 bg-white p-5 sm:p-6 md:p-7 shadow-xs hover:border-[#141414]/30 transition-all duration-200"
                >
                  <div className="space-y-3.5 sm:space-y-4">
                    {/* Stars & Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        {"★".repeat(stars)}
                        <span className="text-slate-200">
                          {"★".repeat(Math.max(0, 5 - stars))}
                        </span>
                      </div>
                      <span className="rounded-full bg-[#FFF5CF] border border-[#141414]/10 px-2.5 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider text-[#141414]">
                        {tag}
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="font-body text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#141414] italic">
                      "{comment}"
                    </p>
                  </div>

                  {/* Reviewer Info */}
                  <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-[#141414]/10 flex items-center gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#141414] text-xs font-heading font-bold text-[#FFF5CF]">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading text-xs sm:text-sm font-bold text-[#141414] truncate">
                        {reviewerName}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-[#5C584E]">
                        {rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Pengunjung Terverifikasi"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Review Modal for Customers */}
      {isReviewModalOpen && (
        <div
          onClick={() => setIsReviewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/85 p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-[#FFF5CF] border-2 border-[#141414] p-5 sm:p-8 text-[#141414] shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between pb-4 border-b border-[#141414]/15">
              <div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#E5251F]">
                  Ulasan Pengunjung
                </span>
                <h3 className="font-heading text-lg sm:text-2xl font-black uppercase tracking-tight text-[#141414] mt-0.5">
                  Bagikan Pengalaman Kamu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="h-8 w-8 rounded-full border border-[#141414]/20 flex items-center justify-center text-sm font-bold hover:bg-[#141414] hover:text-[#FFF5CF] transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {reviewNotice && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                  reviewNotice.includes("Gagal")
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {reviewNotice}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="mt-4 sm:mt-5 space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#141414] mb-1">
                  Nama Kamu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dimas Aditya"
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#141414]/20 bg-white px-4 py-2.5 text-sm text-[#141414] placeholder-[#5C584E]/50 outline-none focus:border-[#E5251F] focus:ring-1 focus:ring-[#E5251F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#141414] mb-1">
                    Rating Bintang *
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                        title={`${star} Bintang`}
                      >
                        <span
                          className={
                            star <= (hoverRating || reviewForm.rating)
                              ? "text-amber-500"
                              : "text-slate-300"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="ml-1 text-xs font-bold text-[#5C584E]">
                      {hoverRating || reviewForm.rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#141414] mb-1">
                    Kategori Pengunjung
                  </label>
                  <select
                    value={reviewForm.tag}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, tag: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#141414]/20 bg-white px-3.5 py-2.5 text-xs text-[#141414] outline-none focus:border-[#E5251F]"
                  >
                    <option value="Pecinta Kopi">Pecinta Kopi</option>
                    <option value="Work From Cafe">Work From Cafe</option>
                    <option value="Nongkrong Santai">Nongkrong Santai</option>
                    <option value="Dine-in">Dine-in</option>
                    <option value="Keluarga & Teman">Keluarga & Teman</option>
                    <option value="Pelanggan Setia">Pelanggan Setia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#141414] mb-1">
                  Ulasan / Cerita Pengalaman Kamu *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ceritakan rasa kopi, makanan favorit, suasana tempat, atau pelayanan barista kami..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#141414]/20 bg-white px-4 py-2.5 text-sm text-[#141414] placeholder-[#5C584E]/50 outline-none focus:border-[#E5251F] focus:ring-1 focus:ring-[#E5251F]"
                />
              </div>

              <div className="flex flex-col-reverse xs:flex-row justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#141414]/15">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-full xs:w-auto text-center rounded-full border border-[#141414]/30 px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414]/5 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full xs:w-auto text-center rounded-full bg-[#E5251F] px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#C91E19] disabled:opacity-50 transition cursor-pointer shadow-sm"
                >
                  {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. VISIT & LOCATION BANNER
      ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-8 sm:pt-12">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] rounded-2xl sm:rounded-3xl border border-[#141414]/15 p-6 sm:p-8 md:p-12 bg-[#141414] text-[#FFF5CF]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-2.5 sm:space-y-3">
              <span className="text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#E5251F]">
                Kunjungan
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                Rencanakan Kunjungan ke Side Line
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#FFF5CF]/70 max-w-xl leading-relaxed">
                {cleanText(cafeInfo?.address) || "Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan"}
              </p>
              <p className="font-heading text-xs uppercase tracking-wider font-semibold text-white/90">
                Jam Buka: {cleanText(cafeInfo?.opening_hours) || "Setiap Hari: 09:00 – 22:00 WIB"}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
              <a
                href={safeUrl(cafeInfo?.google_maps_url, "https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan")}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center rounded-full bg-[#E5251F] px-6 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#C91E19] transition-colors shadow-sm"
              >
                Kunjungi Cafe Sekarang ↗
              </a>
              <Link
                to="/contact"
                className="w-full text-center rounded-full border border-white/30 px-6 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:border-white hover:bg-white/10 transition-colors"
              >
                Hubungi & Reservasi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
