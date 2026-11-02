import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Browsers,
  Coffee,
  Tag,
  CalendarStar,
  MusicNotes,
  Storefront,
  Images,
  ChatCenteredDots,
  UsersThree,
  Sparkle,
  SlidersHorizontal,
  Key,
  SignOut,
  ArrowSquareOut,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";

const NAV_SECTIONS = [
  {
    title: "Ikhtisar",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: SquaresFour },
      { name: "Konten Beranda", path: "/admin/home-hero", icon: Browsers },
    ],
  },
  {
    title: "Katalog & Sajian",
    items: [
      { name: "Menu Cafe", path: "/admin/menu", icon: Coffee },
      { name: "Kategori Menu", path: "/admin/categories", icon: Tag },
    ],
  },
  {
    title: "Agenda & Ruang",
    items: [
      { name: "Event & Workshop", path: "/admin/events", icon: CalendarStar },
      { name: "Jadwal Live Music", path: "/admin/live-music", icon: MusicNotes },
      { name: "Sewa Tempat", path: "/admin/space-booking", icon: Storefront },
    ],
  },
  {
    title: "Media & Komunitas",
    items: [
      { name: "Galeri Visual", path: "/admin/gallery", icon: Images },
      { name: "Ulasan Pelanggan", path: "/admin/reviews", icon: ChatCenteredDots },
      { name: "Tim & Barista", path: "/admin/team", icon: UsersThree },
      { name: "Fasilitas Cafe", path: "/admin/facilities", icon: Sparkle },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { name: "Informasi & Lokasi", path: "/admin/settings", icon: SlidersHorizontal },
      { name: "Keamanan Akun", path: "/admin/security", icon: Key },
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#191614] text-[#D6CEC2] border-r border-[#2C2623] transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* ── Brand Identity Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2623]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8100A] text-[#FAF7F2] shadow-xs">
            <Coffee className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-[#FAF7F2] leading-none">
                Side Line
              </span>
              <span className="rounded-md bg-[#2A2420] px-1.5 py-0.5 text-[11px] font-medium text-[#D6CEC2] border border-[#38302B]">
                Roastery &amp; Cafe
              </span>
            </div>
            <p className="mt-1 text-xs font-normal text-[#9A9086]">
              Panel Manajemen Operasional
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-[#26211E] text-[#A89F94] hover:text-[#FAF7F2] hover:bg-[#302A26] transition cursor-pointer"
          aria-label="Tutup menu navigasi"
        >
          <X className="h-4 w-4" weight="bold" />
        </button>
      </div>

      {/* ── Grouped Navigation (Tanpa Scrollbar Visual) ── */}
      <nav className="admin-sidebar-scroll flex-1 space-y-5 overflow-y-auto px-3.5 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A7F74]">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13.5px] transition-all duration-150 ${
                      isActive
                        ? "bg-[#26211D] text-[#FAF7F2] font-semibold shadow-2xs"
                        : "text-[#B5ABA0] font-medium hover:bg-[#211D1A] hover:text-[#FAF7F2]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#C8100A]"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? "bg-[#C8100A]/20 text-[#F2645C]"
                            : "bg-[#221E1B] text-[#9A9086] group-hover:bg-[#2A2521] group-hover:text-[#D6CEC2]"
                        }`}
                      >
                        <Icon
                          className="h-[17px] w-[17px]"
                          weight={isActive ? "fill" : "duotone"}
                        />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom User Profile & Quick Actions ── */}
      <div className="p-3.5 border-t border-[#2C2623] bg-[#141210] space-y-2.5">
        {user && (
          <Link
            to="/admin/security"
            onClick={() => onClose?.()}
            className="flex items-center gap-2.5 rounded-xl bg-[#1F1B18] p-2.5 border border-[#2C2623] hover:border-[#3D3530] transition group"
            title="Pengaturan Keamanan & Password"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2E2723] text-[#FAF7F2] font-semibold text-xs border border-[#3D3530]">
              {user.email ? user.email[0].toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-semibold text-[#EFE9E0] truncate group-hover:text-white transition"
                title={user.email}
              >
                {user.email}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-normal text-[#9A9086]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Sesi Aktif</span>
              </div>
            </div>
            <Key className="h-4 w-4 text-[#7D7369] group-hover:text-[#D6CEC2] transition shrink-0" weight="duotone" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#211D1A] px-3 py-2 text-[12.5px] font-medium text-[#D6CEC2] hover:bg-[#2B2622] hover:text-[#FAF7F2] border border-[#2C2623] transition"
            title="Buka Website Publik"
          >
            <ArrowSquareOut className="h-4 w-4 text-[#9A9086]" weight="duotone" />
            <span>Lihat Web</span>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#C8100A]/30 bg-[#C8100A]/10 px-3 py-2 text-[12.5px] font-semibold text-[#F59E99] hover:bg-[#C8100A]/20 hover:text-white transition cursor-pointer"
          >
            <SignOut className="h-4 w-4 text-[#F2645C]" weight="duotone" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
