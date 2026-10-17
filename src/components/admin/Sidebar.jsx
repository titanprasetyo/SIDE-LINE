import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Coffee,
  Tag,
  Layers,
  Image,
  Calendar,
  Music2,
  Building2,
  Users2,
  Star,
  Sparkles,
  Settings,
  LogOut,
  ExternalLink,
  X,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const NAV_SECTIONS = [
  {
    title: "Ikhtisar",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Konten Beranda", path: "/admin/home-hero", icon: Layers },
    ],
  },
  {
    title: "Katalog & Menu",
    items: [
      { name: "Menu Cafe", path: "/admin/menu", icon: Coffee },
      { name: "Kategori Menu", path: "/admin/categories", icon: Tag },
    ],
  },
  {
    title: "Event & Ruang",
    items: [
      { name: "Event & Workshop", path: "/admin/events", icon: Calendar },
      { name: "Jadwal Live Music", path: "/admin/live-music", icon: Music2 },
      { name: "Sewa Tempat", path: "/admin/space-booking", icon: Building2 },
    ],
  },
  {
    title: "Media & Interaksi",
    items: [
      { name: "Foto Galeri", path: "/admin/gallery", icon: Image },
      { name: "Ulasan Pelanggan", path: "/admin/reviews", icon: Star },
      { name: "Tim & Barista", path: "/admin/team", icon: Users2 },
      { name: "Fasilitas Cafe", path: "/admin/facilities", icon: Sparkles },
    ],
  },
  {
    title: "Konfigurasi",
    items: [
      { name: "Info Cafe & Lokasi", path: "/admin/settings", icon: Settings },
      { name: "Ubah Password", path: "/admin/security", icon: KeyRound },
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin logout dari sesi admin?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-[#0B0F17] text-zinc-300 border-r border-white/[0.08] z-50 transition-transform duration-300 ease-in-out font-['Plus_Jakarta_Sans',sans-serif] ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF0000] to-[#990000] text-white font-black text-sm shadow-[0_0_12px_rgba(255,0,0,0.35)]">
            SL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-wider text-white leading-tight">
                SIDE LINE
              </h1>
              <span className="rounded bg-white/[0.08] px-1 py-0.2 text-[9px] font-mono font-semibold text-zinc-300 border border-white/[0.08]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide">
              Management Console
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition cursor-pointer"
          aria-label="Tutup menu navigasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Grouped Nav List ── */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-zinc-800">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2.5 pt-1 pb-0.5">
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
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-white/[0.08] text-white font-semibold border-l-2 border-[#FF0000] pl-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.8} />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom User Card & Actions ── */}
      <div className="p-3 border-t border-white/[0.07] bg-[#080B10]/60 space-y-2">
        {user && (
          <Link
            to="/admin/security"
            onClick={() => onClose?.()}
            className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] p-2 border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.1] transition group"
            title="Kelola Keamanan & Ubah Password"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 text-white font-bold text-xs border border-white/10 group-hover:border-white/30 transition">
              {user.email ? user.email[0].toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-zinc-200 truncate group-hover:text-white transition" title={user.email}>
                {user.email}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Admin Verified</span>
              </div>
            </div>
            <KeyRound className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300 transition shrink-0" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06] transition"
            title="Buka Website Publik"
          >
            <ExternalLink className="h-3 w-3 text-zinc-400" />
            <span>Web Publik</span>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-red-300 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-200 transition cursor-pointer"
          >
            <LogOut className="h-3 w-3 text-red-400" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
