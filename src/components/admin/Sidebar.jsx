import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Menu Café", path: "/admin/menu", icon: "☕" },
    { name: "Kategori Menu", path: "/admin/categories", icon: "🏷️" },
    { name: "Foto Galeri", path: "/admin/gallery", icon: "🖼️" },
    { name: "Promo & Event", path: "/admin/promo", icon: "🎉" },
    { name: "Live Music", path: "/admin/live-music", icon: "🎵" },
    { name: "Sewa Tempat", path: "/admin/space-booking", icon: "🏢" },
    { name: "Tim & Owner", path: "/admin/team", icon: "👥" },
    { name: "Fasilitas", path: "/admin/facilities", icon: "✨" },
    { name: "Info Café", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-950 p-5 text-white border-r border-slate-900 z-30">
      {/* Brand */}
      <div>
        <h1 className="text-xl font-black tracking-wider text-white">
          SIDE LINE
        </h1>
        <p className="mt-0.5 text-[10px] text-amber-500 font-bold tracking-widest uppercase">
          Admin Management
        </p>
      </div>

      {/* Nav List */}
      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-2 text-xs transition-all duration-150 ${
                isActive
                  ? "bg-amber-600 font-semibold text-white shadow-xs"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            <span className="text-sm">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom User & Actions */}
      <div className="pt-3 border-t border-slate-900 space-y-2.5">
        {user && (
          <div className="px-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Logged in</p>
            <p className="text-xs text-slate-300 truncate font-mono mt-0.5" title={user.email}>
              {user.email}
            </p>
          </div>
        )}

        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          <span>🌐</span>
          <span>Buka Website Publik ↗</span>
        </Link>

        <button
          onClick={handleLogout}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500 transition"
        >
          <span>🚪</span>
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
