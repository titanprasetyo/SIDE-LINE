import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logoImg from "../../assets/logo.png";

export default function Navbar({ onOpenProfile }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "ABOUT", path: "/about" },
    { name: "MENU", path: "/menu" },
    { name: "GALLERY", path: "/gallery" },
    { name: "PROMO", path: "/promo" },
    { name: "TEAM", path: "/team" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF5CF] border-b border-[#141414]/15">
      {/* Top Editorial Ticker Bar */}
      <div className="hidden md:flex items-center justify-between px-6 lg:px-12 py-1.5 border-b border-[#141414]/10 text-[10px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF0000]" />
          <span>SIDE LINE COFFEE • EATERY</span>
          <span className="text-[#141414]/30">/</span>
          <span>SPECIALTY BEANS & ARCHITECTURAL SPACE</span>
        </div>
        <div className="flex items-center gap-6">
          <span>OPEN DAILY: 09:00 — 22:00</span>
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              type="button"
              className="text-[#FF0000] hover:text-[#141414] font-bold uppercase transition cursor-pointer flex items-center gap-1.5"
            >
              <span>[ FOUNDER PROFILE ]</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12 py-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="SIDE LINE Coffee & Eatery"
            className="h-8 md:h-10 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative font-heading text-xs uppercase tracking-[0.18em] transition-colors duration-150 py-1 font-semibold ${
                  isActive
                    ? "text-[#FF0000]"
                    : "text-[#141414] hover:text-[#FF0000]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#FF0000]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA / Action */}
        <div className="hidden lg:flex items-center gap-4">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              type="button"
              title="Lihat profil founder"
              className="border border-[#141414] px-3.5 py-2 text-[11px] font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer"
            >
              PROFILE
            </button>
          )}

          <Link
            to="/menu"
            className="bg-[#FF0000] px-5 py-2 text-[11px] font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] active:scale-[0.98] transition cursor-pointer"
          >
            ORDER MENU
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-3">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              type="button"
              className="border border-[#141414] px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-wider text-[#141414]"
            >
              PROFILE
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle Navigation"
            className="flex h-10 w-10 items-center justify-center border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer"
          >
            <span className="font-heading font-bold text-sm">
              {mobileMenuOpen ? "✕" : "MENU"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#141414] bg-[#FFF5CF] px-6 py-6 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-heading text-lg font-bold tracking-widest transition-colors ${
                    isActive ? "text-[#FF0000]" : "text-[#141414] hover:text-[#FF0000]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-[#141414]/20 flex flex-col gap-3">
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#FF0000] py-3 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
              >
                EXPLORE MENU
              </Link>
              {onOpenProfile && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  type="button"
                  className="w-full text-center border border-[#141414] py-3 text-xs font-heading font-bold uppercase tracking-widest text-[#141414]"
                >
                  FOUNDER PROFILE
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}