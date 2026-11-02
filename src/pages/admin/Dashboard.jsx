import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  Tag,
  Browsers,
  Images,
  CalendarStar,
  MusicNotes,
  Storefront,
  UsersThree,
  Sparkle,
  ArrowUpRight,
  Plus,
  ArrowSquareOut,
  CheckCircle,
  Clock,
  SlidersHorizontal,
  ChatCenteredDots,
} from "@phosphor-icons/react";
import { supabase } from "../../services/supabase";
import { homeBannerService } from "../../services/homeBannerService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    menuCount: 0,
    categoryCount: 0,
    heroCount: 0,
    galleryCount: 0,
    promoCount: 0,
    liveMusicCount: 0,
    spaceCount: 0,
    teamCount: 0,
    facilityCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchStats = async () => {
      try {
        const [
          { count: menuCount },
          { count: categoryCount },
          { count: galleryCount },
          { count: promoCount },
          { count: liveMusicCount },
          { count: spaceCount },
          { count: teamCount },
          { count: facilityCount },
          heroBannersList,
        ] = await Promise.all([
          supabase.from("menus").select("*", { count: "exact", head: true }),
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("galleries").select("*", { count: "exact", head: true }),
          supabase.from("promos").select("*", { count: "exact", head: true }),
          supabase.from("live_music_schedules").select("*", { count: "exact", head: true }),
          supabase.from("space_bookings").select("*", { count: "exact", head: true }),
          supabase.from("teams").select("*", { count: "exact", head: true }),
          supabase.from("facilities").select("*", { count: "exact", head: true }),
          homeBannerService.getAll(),
        ]);

        if (!ignore) {
          setStats({
            menuCount: menuCount || 0,
            categoryCount: categoryCount || 0,
            heroCount: Array.isArray(heroBannersList) ? heroBannersList.length : 0,
            galleryCount: galleryCount || 0,
            promoCount: promoCount || 0,
            liveMusicCount: liveMusicCount || 0,
            spaceCount: spaceCount || 0,
            teamCount: teamCount || 0,
            facilityCount: facilityCount || 0,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
        if (!ignore) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      ignore = true;
    };
  }, []);

  const totalRecords =
    stats.menuCount +
    stats.categoryCount +
    stats.heroCount +
    stats.galleryCount +
    stats.promoCount +
    stats.liveMusicCount +
    stats.spaceCount +
    stats.teamCount;

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cards = [
    {
      title: "Menu Cafe",
      count: stats.menuCount,
      unit: "sajian terdaftar",
      icon: Coffee,
      path: "/admin/menu",
      desc: "Katalog kopi, minuman, makanan & harga promo",
      badge: "Katalog Utama",
      accent: true,
    },
    {
      title: "Kategori Menu",
      count: stats.categoryCount,
      unit: "kelompok menu",
      icon: Tag,
      path: "/admin/categories",
      desc: "Pengelompokan jenis minuman dan kudapan",
      badge: "Struktur",
    },
    {
      title: "Konten Beranda",
      count: stats.heroCount,
      unit: "konten aktif",
      icon: Browsers,
      path: "/admin/home-hero",
      desc: "Foto hero utama dan narasi cerita Side Line",
      badge: "Halaman Depan",
    },
    {
      title: "Galeri Visual",
      count: stats.galleryCount,
      unit: "foto & video",
      icon: Images,
      path: "/admin/gallery",
      desc: "Dokumentasi suasana ruang dan sudut cafe",
      badge: "Media",
    },
    {
      title: "Event & Promo",
      count: stats.promoCount,
      unit: "agenda acara",
      icon: CalendarStar,
      path: "/admin/events",
      desc: "Workshop kopi, kolaborasi, dan acara komunitas",
      badge: "Agenda",
    },
    {
      title: "Jadwal Live Music",
      count: stats.liveMusicCount,
      unit: "jadwal tampil",
      icon: MusicNotes,
      path: "/admin/live-music",
      desc: "Daftar musisi akustik dan penampilan mingguan",
      badge: "Hiburan",
    },
    {
      title: "Sewa Tempat",
      count: stats.spaceCount,
      unit: "paket ruang",
      icon: Storefront,
      path: "/admin/space-booking",
      desc: "Paket reservasi ruang rapat, komunitas & acara",
      badge: "Reservasi",
    },
    {
      title: "Tim & Barista",
      count: stats.teamCount,
      unit: "anggota tim",
      icon: UsersThree,
      path: "/admin/team",
      desc: "Profil peracik kopi, founder, dan kru operasional",
      badge: "Internal",
    },
  ];

  const quickActions = [
    { label: "Kelola Menu & Promo", path: "/admin/menu", icon: Coffee },
    { label: "Atur Jadwal Live Music", path: "/admin/live-music", icon: MusicNotes },
    { label: "Tambah Agenda Event", path: "/admin/events", icon: CalendarStar },
    { label: "Unggah Foto Galeri", path: "/admin/gallery", icon: Images },
    { label: "Paket Sewa Ruang", path: "/admin/space-booking", icon: Storefront },
    { label: "Moderasi Ulasan Tamu", path: "/admin/reviews", icon: ChatCenteredDots },
    { label: "Fasilitas Ruang Cafe", path: "/admin/facilities", icon: Sparkle },
    { label: "Jam Buka & Kontak", path: "/admin/settings", icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-7">
      {/* ── Informative Operational Header ── */}
      <section className="rounded-2xl border border-[#E6DFD5] bg-white p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5 text-[13.5px] text-[#575049]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EFE6] px-3 py-1 font-medium text-[#575049] border border-[#E6DFD5]">
                <Coffee className="h-3.5 w-3.5 text-[#C8100A]" weight="duotone" />
                <span>Ringkasan Operasional Cafe</span>
              </span>
              <span>•</span>
              <span>{todayFormatted}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
              Selamat datang di Panel Pengelola Side Line
            </h1>

            <p className="text-sm text-[#6B635B] leading-relaxed">
              Pantau dan perbarui katalog menu, harga promo, jadwal panggung akustik, serta informasi reservasi ruang dalam satu tempat. Saat ini terdapat{" "}
              <strong className="font-semibold text-[#1C1917]">
                {loading ? "..." : totalRecords} item konten
              </strong>{" "}
              yang tampil di halaman pelanggan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C8100A] px-4 py-2.5 text-[13.5px] sm:text-sm font-semibold text-white hover:bg-[#A80D08] transition shadow-2xs"
            >
              <Plus className="h-4 w-4" weight="bold" />
              <span>Tambah Sajian Menu</span>
            </Link>

            <Link
              to="/admin/events"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F5EFE6] hover:bg-[#EBE2D5] border border-[#E2D9CC] px-4 py-2.5 text-[13.5px] sm:text-sm font-medium text-[#292524] transition"
            >
              <CalendarStar className="h-4 w-4 text-[#7C4D34]" weight="duotone" />
              <span>Kelola Event</span>
            </Link>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E2D9CC] px-3.5 py-2.5 text-[13.5px] sm:text-sm font-medium text-[#575049] transition"
            >
              <span>Web Pelanggan</span>
              <ArrowSquareOut className="h-4 w-4 text-[#6B635B]" weight="duotone" />
            </Link>
          </div>
        </div>

        {/* Summary Strip inside Hero */}
        <div className="mt-6 pt-5 border-t border-[#EFE9E0] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCECEB] text-[#C8100A]">
              <Coffee className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="text-[13.5px] text-[#575049]">Katalog Sajian</p>
              <p className="text-sm font-semibold text-[#1C1917]">
                {loading ? "—" : `${stats.menuCount} Menu & ${stats.categoryCount} Kategori`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#7C4D34]">
              <CalendarStar className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="text-[13.5px] text-[#575049]">Agenda &amp; Hiburan</p>
              <p className="text-sm font-semibold text-[#1C1917]">
                {loading ? "—" : `${stats.promoCount} Event • ${stats.liveMusicCount} Live Music`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#7C4D34]">
              <Storefront className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="text-[13.5px] text-[#575049]">Ruang &amp; Fasilitas</p>
              <p className="text-sm font-semibold text-[#1C1917]">
                {loading ? "—" : `${stats.spaceCount} Paket • ${stats.facilityCount} Fasilitas`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF5EF] text-emerald-800">
              <CheckCircle className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="text-[13.5px] text-[#575049]">Koneksi Database</p>
              <p className="text-sm font-semibold text-emerald-900">Tersinkronisasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prominent Module Statistics Grid ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1917]">
              Statistik Modul Konten
            </h2>
            <p className="text-[13.5px] sm:text-sm text-[#575049]">
              Klik pada kartu modul untuk melihat detail dan memperbarui data
            </p>
          </div>
          <span className="text-[13.5px] font-medium text-[#575049] bg-[#F3EDE2] px-3 py-1 rounded-full border border-[#E6DFD5] w-fit">
            {cards.length} modul operasional
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E6DFD5] bg-white p-5 shadow-2xs hover:border-[#C8100A]/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                        card.accent
                          ? "bg-[#FCECEB] text-[#C8100A] border-[#F6D5D2]"
                          : "bg-[#F5EFE6] text-[#6E4730] border-[#E8DFD2] group-hover:bg-[#FCECEB] group-hover:text-[#C8100A] group-hover:border-[#F6D5D2]"
                      }`}
                    >
                      <Icon className="h-5 w-5" weight="duotone" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF7F2] px-2.5 py-1 text-[12.5px] font-medium text-[#575049] border border-[#ECE5DA] group-hover:text-[#C8100A] group-hover:border-[#F6D5D2] transition">
                      <span>{card.badge}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
                    </span>
                  </div>

                  {/* Prominent Statistic Number */}
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-semibold text-[#1C1917] tracking-tight">
                      {loading ? (
                        <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-[#EFE9E0]" />
                      ) : (
                        card.count
                      )}
                    </span>
                    <span className="text-[13.5px] text-[#6B635B] font-normal">
                      {card.unit}
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-sm font-semibold text-[#292524] group-hover:text-[#C8100A] transition-colors">
                    {card.title}
                  </h3>
                </div>

                <p className="mt-3 pt-3 border-t border-[#F2ECE1] text-[13.5px] text-[#575049] line-clamp-1">
                  {card.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Quick Actions & System Status ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Quick Actions */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E6DFD5] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1]">
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                Pintasan Pengelolaan Harian
              </h2>
              <p className="text-[13.5px] text-[#575049] mt-0.5">
                Akses langsung ke halaman manajemen yang paling sering digunakan
              </p>
            </div>
            <span className="rounded-lg bg-[#F5EFE6] px-2.5 py-1 text-[13.5px] font-medium text-[#6E4730] border border-[#E8DFD2]">
              Akses Cepat
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={qa.label}
                  to={qa.path}
                  className="flex items-center gap-3 rounded-xl border border-[#EAE2D6] p-3 text-[13.5px] font-medium text-[#292524] bg-[#FAF7F2]/70 hover:bg-white hover:border-[#C8100A]/40 hover:shadow-2xs transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3EDE2] text-[#6E4730] group-hover:bg-[#FCECEB] group-hover:text-[#C8100A] transition">
                    <Icon className="h-4 w-4" weight="duotone" />
                  </div>
                  <span className="leading-snug">{qa.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-4 rounded-2xl border border-[#E6DFD5] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1]">
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                Status Layanan
              </h2>
              <p className="text-[13.5px] text-[#575049] mt-0.5">
                Kesiapan sistem dan integrasi publik
              </p>
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between text-[13.5px] p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE5DA]">
              <span className="text-[#575049] font-medium">Database Supabase</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-[#EBF5EE] px-2.5 py-0.5 rounded-full text-[12.5px]">
                <CheckCircle className="h-3.5 w-3.5" weight="fill" /> Terhubung
              </span>
            </div>

            <div className="flex items-center justify-between text-[13.5px] p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE5DA]">
              <span className="text-[#575049] font-medium">Integrasi WhatsApp</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-[#EBF5EE] px-2.5 py-0.5 rounded-full text-[12.5px]">
                <CheckCircle className="h-3.5 w-3.5" weight="fill" /> Aktif
              </span>
            </div>

            <div className="flex items-center justify-between text-[13.5px] p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE5DA]">
              <span className="text-[#575049] font-medium">Kalkulasi Diskon Menu</span>
              <span className="inline-flex items-center gap-1 font-medium text-[#7C4D34] bg-[#F5EFE6] px-2.5 py-0.5 rounded-full text-[12.5px]">
                <Clock className="h-3.5 w-3.5" weight="duotone" /> Otomatis
              </span>
            </div>

            <div className="flex items-center justify-between text-[13.5px] p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE5DA]">
              <span className="text-[#575049] font-medium">Tampilan Pelanggan</span>
              <span className="inline-flex items-center gap-1 font-medium text-[#292524] bg-[#EFE9E0] px-2.5 py-0.5 rounded-full text-[12.5px]">
                Responsif (HP &amp; Desktop)
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
