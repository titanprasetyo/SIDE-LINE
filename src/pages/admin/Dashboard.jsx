import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    menuCount: 0,
    categoryCount: 0,
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
        ] = await Promise.all([
          supabase.from("menus").select("*", { count: "exact", head: true }),
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("galleries").select("*", { count: "exact", head: true }),
          supabase.from("promos").select("*", { count: "exact", head: true }),
          supabase.from("live_music_schedules").select("*", { count: "exact", head: true }),
          supabase.from("space_bookings").select("*", { count: "exact", head: true }),
          supabase.from("teams").select("*", { count: "exact", head: true }),
          supabase.from("facilities").select("*", { count: "exact", head: true }),
        ]);

        if (!ignore) {
          setStats({
            menuCount: menuCount || 0,
            categoryCount: categoryCount || 0,
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
      title: "Menu Café",
      count: stats.menuCount,
      icon: "☕",
      path: "/admin/menu",
      desc: "Menu aktif & harga",
    },
    {
      title: "Kategori Menu",
      count: stats.categoryCount,
      icon: "🏷️",
      path: "/admin/categories",
      desc: "Kategori pengelompokan",
    },
    {
      title: "Foto Galeri",
      count: stats.galleryCount,
      icon: "🖼️",
      path: "/admin/gallery",
      desc: "Foto suasana & area café",
    },
    {
      title: "Promo & Event",
      count: stats.promoCount,
      icon: "🎉",
      path: "/admin/promo",
      desc: "Penawaran & diskon aktif",
    },
    {
      title: "Jadwal Live Music",
      count: stats.liveMusicCount,
      icon: "🎵",
      path: "/admin/live-music",
      desc: "Musisi & jam manggung",
    },
    {
      title: "Paket Sewa Tempat",
      count: stats.spaceCount,
      icon: "🏢",
      path: "/admin/space-booking",
      desc: "Ruang meeting & gathering",
    },
    {
      title: "Tim & Owner",
      count: stats.teamCount,
      icon: "👥",
      path: "/admin/team",
      desc: "Profil barista & staf",
    },
    {
      title: "Fasilitas Café",
      count: stats.facilityCount,
      icon: "✨",
      path: "/admin/facilities",
      desc: "Toilet, game, Wi-Fi, dll",
    },
  ];

  return (
    <div>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan pengelolaan seluruh konten dan fitur website SIDE LINE
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.path}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-600 transition">
                Kelola ↗
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {card.title}
            </p>

            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : card.count}
              </p>
            </div>

            <p className="mt-1 text-[11px] text-slate-400">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Aksi Cepat Kelola Konten</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Jalan pintas untuk memperbarui konten utama café Anda
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/admin/menu"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>☕</span>
            <span>+ Tambah Menu</span>
          </Link>

          <Link
            to="/admin/live-music"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>🎵</span>
            <span>+ Jadwal Musik</span>
          </Link>

          <Link
            to="/admin/space-booking"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>🏢</span>
            <span>+ Ruang Booking</span>
          </Link>

          <Link
            to="/admin/team"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>👥</span>
            <span>+ Profil Tim</span>
          </Link>

          <Link
            to="/admin/facilities"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>✨</span>
            <span>+ Fasilitas Café</span>
          </Link>

          <Link
            to="/admin/gallery"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>📸</span>
            <span>+ Upload Foto</span>
          </Link>

          <Link
            to="/admin/promo"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>🎉</span>
            <span>+ Buat Promo</span>
          </Link>

          <Link
            to="/admin/settings"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-amber-400 transition"
          >
            <span>⚙️</span>
            <span>Edit Info Café</span>
          </Link>
        </div>
      </div>
    </div>
  );
}