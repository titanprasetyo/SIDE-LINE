import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { List, ArrowSquareOut, CheckCircle, Coffee } from "@phosphor-icons/react";
import Sidebar from "../components/admin/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { reviewService } from "../services/reviewService";

const PAGE_TITLES = {
  "/admin/dashboard": "Ikhtisar Operasional",
  "/admin/menu": "Katalog & Sajian Menu",
  "/admin/categories": "Kategori Menu",
  "/admin/home-hero": "Konten Beranda & Cerita",
  "/admin/gallery": "Galeri Visual & Suasana",
  "/admin/events": "Agenda & Event Cafe",
  "/admin/live-music": "Jadwal Live Music",
  "/admin/space-booking": "Paket Sewa Tempat",
  "/admin/team": "Profil Tim & Barista",
  "/admin/reviews": "Ulasan & Testimoni Pelanggan",
  "/admin/facilities": "Fasilitas Cafe",
  "/admin/settings": "Informasi & Lokasi Cafe",
  "/admin/security": "Keamanan & Ubah Password",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const currentTitle = PAGE_TITLES[location.pathname] || "Panel Manajemen";

  // Sinkronisasi latar belakang ulasan pelanggan ke Supabase DB selama sesi Admin aktif
  useEffect(() => {
    reviewService.getAll().catch(() => {});
    const unsub = reviewService.subscribe(() => {
      reviewService.getAll().catch(() => {});
    });
    return () => unsub();
  }, []);

  return (
    <div className="admin-shell min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col antialiased selection:bg-[#C8100A] selection:text-white">
      {/* ── Mobile Top Header (lg:hidden) ── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#191614] px-4 py-3 border-b border-[#2C2623] text-[#FAF7F2]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#26211E] border border-[#362F2A] text-[#D6CEC2] hover:text-white active:scale-95 transition cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-[#F2645C]" weight="duotone" />
              <span className="text-sm font-semibold text-[#FAF7F2] leading-tight">
                Side Line
              </span>
            </div>
            <p className="text-[12.5px] text-[#9A9086]">{currentTitle}</p>
          </div>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#D6CEC2] bg-[#26211E] hover:bg-[#302A26] hover:text-white px-3 py-1.5 rounded-xl border border-[#362F2A] transition"
        >
          <span>Lihat Web</span>
          <ArrowSquareOut className="h-4 w-4 text-[#9A9086]" weight="duotone" />
        </Link>
      </header>

      {/* ── Backdrop overlay on mobile ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Component ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main Viewport Area (Offset lg:ml-64) ── */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar (Hidden on Mobile) */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E6DFD5] px-8 items-center justify-between">
          {/* Left: Breadcrumbs & Page Identity */}
          <div className="flex items-center gap-2.5 text-sm">
            <span className="text-[#6B635B]">Side Line Admin</span>
            <span className="text-[#C9BFB3]">/</span>
            <span className="font-semibold text-[#1C1917]">{currentTitle}</span>
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[#EFECE6] border border-[#E2DBD0] px-2.5 py-0.5 text-[13.5px] font-medium text-[#4A5D4E]">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-700" weight="fill" />
              <span>Sinkronisasi Aktif</span>
            </span>
          </div>

          {/* Right: Quick Actions & Profile Status */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#292524] bg-white hover:bg-[#F3EDE2] border border-[#E2DBD0] rounded-xl px-3.5 py-2 shadow-2xs transition"
              title="Buka website publik Side Line di tab baru"
            >
              <span>Buka Website Publik</span>
              <ArrowSquareOut className="h-4 w-4 text-[#575049]" weight="duotone" />
            </Link>

            <div className="flex items-center gap-2.5 pl-4 border-l border-[#E6DFD5]">
              <div className="h-8 w-8 rounded-xl bg-[#292524] text-[#FAF7F2] flex items-center justify-center font-semibold text-[13.5px]">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : "SL"}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-[13.5px] font-semibold text-[#1C1917] leading-tight truncate max-w-[160px]">
                  {user?.email || "Admin Side Line"}
                </p>
                <p className="text-[12.5px] text-[#575049]">Pengelola Cafe</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
