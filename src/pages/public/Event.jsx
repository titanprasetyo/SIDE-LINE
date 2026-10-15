import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { eventService } from "../../services/eventService";
import { cafeService } from "../../services/cafeService";
import { cleanText, toWhatsAppLink } from "../../utils/text";

const FALLBACK_PHONE = "6281234567890";

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatEventDate = (startDateStr, endDateStr) => {
  if (!startDateStr) return "Jadwal Segera Diumumkan";
  const start = new Date(startDateStr);
  if (Number.isNaN(start.getTime())) return startDateStr;

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const startDayName = dayNames[start.getDay()];
  const startDay = start.getDate();
  const startMonth = monthNames[start.getMonth()];
  const startYear = start.getFullYear();

  if (!endDateStr || startDateStr === endDateStr) {
    return `${startDayName}, ${startDay} ${startMonth} ${startYear}`;
  }

  const end = new Date(endDateStr);
  if (Number.isNaN(end.getTime())) {
    return `${startDayName}, ${startDay} ${startMonth} ${startYear}`;
  }

  const endDay = end.getDate();
  const endMonth = monthNames[end.getMonth()];
  const endYear = end.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
};

const getEventStatusBadge = (startDateStr, endDateStr) => {
  if (!startDateStr) {
    return {
      label: "Segera Hadir",
      badgeClass: "bg-amber-100 text-amber-800 border border-amber-300",
      dotClass: "bg-amber-500",
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (now > end) {
    return {
      label: "Event Selesai",
      badgeClass: "bg-zinc-100 text-zinc-600 border border-zinc-200",
      dotClass: "bg-zinc-400",
    };
  } else if (now >= start && now <= end) {
    return {
      label: "Sedang Berlangsung",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold",
      dotClass: "bg-emerald-500 animate-pulse",
    };
  } else {
    const diffDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return {
      label: diffDays <= 7 ? `Akan Datang (${diffDays} hari lagi)` : "Mendatang",
      badgeClass: "bg-red-50 text-[#FF0000] border border-red-200 font-bold",
      dotClass: "bg-[#FF0000]",
    };
  }
};

const splitList = (text) =>
  (text || "")
    .split(/[,\n;•]+/)
    .map((s) => cleanText(s))
    .filter(Boolean);

export default function Event() {
  const [events, setEvents] = useState([]);
  const [liveMusics, setLiveMusics] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [cafePhone, setCafePhone] = useState("");
  const [loading, setLoading] = useState(true);

  // Active Filter Tab: 'all' | 'events' | 'music' | 'spaces'
  const [activeTab, setActiveTab] = useState("all");

  // Modal Detail State
  const [activeModalItem, setActiveModalItem] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchEventData = async () => {
      try {
        const [allEvents, { data: musicData }, { data: spaceData }, info] =
          await Promise.all([
            eventService.getAll().catch(() => []),
            supabase
              .from("live_music_schedules")
              .select("*")
              .eq("is_active", true)
              .order("created_at", { ascending: false }),
            supabase
              .from("space_bookings")
              .select("*")
              .eq("is_available", true)
              .order("created_at", { ascending: false }),
            cafeService.get().catch(() => null),
          ]);

        if (!ignore) {
          setEvents((allEvents || []).filter((e) => e.is_active));
          setLiveMusics(musicData || []);
          setSpaces(spaceData || []);
          setCafePhone(info?.phone || "");
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat agenda event:", err);
        if (!ignore) setLoading(false);
      }
    };

    fetchEventData();
    return () => {
      ignore = true;
    };
  }, []);

  const eventLink = (title) =>
    toWhatsAppLink(
      cafePhone || FALLBACK_PHONE,
      `Halo Side Line Coffee, saya mau tanya info dan pendaftaran untuk event "${title}".`
    );

  const musicLink = (title, dayTime) =>
    toWhatsAppLink(
      cafePhone || FALLBACK_PHONE,
      `Halo Side Line Coffee, saya mau reservasi meja untuk Live Music "${title}" (${dayTime}).`
    );

  const bookingLink = (phone, spaceName) =>
    toWhatsAppLink(
      phone || cafePhone || FALLBACK_PHONE,
      `Halo Side Line Coffee, saya tertarik untuk menyewa ruang "${spaceName}". Rencananya untuk tanggal ...`
    );

  // Highlighted event (event paling baru/terdekat)
  const featuredEvent = useMemo(() => {
    if (events.length === 0) return null;
    return events[0];
  }, [events]);

  const totalActivities = events.length + liveMusics.length + spaces.length;

  return (
    <div className="min-h-screen bg-[#FFF5CF] text-[#141414] pb-24 selection:bg-[#FF0000] selection:text-white">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO HEADER: JELAS, MENARIK, & INFORMATIF
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#141414]/15 bg-[#FFF5CF] pt-10 sm:pt-12 md:pt-16 pb-10 sm:pb-12 md:pb-16 px-4 sm:px-6 lg:px-12 2xl:px-16">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FF0000]/30 bg-[#FF0000]/10 px-3.5 py-1 text-xs font-heading font-black tracking-widest text-[#FF0000] uppercase mb-3 sm:mb-4">
                <span className="h-2 w-2 rounded-full bg-[#FF0000] animate-pulse" />
                AGENDA &amp; KEGIATAN // SIDE LINE
              </span>

              <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black uppercase tracking-tight text-[#141414] leading-[1.05]">
                ACARA SERU, <br />
                <span className="text-[#FF0000]">LIVE MUSIC</span>, &amp; SEWA RUANG.
              </h1>

              <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-base font-body text-[#5C584E] leading-relaxed">
                Temukan jadwal kegiatan terbaru, alunan live music santai setiap akhir pekan,
                hingga ruang privat yang siap disewa untuk rapat kerja, workshop, atau pesta perayaan Anda.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-3 bg-white/70 border border-[#141414]/10 rounded-2xl p-3.5 sm:p-4 shadow-xs shrink-0 self-start md:self-auto w-full sm:w-auto">
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#FF0000] text-xl sm:text-2xl text-white shadow-sm shrink-0">
                📅
              </span>
              <div>
                <p className="text-[10px] sm:text-xs uppercase font-heading font-bold text-[#5C584E]">
                  Total Pilihan Agenda
                </p>
                <p className="font-heading text-lg sm:text-xl font-black text-[#141414]">
                  {loading ? "..." : `${totalActivities} Kegiatan Aktif`}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs Navigation (Smooth touch scroll on mobile) */}
          <div className="mt-8 sm:mt-10 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center sm:flex-wrap gap-2 sm:gap-2.5 pt-5 sm:pt-6 border-t border-[#141414]/10 overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "🌟 Semua Agenda", count: totalActivities },
              { id: "events", label: "🎪 Acara & Workshop", count: events.length },
              { id: "music", label: "🎸 Live Music Mingguan", count: liveMusics.length },
              { id: "spaces", label: "🏛️ Sewa Ruang Privat", count: spaces.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#141414] text-[#FFF5CF] shadow-md -translate-y-0.5"
                    : "bg-white/80 border border-[#141414]/15 text-[#141414] hover:bg-white hover:border-[#141414]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeTab === tab.id
                      ? "bg-[#FF0000] text-white"
                      : "bg-[#141414]/10 text-[#141414]"
                  }`}
                >
                  {loading ? "..." : tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. FEATURED EVENT SPOTLIGHT (JIKA ADA EVENT UNGGULAN)
      ────────────────────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "events") && featuredEvent && (
        <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-8 sm:pt-10 md:pt-14">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
            <div className="rounded-2xl sm:rounded-3xl border border-[#141414]/20 bg-white p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
              {/* Subtle accent border */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF0000] via-[#D60000] to-[#141414]" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                {/* Event Poster / Visual */}
                <div className="lg:col-span-5 relative group cursor-pointer" onClick={() => setActiveModalItem(featuredEvent)}>
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900 border border-[#141414]/10 relative shadow-md">
                    {featuredEvent.image_url ? (
                      <img
                        src={featuredEvent.image_url}
                        alt={featuredEvent.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#141414] to-[#2a2a2a] text-white p-6 text-center">
                        <span className="text-5xl mb-2">🎉</span>
                        <p className="font-heading font-black text-xl uppercase tracking-wider text-white">
                          {featuredEvent.title}
                        </p>
                        <p className="text-xs text-white/70 mt-1">Side Line Coffee &amp; Eatery</p>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-[#FF0000] px-3 sm:px-3.5 py-1 text-[10px] sm:text-[11px] font-heading font-black tracking-widest text-white uppercase shadow-md">
                      🔥 SOROTAN UTAMA
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                    {(() => {
                      const badge = getEventStatusBadge(featuredEvent.start_date, featuredEvent.end_date);
                      return (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.badgeClass}`}>
                          <span className={`h-2 w-2 rounded-full ${badge.dotClass}`} />
                          {badge.label}
                        </span>
                      );
                    })()}
                    <span className="rounded-full bg-[#F5E8BA] px-3 py-1 text-xs font-heading font-bold text-[#141414]">
                      Acara Komunitas &amp; Kafe
                    </span>
                  </div>

                  <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#141414] leading-tight">
                    {cleanText(featuredEvent.title)}
                  </h2>

                  {/* Informative Schedule Badges */}
                  <div className="mt-3.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-[#FFF5CF]/60 border border-[#141414]/10 p-3">
                      <span className="text-xl">📅</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C584E]">
                          Waktu Pelaksanaan
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-[#141414]">
                          {formatEventDate(featuredEvent.start_date, featuredEvent.end_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-[#FFF5CF]/60 border border-[#141414]/10 p-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C584E]">
                          Lokasi Acara
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-[#141414]">
                          Side Line Coffee &amp; Eatery
                        </p>
                      </div>
                    </div>
                  </div>

                  {featuredEvent.description && (
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-[#5C584E] line-clamp-3">
                      {cleanText(featuredEvent.description)}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                    <a
                      href={eventLink(featuredEvent.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF0000] px-5 sm:px-6 py-3 text-xs sm:text-sm font-heading font-black uppercase tracking-wider text-white hover:bg-[#D60000] active:scale-[0.98] transition-all shadow-md"
                    >
                      <span>Daftar / Reservasi WhatsApp</span>
                      <span>→</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveModalItem(featuredEvent)}
                      className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#141414]/20 bg-white px-5 py-3 text-xs sm:text-sm font-heading font-bold text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition-colors cursor-pointer"
                    >
                      <span>Lihat Detail Lengkap</span>
                      <span>🔍</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. AGENDA TERDEKAT (EVENTS & WORKSHOP)
      ────────────────────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "events") && (
        <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-12 sm:pt-16 md:pt-20">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#141414]/15 pb-4 mb-6 sm:mb-8">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FF0000]">
                  JADWAL KEGIATAN
                </span>
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-black uppercase tracking-tight text-[#141414] mt-1">
                  Agenda Acara &amp; Workshop
                </h2>
              </div>
              <p className="mt-2 sm:mt-0 text-xs sm:text-sm text-[#5C584E]">
                {events.length} acara terdaftar
              </p>
            </div>

            {loading ? (
              <div className="py-16 sm:py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#FF0000]" />
                <p className="mt-3 text-xs sm:text-sm text-[#5C584E]">Memuat agenda acara...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#141414]/10 p-8 sm:p-12 text-center shadow-xs">
                <span className="text-4xl sm:text-5xl">☕</span>
                <h3 className="mt-4 font-heading text-base sm:text-lg font-bold text-[#141414]">
                  Belum Ada Jadwal Acara Baru
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#5C584E] max-w-md mx-auto">
                  Kami sedang menyiapkan agenda menarik berikutnya. Pantau media sosial kami atau tanyakan langsung ke barista kami!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
                {events.map((item) => {
                  const title = cleanText(item.title);
                  const dateText = formatEventDate(item.start_date, item.end_date);
                  const badge = getEventStatusBadge(item.start_date, item.end_date);

                  return (
                    <article
                      key={item.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#141414]/15 bg-white shadow-xs hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        {/* Poster Header */}
                        <div
                          className="aspect-[16/10] w-full overflow-hidden bg-zinc-900 relative cursor-pointer"
                          onClick={() => setActiveModalItem(item)}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#141414] to-[#3a3a3a] text-3xl sm:text-4xl text-white">
                              🎉
                            </div>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] shadow-sm ${badge.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.label}
                          </span>
                        </div>

                        {/* Event Content */}
                        <div className="p-4 sm:p-5 lg:p-6">
                          {/* Tanggal & Tempat */}
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#FF0000] mb-2">
                            <span>📅</span>
                            <span className="truncate">{dateText}</span>
                          </div>

                          <h3
                            className="font-heading text-lg sm:text-xl font-black uppercase tracking-tight text-[#141414] group-hover:text-[#FF0000] transition-colors cursor-pointer line-clamp-2"
                            onClick={() => setActiveModalItem(item)}
                          >
                            {title}
                          </h3>

                          {item.description && (
                            <p className="mt-2 text-xs sm:text-sm text-[#5C584E] leading-relaxed line-clamp-3">
                              {cleanText(item.description)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-4 sm:p-5 lg:p-6 pb-4 sm:pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveModalItem(item)}
                          className="text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:text-[#FF0000] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Detail ↗
                        </button>

                        <a
                          href={eventLink(title)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF0000] px-3 sm:px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#D60000] transition shadow-xs whitespace-nowrap"
                        >
                          <span>Daftar</span>
                          <span>→</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          4. LIVE MUSIC MINGGUAN (PANGGUNG AKUSTIK & JAZZ)
      ────────────────────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "music") && (
        <section className="mt-14 sm:mt-16 md:mt-24 bg-[#141414] text-[#FFF5CF] px-4 sm:px-6 lg:px-12 2xl:px-16 py-12 sm:py-16 md:py-20 relative overflow-hidden">
          {/* Subtle Ambient Red Glow */}
          <div
            className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#FF0000]/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl 2xl:max-w-[1600px]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#FFF5CF]/15 pb-4 mb-6 sm:mb-8">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FF0000]">
                  PANGGUNG AKUSTIK // RUTIN
                </span>
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-black uppercase tracking-tight text-white mt-1">
                  Live Music Cafe
                </h2>
              </div>
              <p className="mt-2 sm:mt-0 text-xs sm:text-sm text-[#FFF5CF]/70">
                Gratis untuk semua pengunjung. Meja terbatas di dekat panggung!
              </p>
            </div>

            {liveMusics.length === 0 ? (
              <div className="rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 text-center">
                <span className="text-4xl sm:text-5xl">🎸</span>
                <h3 className="mt-4 font-heading text-base sm:text-lg font-bold text-white">
                  Jadwal Live Music Segera Hadir
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/60 max-w-md mx-auto">
                  Penampilan musisi lokal favorit segera diumumkan. Kunjungi kami di akhir pekan untuk menikmati suasananya.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                {liveMusics.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#1c1d22] p-4 sm:p-6 gap-4 sm:gap-6 shadow-xl hover:border-[#FF0000]/50 transition-all duration-300"
                  >
                    {/* Visual Poster */}
                    <div className="w-full sm:w-44 h-44 sm:h-auto shrink-0 overflow-hidden rounded-xl bg-zinc-900 relative">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={cleanText(item.title)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full min-h-[140px] flex-col items-center justify-center bg-zinc-800 text-3xl text-white/40">
                          🎸
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 rounded-md bg-[#FF0000] px-2 py-0.5 text-[10px] font-heading font-black uppercase text-white shadow-md">
                        LIVE
                      </span>
                    </div>

                    {/* Information */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Jadwal Hari & Jam */}
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF0000]/15 border border-[#FF0000]/30 px-2.5 py-1 text-xs font-heading font-black uppercase tracking-wider text-[#FF0000]">
                          <span>⏰</span>
                          <span>{cleanText(item.day_time) || "Jadwal Menyusul"}</span>
                        </div>

                        <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white mt-2.5">
                          {cleanText(item.title)}
                        </h3>

                        {item.performer && (
                          <p className="mt-1 text-xs sm:text-sm font-semibold text-white/90 flex items-center gap-1.5">
                            <span>🎤</span>
                            <span>Bersama {cleanText(item.performer)}</span>
                          </p>
                        )}

                        {item.description && (
                          <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2">
                            {cleanText(item.description)}
                          </p>
                        )}

                        {/* Perks */}
                        <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2 text-[11px] text-white/60">
                          <span className="rounded bg-white/5 px-2 py-0.5 border border-white/10">
                            🆓 Tanpa Tiket Masuk
                          </span>
                          <span className="rounded bg-white/5 px-2 py-0.5 border border-white/10">
                            ☕ Order Sambil Nonton
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                        <a
                          href={musicLink(cleanText(item.title), cleanText(item.day_time))}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FF0000] px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#D60000] transition shadow-xs"
                        >
                          <span>Reservasi Meja Musik</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          5. SEWA RUANG PRIVAT & GATHERING
      ────────────────────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "spaces") && (
        <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-14 sm:pt-16 md:pt-24">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#141414]/15 pb-4 mb-6 sm:mb-8">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FF0000]">
                  RESERVASI &amp; SEWA RUANG
                </span>
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-black uppercase tracking-tight text-[#141414] mt-1">
                  Paket Ruang Acara &amp; Meeting
                </h2>
              </div>
              <p className="mt-2 sm:mt-0 text-xs sm:text-sm text-[#5C584E]">
                Cocok untuk rapat kantor, workshop, arisan, maupun pesta ulang tahun.
              </p>
            </div>

            {spaces.length === 0 ? (
              <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#141414]/10 p-8 sm:p-12 text-center shadow-xs">
                <span className="text-4xl sm:text-5xl">🏛️</span>
                <h3 className="mt-4 font-heading text-base sm:text-lg font-bold text-[#141414]">
                  Paket Ruangan Sedang Diperbarui
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#5C584E] max-w-md mx-auto">
                  Silakan hubungi WhatsApp kami untuk informasi sewa ruangan secara langsung.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {spaces.map((space) => {
                  const name = cleanText(space.name);
                  const facilities = splitList(space.facilities);

                  return (
                    <article
                      key={space.id}
                      className="group flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#141414]/15 bg-white p-5 sm:p-7 md:p-8 shadow-xs hover:shadow-xl transition-all duration-300"
                    >
                      <div>
                        {/* Space Image (jika ada) */}
                        {space.image_url && (
                          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900 mb-5 sm:mb-6">
                            <img
                              src={space.image_url}
                              alt={name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {space.capacity && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#141414] text-[#FFF5CF] px-3 py-1 text-[11px] sm:text-xs font-bold">
                              <span>👥</span>
                              <span>Kapasitas {cleanText(space.capacity)}</span>
                            </span>
                          )}
                          {space.price_info && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-[#FF0000] border border-red-200 px-3 py-1 text-[11px] sm:text-xs font-heading font-black">
                              <span>💰</span>
                              <span>{cleanText(space.price_info)}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-[#141414] mt-2">
                          {name}
                        </h3>

                        {space.description && (
                          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                            {cleanText(space.description)}
                          </p>
                        )}

                        {/* Fasilitas */}
                        {facilities.length > 0 && (
                          <div className="mt-4 sm:mt-5">
                            <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#141414] mb-2">
                              Fasilitas Termasuk:
                            </p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {facilities.map((fac) => (
                                <span
                                  key={fac}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#F5E8BA]/80 border border-[#141414]/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-[#141414]"
                                >
                                  <span>✓</span>
                                  <span>{fac}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA Booking */}
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <a
                          href={bookingLink(space.contact_phone, name)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-xl bg-[#141414] px-5 py-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-[#FFF5CF] hover:bg-[#FF0000] hover:text-white transition-all shadow-sm"
                        >
                          <span>Tanya Jadwal &amp; Booking</span>
                          <span>→</span>
                        </a>

                        {space.contact_phone && (
                          <span className="text-xs font-semibold text-[#5C584E] text-center sm:text-right">
                            📞 {space.contact_phone}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          6. STEP PANDUAN MENGIKUTI EVENT (JELAS & TIDAK BIKIN BINGUNG)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-14 sm:pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] rounded-2xl sm:rounded-3xl bg-[#F5E8BA]/60 border border-[#141414]/15 p-5 sm:p-8 md:p-10">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#FF0000]">
              PANDUAN MUDAH
            </span>
            <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#141414] mt-1">
              Cara Ikut Acara di Side Line
            </h3>
            <p className="text-xs sm:text-sm text-[#5C584E] mt-1 sm:mt-2">
              Proses registrasi dan reservasi yang praktis tanpa ribet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-xl sm:rounded-2xl bg-white p-5 sm:p-6 border border-[#141414]/10 shadow-xs">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#141414] font-heading font-black text-xs sm:text-sm text-[#FFF5CF] mb-3 sm:mb-4">
                01
              </span>
              <h4 className="font-heading font-bold text-sm sm:text-base uppercase text-[#141414]">
                Pilih Acara Favorit
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                Pilih agenda kegiatan, jadwal live music, atau tipe ruangan yang sesuai dengan kebutuhan Anda.
              </p>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-white p-5 sm:p-6 border border-[#141414]/10 shadow-xs">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#FF0000] font-heading font-black text-xs sm:text-sm text-white mb-3 sm:mb-4">
                02
              </span>
              <h4 className="font-heading font-bold text-sm sm:text-base uppercase text-[#141414]">
                Konfirmasi WhatsApp
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                Klik tombol WhatsApp untuk pendaftaran atau reservasi meja/ruang dengan format pesan otomatis.
              </p>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-white p-5 sm:p-6 border border-[#141414]/10 shadow-xs">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#141414] font-heading font-black text-xs sm:text-sm text-[#FFF5CF] mb-3 sm:mb-4">
                03
              </span>
              <h4 className="font-heading font-bold text-sm sm:text-base uppercase text-[#141414]">
                Datang &amp; Nikmati
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                Tiba di kafe Side Line sesuai jadwal, pesan minuman andalanmu, dan nikmati momen berharganya!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. MODAL DETAIL ACARA (FULL INFORMATION POPUP)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 md:p-6 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white border border-[#141414]/15 p-5 sm:p-7 md:p-8 shadow-2xl my-auto text-[#141414]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalItem(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer text-sm font-bold"
            >
              ✕
            </button>

            {/* Poster jika ada */}
            {activeModalItem.image_url && (
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-zinc-900 mb-4 sm:mb-6">
                <img
                  src={activeModalItem.image_url}
                  alt={cleanText(activeModalItem.title)}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
                {(() => {
                  const badge = getEventStatusBadge(activeModalItem.start_date, activeModalItem.end_date);
                  return (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold ${badge.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${badge.dotClass}`} />
                      {badge.label}
                    </span>
                  );
                })()}
                <span className="rounded-full bg-[#141414] text-[#FFF5CF] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold">
                  Side Line Event
                </span>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#141414] leading-tight">
                {cleanText(activeModalItem.title)}
              </h3>

              {/* Detail Info Grid */}
              <div className="mt-3.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-[#FFF5CF] p-3 border border-[#141414]/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C584E]">
                    Jadwal Tanggal
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#141414] mt-0.5">
                    {formatEventDate(activeModalItem.start_date, activeModalItem.end_date)}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFF5CF] p-3 border border-[#141414]/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C584E]">
                    Lokasi
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#141414] mt-0.5">
                    Side Line Coffee &amp; Eatery
                  </p>
                </div>
              </div>

              {/* Full Description */}
              <div className="mt-5 sm:mt-6 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#141414] mb-2">
                  Deskripsi &amp; Informasi Lengkap:
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed text-[#5C584E] whitespace-pre-line">
                  {cleanText(activeModalItem.description) ||
                    "Tidak ada deskripsi tambahan untuk acara ini. Silakan tanyakan langsung kepada admin kami via WhatsApp."}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="w-full sm:w-auto text-center rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Tutup
                </button>

                <a
                  href={eventLink(cleanText(activeModalItem.title))}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF0000] px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#D60000] transition shadow-md"
                >
                  <span>Daftar via WhatsApp</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
