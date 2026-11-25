export const SITE_URL = "https://sideline.web.id";
export const SITE_NAME = "SIDELINE Coffee & Eatery";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/bgmenu.png`;
export const DEFAULT_OG_IMAGE_ALT =
  "SIDELINE Coffee & Eatery — Kopi Pilihan dan Ruang Nyaman";

export const PUBLIC_ROUTES_SEO = {
  "/": {
    title: "SIDELINE — Coffee & Eatery Pamulang, Tangerang Selatan",
    description:
      "SIDELINE Coffee & Eatery menghadirkan kopi specialty pilihan, hidangan lezat, Wi-Fi kencang ramah WFC, dan suasana ruang hangat di Pamulang, Tangerang Selatan.",
    canonical: `${SITE_URL}/`,
    robots: "index, follow",
    ogType: "website",
  },
  "/menu": {
    title: "Daftar Menu Kopi, Makanan & Promo — SIDELINE Coffee",
    description:
      "Jelajahi daftar menu SIDELINE Coffee & Eatery: kopi specialty, non-coffee, pastry, hidangan favorit, rekomendasi chef, hingga promo diskon menarik setiap hari.",
    canonical: `${SITE_URL}/menu`,
    robots: "index, follow",
    ogType: "website",
  },
  "/event": {
    title: "Event, Live Music & Sewa Ruang — SIDELINE Coffee",
    description:
      "Cek jadwal event, workshop, panggung live music akustik rutin, serta paket sewa ruang privat untuk meeting dan gathering di SIDELINE Coffee & Eatery.",
    canonical: `${SITE_URL}/event`,
    robots: "index, follow",
    ogType: "website",
  },
  "/facilities": {
    title: "Fasilitas Cafe & Area WFC Nyaman — SIDELINE Coffee",
    description:
      "Nikmati fasilitas lengkap di SIDELINE Coffee & Eatery: Wi-Fi kencang, colokan di banyak meja, area indoor & outdoor nyaman, musala bersih, dan parkir tertata.",
    canonical: `${SITE_URL}/facilities`,
    robots: "index, follow",
    ogType: "website",
  },
  "/gallery": {
    title: "Galeri Suasana & Sudut Ruang Cafe — SIDELINE Coffee",
    description:
      "Lihat galeri foto dan video suasana ruang, tata cahaya hangat, sudut kerja nyaman, dan momen kebersamaan pengunjung di SIDELINE Coffee & Eatery.",
    canonical: `${SITE_URL}/gallery`,
    robots: "index, follow",
    ogType: "website",
  },
  "/team": {
    title: "Tim & Barista Kami — SIDELINE Coffee & Eatery",
    description:
      "Kenali profil pendiri, barista, dan kru berdedikasi di balik seduhan kopi berkualitas serta pelayanan hangat di SIDELINE Coffee & Eatery.",
    canonical: `${SITE_URL}/team`,
    robots: "index, follow",
    ogType: "website",
  },
  "/contact": {
    title: "Kontak, Lokasi & Reservasi Meja — SIDELINE Coffee",
    description:
      "Alamat SIDELINE Coffee & Eatery di Pd. Cabe Udik, Pamulang, Tangerang Selatan, jam buka 09.00–22.00 WIB, petunjuk Google Maps, FAQ, dan reservasi WhatsApp.",
    canonical: `${SITE_URL}/contact`,
    robots: "index, follow",
    ogType: "website",
  },
};

const REDIRECT_ALIAS_TARGET = {
  "/about": "/",
  "/fasilitas": "/facilities",
  "/events": "/event",
  "/promo": "/event",
};

const ADMIN_TITLES = {
  "/admin/login": "Login Admin — SIDELINE",
  "/admin/dashboard": "Ikhtisar Operasional — Admin SIDELINE",
  "/admin/menu": "Katalog & Sajian Menu — Admin SIDELINE",
  "/admin/categories": "Kategori Menu — Admin SIDELINE",
  "/admin/home-hero": "Konten Beranda & Cerita — Admin SIDELINE",
  "/admin/gallery": "Galeri Visual & Suasana — Admin SIDELINE",
  "/admin/events": "Agenda & Event Cafe — Admin SIDELINE",
  "/admin/live-music": "Jadwal Live Music — Admin SIDELINE",
  "/admin/space-booking": "Paket Sewa Tempat — Admin SIDELINE",
  "/admin/team": "Profil Tim & Barista — Admin SIDELINE",
  "/admin/reviews": "Ulasan & Testimoni Pelanggan — Admin SIDELINE",
  "/admin/facilities": "Fasilitas Cafe — Admin SIDELINE",
  "/admin/settings": "Informasi & Lokasi Cafe — Admin SIDELINE",
  "/admin/security": "Keamanan & Ubah Password — Admin SIDELINE",
};

export function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

export function getSeoForPath(pathname) {
  const normalized = normalizePathname(pathname);
  const resolvedPath = REDIRECT_ALIAS_TARGET[normalized] || normalized;

  if (PUBLIC_ROUTES_SEO[resolvedPath]) {
    return {
      ...PUBLIC_ROUTES_SEO[resolvedPath],
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: DEFAULT_OG_IMAGE_ALT,
    };
  }

  if (normalized === "/admin" || normalized.startsWith("/admin/")) {
    return {
      title: ADMIN_TITLES[normalized] || "Panel Manajemen — Admin SIDELINE",
      description: "Panel manajemen operasional internal SIDELINE Coffee & Eatery.",
      canonical: null,
      robots: "noindex, nofollow",
      ogType: "website",
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: DEFAULT_OG_IMAGE_ALT,
    };
  }

  return {
    title: "Halaman Tidak Ditemukan (404) — SIDELINE Coffee & Eatery",
    description:
      "Halaman yang Anda cari tidak ditemukan di website SIDELINE Coffee & Eatery.",
    canonical: null,
    robots: "noindex, nofollow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: DEFAULT_OG_IMAGE_ALT,
  };
}
