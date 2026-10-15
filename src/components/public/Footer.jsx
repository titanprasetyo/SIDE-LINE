import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import { cleanText, toWhatsAppLink, toInstagramLink } from "../../utils/text";
import logoWhiteImg from "../../assets/logo-white.png";

const currentYear = new Date().getFullYear();

const NAV_LINKS = [
  { label: "Beranda", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "Event & sewa ruang", to: "/event" },
  { label: "Fasilitas", to: "/facilities" },
  { label: "Galeri", to: "/gallery" },
  { label: "Tim kami", to: "/team" },
  { label: "Kontak", to: "/contact" },
];

function FooterHeading({ children }) {
  return (
    <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFF5CF]/40">
      {children}
    </h2>
  );
}

export default function Footer() {
  const [cafeInfo, setCafeInfo] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchInfo = async () => {
      try {
        const data = await cafeService.get();
        if (!ignore && data) setCafeInfo(data);
      } catch (err) {
        console.warn("Gagal memuat info footer:", err);
      }
    };
    fetchInfo();
    return () => {
      ignore = true;
    };
  }, []);

  const waLink = toWhatsAppLink(
    cafeInfo?.phone,
    "Halo Side Line, saya mau tanya-tanya dulu."
  );
  const igLink = toInstagramLink(cafeInfo?.instagram);

  return (
    <footer className="bg-[#141414] text-[#FFF5CF]">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-12 2xl:px-16 pt-12 sm:pt-16 md:pt-20 pb-8">
        <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link to="/" className="inline-block" aria-label="Side Line, ke beranda">
              <img src={logoWhiteImg} alt="SIDE LINE" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>
            <p className="mt-6 sm:mt-8 max-w-sm font-heading text-2xl sm:text-3xl font-black uppercase leading-[1.05] tracking-tight">
              Kopi enak,
              <br />
              obrolan <span className="text-[#E5251F]">panjang.</span>
            </p>
            <p className="mt-4 sm:mt-5 max-w-sm text-sm leading-relaxed text-[#FFF5CF]/60 line-clamp-3">
              {cleanText(cafeInfo?.about_text) ||
                "Tempat ngopi, makan, dan ngobrol santai. Datang sendiri buat kerja, atau ajak teman buat lama-lama."}
            </p>
          </div>

          {/* Navigasi */}
          <nav className="sm:col-span-1 lg:col-span-3" aria-label="Navigasi footer">
            <FooterHeading>Jelajahi</FooterHeading>
            <ul className="mt-4 sm:mt-5 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[#FFF5CF]/80 hover:text-[#FFF5CF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kunjungi & Hubungi */}
          <div className="sm:col-span-1 lg:col-span-4 space-y-8 sm:space-y-10">
            <div>
              <FooterHeading>Kunjungi</FooterHeading>
              <p className="mt-5 text-sm leading-relaxed text-[#FFF5CF]/80">
                {cleanText(cafeInfo?.address) || "Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan"}
              </p>
              <p className="mt-3 text-sm font-semibold">
                {cleanText(cafeInfo?.opening_hours) || "Setiap hari, 09.00 – 22.00 WIB"}
              </p>
              <a
                href={cafeInfo?.google_maps_url || "https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan"}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E5251F] hover:text-[#FFF5CF] transition-colors"
              >
                Buka di Google Maps <span aria-hidden="true">↗</span>
              </a>
            </div>

            {(waLink || igLink) && (
              <div>
                <FooterHeading>Hubungi</FooterHeading>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {waLink && (
                    <li>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FFF5CF]/80 hover:text-[#FFF5CF] transition-colors"
                      >
                        WhatsApp · {cafeInfo.phone}
                      </a>
                    </li>
                  )}
                  {igLink && (
                    <li>
                      <a
                        href={igLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FFF5CF]/80 hover:text-[#FFF5CF] transition-colors"
                      >
                        Instagram · {cafeInfo.instagram}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-[#FFF5CF]/10 pt-6 text-xs text-[#FFF5CF]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Side Line Coffee &amp; Eatery</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="self-start sm:self-auto hover:text-[#FFF5CF] transition-colors cursor-pointer"
          >
            Kembali ke atas ↑
          </button>
        </div>
      </div>
    </footer>
  );
}