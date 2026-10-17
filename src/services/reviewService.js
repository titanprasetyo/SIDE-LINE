import { supabase } from "./supabase";
import { validateReviewInput } from "../utils/text";

const LOCAL_STORAGE_KEY = "side_line_customer_reviews";

// Ulasan default berkualitas tinggi untuk fallback awal jika database belum dimigrasi
const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: "Dimas Pratama",
    rating: 5,
    tag: "Work From Cafe",
    comment:
      "Kopi susunya juara, creamy dan manisnya pas. Tempatnya adem dan tenang banget buat nugas atau wfc seharian. Wi-Fi kencang dan colokan banyak.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_published: true,
  },
  {
    id: 2,
    name: "Sarah Amanda",
    rating: 5,
    tag: "Nongkrong Santai",
    comment:
      "Ambience sore hari di area outdoor beneran nyaman banget. Croissant-nya renyah fresh dari oven dan barista-nya ramah-ramah. Pasti balik lagi!",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_published: true,
  },
  {
    id: 3,
    name: "Rizky Aditya",
    rating: 5,
    tag: "Pecinta Kopi",
    comment:
      "V60 single origin-nya diekstraksi dengan sangat baik, notes rasanya keluar jelas. Salah satu specialty coffee shop terbaik di area Pamulang.",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    is_published: true,
  },
  {
    id: 4,
    name: "Nabila Putri",
    rating: 5,
    tag: "Dine-in",
    comment:
      "Pisang ijo dan es kopi gula arennya perpaduan mantap. Tempatnya bersih, aesthetic, dan parkirannya lega. Sangat recommended buat kumpul santai.",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    is_published: true,
  },
];

function getLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REVIEWS;
  } catch {
    return DEFAULT_REVIEWS;
  }
}

function saveLocalReviews(reviews) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn("Gagal menyimpan ulasan ke localStorage:", err);
  }
}
const RATE_LIMIT_KEY = "side_line_last_review_ts";
const SUBMIT_COOLDOWN_MS = 20 * 1000; // 20 detik cooldown antar submit per tab

export const reviewService = {
  // Ambil semua ulasan (Publik & Admin)
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Jika tabel belum dibuat di Supabase, fallback ke local storage
        return getLocalReviews();
      }

      if (data && data.length > 0) {
        saveLocalReviews(data);
        return data;
      }

      // Jika database Supabase kosong, gunakan local storage
      return getLocalReviews();
    } catch {
      return getLocalReviews();
    }
  },

  // Tambah ulasan baru (dari form pelanggan beranda atau panel admin)
  async create({ name, rating, comment, tag = "Pengunjung" }) {
    // 1. Validasi input ketat
    const validation = validateReviewInput({ name, rating, comment, tag });
    if (!validation.isValid) {
      throw new Error(validation.errors.join(" "));
    }

    // 2. Client-side submit cooldown throttling
    if (typeof window !== "undefined") {
      const lastSubmit = Number(sessionStorage.getItem(RATE_LIMIT_KEY)) || 0;
      const now = Date.now();
      if (now - lastSubmit < SUBMIT_COOLDOWN_MS) {
        const remainingSec = Math.ceil((SUBMIT_COOLDOWN_MS - (now - lastSubmit)) / 1000);
        throw new Error(`Mohon tunggu ${remainingSec} detik sebelum mengirimkan ulasan baru.`);
      }
    }

    const newReview = {
      name: validation.data.name,
      rating: validation.data.rating,
      comment: validation.data.comment,
      tag: validation.data.tag,
      is_published: true,
      created_at: new Date().toISOString(),
    };

    let savedItem = null;

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([newReview])
        .select()
        .single();

      if (error) {
        console.warn("Gagal insert ulasan ke Supabase:", error.message);
      } else if (data) {
        savedItem = data;
      }
    } catch (err) {
      console.warn("Gagal insert ulasan ke Supabase, simpan lokal:", err);
    }

    // Catat timestamp submission sukses
    if (typeof window !== "undefined") {
      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    }

    // Simpan juga ke local storage sebagai backup offline
    const local = getLocalReviews();
    const itemToSave = savedItem || { ...newReview, id: Date.now() };
    const updated = [itemToSave, ...local];
    saveLocalReviews(updated);

    return itemToSave;
  },

  // Hapus ulasan (khusus Admin)
  async delete(id) {
    try {
      await supabase.from("reviews").delete().eq("id", id);
    } catch (err) {
      console.warn("Gagal delete ulasan di Supabase:", err);
    }

    // Hapus dari local storage
    const local = getLocalReviews();
    const updated = local.filter((item) => String(item.id) !== String(id));
    saveLocalReviews(updated);
    return true;
  },
};
