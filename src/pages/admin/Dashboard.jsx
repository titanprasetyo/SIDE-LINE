import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  Tag,
  Layers,
  Image,
  Calendar,
  Music2,
  Building2,
  Users2,
  Sparkles,
  ArrowUpRight,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Settings,
  Flame,
} from "lucide-react";
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

  const cards = [
    {
      title: "Menu Cafe",
      count: stats.menuCount,
      icon: Coffee,
      path: "/admin/menu",
      desc: "Katalog sajian & harga promo",
      tag: "Catalog",
      iconBg: "bg-amber-50 text-amber-700 border-amber-200/60",
    },
    {
      title: "Kategori Menu",
      count: stats.categoryCount,
      icon: Tag,
      path: "/admin/categories",
      desc: "Pengelompokan menu sajian",
      tag: "Structure",
      iconBg: "bg-blue-50 text-blue-700 border-blue-200/60",
    },
    {
      title: "Konten Beranda",
      count: stats.heroCount,
      icon: Layers,
      path: "/admin/home-hero",
      desc: "Banner Hero & Cerita Visual",
      tag: "Hero & About",
      iconBg: "bg-purple-50 text-purple-700 border-purple-200/60",
    },
    {
      title: "Foto Galeri",
      count: stats.galleryCount,
      icon: Image,
      path: "/admin/gallery",
      desc: "Arsip visual suasana cafe",
      tag: "Media",
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    },
    {
      title: "Agenda Event",
      count: stats.promoCount,
      icon: Calendar,
      path: "/admin/events",
      desc: "Workshop, promo & festival",
      tag: "Activities",
      iconBg: "bg-rose-50 text-rose-700 border-rose-200/60",
    },
    {
      title: "Live Music",
      count: stats.liveMusicCount,
      icon: Music2,
      path: "/admin/live-music",
      desc: "Jadwal band & panggung rutin",
      tag: "Music",
      iconBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    },
    {
      title: "Sewa Tempat",
      count: stats.spaceCount,
      icon: Building2,
      path: "/admin/space-booking",
      desc: "Paket ruang meeting & pesta",
      tag: "Spaces",
      iconBg: "bg-teal-50 text-teal-700 border-teal-200/60",
    },
    {
      title: "Profil Tim",
      count: stats.teamCount,
      icon: Users2,
      path: "/admin/team",
      desc: "Barista, owner & kurator",
      tag: "Crew",
      iconBg: "bg-zinc-100 text-zinc-800 border-zinc-200/80",
    },
  ];

  const quickActions = [
    { label: "Tambah Menu Baru", path: "/admin/menu", icon: Coffee },
    { label: "Jadwal Live Music", path: "/admin/live-music", icon: Music2 },
    { label: "Buat Agenda Event", path: "/admin/events", icon: Calendar },
    { label: "Upload Foto Galeri", path: "/admin/gallery", icon: Image },
    { label: "Tambah Sewa Ruang", path: "/admin/space-booking", icon: Building2 },
    { label: "Profil Anggota Tim", path: "/admin/team", icon: Users2 },
    { label: "Atur Fasilitas Cafe", path: "/admin/facilities", icon: Sparkles },
    { label: "Info Jam & Kontak", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Top SaaS Welcome Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B0F17] text-white p-6 sm:p-8 border border-white/[0.08] shadow-lg">
        {/* Subtle Ambient Red Glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-12 h-64 w-64 rounded-full bg-[#FF0000]/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-300 border border-white/[0.08]">
                Console Overview
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Live Database Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              SIDE LINE Management Suite
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Pusat kendali data operasional cafe: kelola katalog menu, promo berkala, agenda live music, ruang meeting, dan arsip visual secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/admin/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF0000] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D60000] active:scale-[0.98] transition shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Sajian Menu Baru</span>
            </Link>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white transition cursor-pointer"
            >
              <span>Website Publik</span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
              Statistik Konten Cafe
            </h2>
            <p className="text-xs text-zinc-500">Jumlah data yang tersinkronisasi di website</p>
          </div>
          <span className="text-xs font-medium text-zinc-500">
            {cards.length} Modul Terintegrasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:border-zinc-300 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconBg}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-900 transition">
                      <span className="text-[10px] font-medium tracking-wide uppercase">{card.tag}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {card.title}
                  </p>

                  <div className="mt-1 flex items-baseline">
                    <p className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
                      {loading ? (
                        <span className="inline-block h-6 w-8 animate-pulse rounded bg-zinc-200" />
                      ) : (
                        card.count
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 truncate">
                  {card.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions Grid & Checklist ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Quick Actions Shortcuts */}
        <div className="lg:col-span-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Aksi Cepat Kelola Konten
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pintasan instan untuk memperbarui data operasional harian
              </p>
            </div>
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-600">
              Shortcuts
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={qa.label}
                  to={qa.path}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 p-3 text-xs font-semibold text-zinc-700 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-2xs transition group"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-700 group-hover:text-[#FF0000] group-hover:border-[#FF0000]/30 transition">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <span className="truncate">{qa.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System & Operations Checklist */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Status Operasional
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Integrasi fitur website</p>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600 font-medium">Supabase Database</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600 font-medium">Reservasi WhatsApp</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Active Link
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600 font-medium">Promo & Diskon</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                <Clock className="h-3 w-3" /> Realtime Calc
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-600 font-medium">Mode Responsif</span>
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-800 bg-zinc-200/60 px-2 py-0.5 rounded text-[11px]">
                sm - 2xl Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}