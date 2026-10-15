import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import logoWhiteImg from "../../assets/logo-white.png";
import { cafeService } from "../../services/cafeService";

export default function Navbar({ onOpenProfile }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMenuPage = location.pathname === "/menu";
  const isTeamPage = location.pathname === "/team";

  const [logoUrl, setLogoUrl] = useState(() => {
    return (
      (typeof window !== "undefined" &&
        localStorage.getItem("side_line_cafe_logo")) ||
      ""
    );
  });

  useEffect(() => {
    let ignore = false;
    const loadLogo = async () => {
      try {
        const info = await cafeService.get();
        if (!ignore && info?.logo_url) {
          setLogoUrl(info.logo_url);
        }
      } catch (err) {
        console.warn("Gagal memuat logo cafe:", err);
      }
    };
    loadLogo();

    const handleLogoUpdate = (e) => {
      if (e.detail?.logo_url !== undefined) {
        setLogoUrl(e.detail.logo_url);
      } else {
        const stored = localStorage.getItem("side_line_cafe_logo");
        if (stored) setLogoUrl(stored);
      }
    };

    window.addEventListener("side_line_logo_changed", handleLogoUpdate);
    window.addEventListener("storage", handleLogoUpdate);

    return () => {
      ignore = true;
      window.removeEventListener("side_line_logo_changed", handleLogoUpdate);
      window.removeEventListener("storage", handleLogoUpdate);
    };
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "BERANDA", path: "/" },
    { name: "MENU", path: "/menu" },
    { name: "EVENT", path: "/event" },
    { name: "FASILITAS", path: "/facilities" },
    { name: "GALERI", path: "/gallery" },
    { name: "TIM KAMI", path: "/team" },
    { name: "KONTAK", path: "/contact" },
  ];

  // ── Positioning & Styling logic ──────────────────────────────────────────────
  const headerPosition = isMenuPage
    ? scrolled
      ? "fixed top-0 left-0 right-0 z-50 bg-[#C8100A]/95 backdrop-blur-md shadow-md border-b border-black/15 transition-all duration-300"
      : "absolute top-0 left-0 right-0 z-50 bg-transparent border-none transition-all duration-300"
    : isTeamPage
    ? "sticky top-0 z-40 w-full bg-[#000000]/95 backdrop-blur-md border-b border-white/10 shadow-sm"
    : "sticky top-0 z-40 w-full bg-[#FFF5CF] border-b border-[#141414]/15";

  const linkColor = isMenuPage
    ? "text-white/90 hover:text-white"
    : isTeamPage
    ? "text-white/80 hover:text-[#FF0000]"
    : "text-[#141414] hover:text-[#C8100A]";

  const activeLinkColor = isMenuPage
    ? "text-white font-extrabold"
    : isTeamPage
    ? "text-[#FF0000] font-black"
    : "text-[#C8100A]";

  const activeUnderlineColor = isMenuPage
    ? "bg-white"
    : isTeamPage
    ? "bg-[#FF0000]"
    : "bg-[#C8100A]";

  const ctaBtnClass = isMenuPage
    ? "border border-white/50 bg-transparent px-4 py-2 text-[11px] font-heading font-bold uppercase tracking-wider text-white hover:bg-white/15 transition cursor-pointer rounded-full"
    : isTeamPage
    ? "border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-heading font-bold uppercase tracking-wider text-white hover:bg-white/15 transition cursor-pointer rounded-sm"
    : "border border-[#141414] bg-transparent px-4 py-2 text-[11px] font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer";

  const orderBtnClass = isMenuPage
    ? "bg-white text-[#C8100A] px-5 py-2 text-[11px] font-heading font-black uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition cursor-pointer shadow-md rounded-full"
    : isTeamPage
    ? "bg-[#FF0000] px-5 py-2 text-[11px] font-heading font-black uppercase tracking-widest text-white hover:bg-[#D60000] active:scale-[0.98] transition cursor-pointer shadow-md rounded-sm"
    : "bg-[#C8100A] px-5 py-2 text-[11px] font-heading font-bold uppercase tracking-widest text-white hover:bg-[#9E0000] active:scale-[0.98] transition cursor-pointer shadow-sm";

  const hamburgerClass = isMenuPage
    ? "flex h-10 w-10 items-center justify-center border border-white/50 text-white hover:bg-white/15 transition cursor-pointer rounded-lg"
    : isTeamPage
    ? "flex h-10 w-10 items-center justify-center border border-white/20 text-white hover:bg-white/10 transition cursor-pointer rounded-sm"
    : "flex h-10 w-10 items-center justify-center border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer";

  const currentLogoSrc = isMenuPage || isTeamPage ? logoWhiteImg : (logoUrl || logoImg);

  return (
    <header className={headerPosition}>
      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl 2xl:max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 2xl:px-16 py-3 sm:py-3.5 md:py-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group select-none shrink-0">
          <img
            src={currentLogoSrc}
            alt="SIDELINE Coffee & Eatery"
            className="h-8 xs:h-9 md:h-10 w-auto max-w-[130px] xs:max-w-[160px] sm:max-w-[190px] 2xl:max-w-[220px] object-contain group-hover:opacity-90 transition duration-200"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 2xl:gap-9">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative font-heading text-xs xl:text-[13px] 2xl:text-sm uppercase tracking-[0.16em] xl:tracking-[0.18em] transition-colors duration-150 py-1 font-bold ${
                  isActive ? activeLinkColor : linkColor
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{link.name}</span>
                  {isActive && (
                    <span
                      className={`absolute -bottom-1.5 left-0 right-0 h-[2px] ${activeUnderlineColor} rounded-full`}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA / Action */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              type="button"
              title="Lihat profil founder"
              className={ctaBtnClass}
            >
              PROFIL
            </button>
          )}

          <Link to="/menu" className={orderBtnClass}>
            PESAN MENU
          </Link>
        </div>

        {/* Mobile Hamburger Button & Action */}
        <div className="flex lg:hidden items-center gap-2 sm:gap-3">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              type="button"
              className={`border px-2.5 py-1 text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider rounded-full transition cursor-pointer ${
                isMenuPage || isTeamPage
                  ? "border-white/50 text-white hover:bg-white/10"
                  : "border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF]"
              }`}
            >
              PROFIL
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle Navigation"
            className={hamburgerClass}
          >
            <span className="font-heading font-bold text-sm">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-t px-4 sm:px-6 py-5 sm:py-6 animate-in fade-in duration-200 shadow-xl ${
            isMenuPage
              ? "bg-[#C8100A] border-white/20 text-white"
              : isTeamPage
              ? "bg-[#0E1013] border-white/15 text-white"
              : "bg-[#FFF5CF] border-[#141414] text-[#141414]"
          }`}
        >
          <nav className="flex flex-col space-y-3.5 sm:space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-heading text-base sm:text-lg font-bold tracking-widest transition-colors py-1 ${
                    isActive
                      ? isMenuPage || isTeamPage
                        ? "text-white underline underline-offset-4"
                        : "text-[#C8100A]"
                      : isMenuPage || isTeamPage
                      ? "text-white/80 hover:text-white"
                      : "text-[#141414] hover:text-[#C8100A]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div
              className={`pt-4 border-t flex flex-col gap-2.5 sm:gap-3 ${
                isMenuPage || isTeamPage ? "border-white/20" : "border-[#141414]/20"
              }`}
            >
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-center py-3 text-xs font-heading font-bold uppercase tracking-widest transition rounded-full ${
                  isMenuPage || isTeamPage
                    ? "bg-[#FF0000] text-white hover:bg-[#D60000] shadow-md"
                    : "bg-[#C8100A] text-white hover:bg-[#9E0000]"
                }`}
              >
                JELAJAHI MENU
              </Link>
              {onOpenProfile && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  type="button"
                  className={`w-full text-center border py-3 text-xs font-heading font-bold uppercase tracking-widest rounded-full cursor-pointer ${
                    isMenuPage || isTeamPage
                      ? "border-white/50 text-white"
                      : "border-[#141414] text-[#141414]"
                  }`}
                >
                  PROFIL FOUNDER
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}