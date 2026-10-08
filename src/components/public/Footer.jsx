import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import logoImg from "../../assets/logo.png";

const currentYear = new Date().getFullYear();

export default function Footer({ onOpenProfile }) {
  const [cafeInfo, setCafeInfo] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchInfo = async () => {
      try {
        const data = await cafeService.get();
        if (!ignore && data) {
          setCafeInfo(data);
        }
      } catch (err) {
        console.warn("Gagal memuat info footer:", err);
      }
    };
    fetchInfo();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <footer className="border-t border-[#141414] bg-[#FFF5CF] text-[#141414] pt-14 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Top Section: Brand Statement & Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#141414]/15">
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={logoImg}
                alt="SIDE LINE"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-[#FF0000] font-bold">
              {cafeInfo?.tagline || "Coffee • Eatery • Space"}
            </p>
            <p className="font-body text-xs sm:text-sm text-[#5C584E] max-w-md leading-relaxed">
              {cafeInfo?.about_text ||
                "Ruang kontemplatif dan titik temu untuk menikmati racikan kopi terkurasi, sajian hangat, serta suasana yang tenang di tengah hiruk-pikuk aktivitas."}
            </p>

            {onOpenProfile && (
              <div className="pt-2">
                <button
                  onClick={onOpenProfile}
                  type="button"
                  className="font-heading text-xs font-bold uppercase tracking-wider text-[#FF0000] hover:text-[#141414] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>→ READ FOUNDER STORY & PHILOSOPHY</span>
                </button>
              </div>
            )}
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-heading text-[11px] uppercase tracking-[0.25em] text-[#141414] font-bold block border-b border-[#141414] pb-1.5">
              INDEX
            </span>
            <ul className="space-y-2 text-xs font-heading font-medium tracking-wider">
              <li>
                <Link to="/" className="hover:text-[#FF0000] transition">
                  01 // BERANDA
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FF0000] transition">
                  02 // TENTANG KAMI
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#FF0000] transition">
                  03 // DAFTAR MENU
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#FF0000] transition">
                  04 // GALERI SUASANA
                </Link>
              </li>
              <li>
                <Link to="/promo" className="hover:text-[#FF0000] transition">
                  05 // PROMO & SEWA RUANG
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-[#FF0000] transition">
                  06 // TIM & FOUNDER
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FF0000] transition">
                  07 // KONTAK & LOKASI
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Location */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <span className="font-heading text-[11px] uppercase tracking-[0.25em] text-[#141414] font-bold block border-b border-[#141414] pb-1.5">
                OPERATIONAL & LOCATION
              </span>
              <div className="mt-3 space-y-2 text-xs font-body text-[#5C584E]">
                <p className="font-medium text-[#141414]">
                  {cafeInfo?.opening_hours || "Setiap Hari: 09:00 — 22:00 WIB"}
                </p>
                <p className="leading-relaxed">
                  {cafeInfo?.address || "Jl. Contoh Alamat Café SIDE LINE"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              {cafeInfo?.phone && (
                <p className="font-body text-[#5C584E]">
                  Telepon / WA:{" "}
                  <span className="text-[#141414] font-medium font-heading">
                    {cafeInfo.phone}
                  </span>
                </p>
              )}
              {cafeInfo?.instagram && (
                <p className="font-body text-[#5C584E]">
                  Instagram:{" "}
                  <a
                    href={`https://instagram.com/${cafeInfo.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FF0000] hover:underline font-heading font-medium"
                  >
                    {cafeInfo.instagram}
                  </a>
                </p>
              )}
            </div>

            {cafeInfo?.google_maps_url && (
              <a
                href={cafeInfo.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-[#141414] px-4 py-2 text-[10px] font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition"
              >
                <span>Google Maps Direction</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-heading tracking-wider uppercase text-[#5C584E] gap-4">
          <p>© {currentYear} SIDE LINE. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <span>DESIGNED WITH CHARACTER</span>
            <Link
              to="/admin/login"
              className="hover:text-[#FF0000] transition"
            >
              [ ADMIN PORTAL ]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}