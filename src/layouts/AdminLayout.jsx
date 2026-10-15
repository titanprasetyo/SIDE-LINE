import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Menu,
  ExternalLink,
  ShieldCheck,
  Search,
  Bell,
  Sparkles,
  Command,
} from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import { useAuth } from "../hooks/useAuth";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard Overview",
  "/admin/menu": "Menu & Katalog Sajian",
  "/admin/categories": "Kategori Menu",
  "/admin/home-hero": "Konten Beranda & Story",
  "/admin/gallery": "Galeri Visual & Suasana",
  "/admin/events": "Agenda & Acara Cafe",
  "/admin/live-music": "Jadwal Live Music",
  "/admin/space-booking": "Paket Sewa Ruang",
  "/admin/team": "Profil Tim & Owner",
  "/admin/reviews": "Ulasan & Testimoni Pelanggan",
  "/admin/facilities": "Fasilitas Cafe",
  "/admin/settings": "Pengaturan Informasi Cafe",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const currentTitle = PAGE_TITLES[location.pathname] || "Admin Console";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased selection:bg-[#FF0000] selection:text-white">
      {/* ── Mobile Top Header (lg:hidden) ── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#0B0F17] px-4 py-3 border-b border-white/[0.08] text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.1] active:scale-95 transition cursor-pointer"
            aria-label="Buka menu admin"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF0000] ring-2 ring-[#FF0000]/30" />
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                SIDE LINE
              </h1>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide">
              {currentTitle}
            </p>
          </div>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] transition"
        >
          <span>Live Site</span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
        </Link>
      </header>

      {/* ── Backdrop overlay on mobile ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Component ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main Viewport Area (Offset lg:ml-64) ── */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Desktop SaaS Top Header Bar (Hidden on Mobile) */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-8 items-center justify-between">
          {/* Left: Breadcrumbs & Page Identity */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400">Portal</span>
            <span className="text-zinc-300 text-xs">/</span>
            <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200/60">
              {currentTitle}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2.5 py-0.5 ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Online • Database Sync</span>
            </div>
          </div>

          {/* Right: Quick Actions & Profile Status */}
          <div className="flex items-center gap-3.5">
            {/* Quick Visit Site Button */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-1.5 shadow-2xs hover:border-zinc-300 transition"
              title="Buka website publik SIDE LINE di tab baru"
            >
              <span>Preview Live Site</span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </Link>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-zinc-800">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[140px]">
                  {user?.email || "Admin User"}
                </p>
                <p className="text-[10px] text-zinc-500 font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}