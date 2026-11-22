export const SITE_URL = "https://sideline.web.id";
export const SITE_NAME = "SIDE LINE Coffee & Eatery";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/bgmenu.png`;
export const DEFAULT_OG_IMAGE_ALT =
  "SIDE LINE Coffee & Eatery — Kopi Pilihan dan Ruang Nyaman";

export const PUBLIC_ROUTES_SEO = {
  "/": {
    title: "SIDE LINE — Coffee & Eatery Pamulang, Tangerang Selatan",
    description:
      "SIDE LINE Coffee & Eatery menghadirkan kopi specialty pilihan, hidangan lezat, Wi-Fi kencang ramah WFC, dan suasana ruang hangat di Pamulang, Tangerang Selatan.",
    canonical: `${SITE_URL}/`,
    robots: "index, follow",
    ogType: "website",
  },
  "/menu": {
    title: "Daftar Menu Kopi, Makanan & Promo — SIDE LINE Coffee",
    description:
      "Jelajahi daftar menu SIDE LINE Coffee & Eatery: kopi specialty, non-coffee, pastry, hidangan favorit, rekomendasi chef, hingga promo diskon menarik setiap hari.",
    canonical: `${SITE_URL}/menu`,
    robots: "index, follow",
    ogType: "website",
  },
  "/event": {
    title: "Event, Live Music & Sewa Ruang — SIDE LINE Coffee",
    description:
      "Cek jadwal event, workshop, panggung live music akustik rutin, serta paket sewa ruang privat untuk meeting dan gathering di SIDE LINE Coffee & Eatery.",
    canonical: `${SITE_URL}/event`,
    robots: "index, follow",
    ogType: "website",
  },
  "/facilities": {
    title: "Fasilitas Cafe & Area WFC Nyaman — SIDE LINE Coffee",
    description:
      "Nikmati fasilitas lengkap di SIDE LINE Coffee & Eatery: Wi-Fi kencang, colokan di banyak meja, area indoor & outdoor nyaman, musala bersih, dan parkir tertata.",
    canonical: `${SITE_URL}/facilities`,
    robots: "index, follow",
    ogType: "website",
  },
  "/gallery": {
    title: "Galeri Suasana & Sudut Ruang Cafe — SIDE LINE Coffee",
    description:
      "Lihat galeri foto dan video suasana ruang, tata cahaya hangat, sudut kerja nyaman, dan momen kebersamaan pengunjung di SIDE LINE Coffee & Eatery.",
    canonical: `${SITE_URL}/gallery`,
    robots: "index, follow",
    ogType: "website",
  },
  "/team": {
    title: "Tim & Barista Kami — SIDE LINE Coffee & Eatery",
    description:
      "Kenali profil pendiri, barista, dan kru berdedikasi di balik seduhan kopi berkualitas serta pelayanan hangat di SIDE LINE Coffee & Eatery.",
    canonical: `${SITE_URL}/team`,
    robots: "index, follow",
    ogType: "website",
  },
  "/contact": {
    title: "Kontak, Lokasi & Reservasi Meja — SIDE LINE Coffee",
    description:
      "Alamat SIDE LINE Coffee & Eatery di Pd. Cabe Udik, Pamulang, Tangerang Selatan, jam buka 09.00–22.00 WIB, petunjuk Google Maps, FAQ, dan reservasi WhatsApp.",
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
  "/admin/login": "Login Admin — SIDE LINE",
  "/admin/dashboard": "Ikhtisar Operasional — Admin SIDE LINE",
  "/admin/menu": "Katalog & Sajian Menu — Admin SIDE LINE",
  "/admin/categories": "Kategori Menu — Admin SIDE LINE",
  "/admin/home-hero": "Konten Beranda & Cerita — Admin SIDE LINE",
  "/admin/gallery": "Galeri Visual & Suasana — Admin SIDE LINE",
  "/admin/events": "Agenda & Event Cafe — Admin SIDE LINE",
  "/admin/live-music": "Jadwal Live Music — Admin SIDE LINE",
  "/admin/space-booking": "Paket Sewa Tempat — Admin SIDE LINE",
  "/admin/team": "Profil Tim & Barista — Admin SIDE LINE",
  "/admin/reviews": "Ulasan & Testimoni Pelanggan — Admin SIDE LINE",
  "/admin/facilities": "Fasilitas Cafe — Admin SIDE LINE",
  "/admin/settings": "Informasi & Lokasi Cafe — Admin SIDE LINE",
  "/admin/security": "Keamanan & Ubah Password — Admin SIDE LINE",
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
      title: ADMIN_TITLES[normalized] || "Panel Manajemen — Admin SIDE LINE",
      description: "Panel manajemen operasional internal SIDE LINE Coffee & Eatery.",
      canonical: null,
      robots: "noindex, nofollow",
      ogType: "website",
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: DEFAULT_OG_IMAGE_ALT,
    };
  }

  return {
    title: "Halaman Tidak Ditemukan (404) — SIDE LINE Coffee & Eatery",
    description:
      "Halaman yang Anda cari tidak ditemukan di website SIDE LINE Coffee & Eatery.",
    canonical: null,
    robots: "noindex, nofollow",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: DEFAULT_OG_IMAGE_ALT,
  };
}
