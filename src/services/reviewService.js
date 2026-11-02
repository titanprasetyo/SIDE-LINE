import { supabase } from "./supabase";
import { validateReviewInput } from "../utils/text";

const LOCAL_STORAGE_KEY = "side_line_customer_reviews";
const DELETED_REVIEWS_KEY = "side_line_deleted_review_ids";
const DELETED_SIGS_KEY = "side_line_deleted_review_sigs";
const RATE_LIMIT_KEY = "side_line_last_review_ts";
const SUBMIT_COOLDOWN_MS = 10 * 1000; // 10 detik cooldown antar submit per tab
const SYNC_ENDPOINT = "/__api/reviews-sync";

// Ulasan default berkualitas tinggi dengan tanggal deterministik (konsisten di semua browser)
const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: "Dimas Pratama",
    rating: 5,
    tag: "Work From Cafe",
    comment:
      "Kopi susunya juara, creamy dan manisnya pas. Tempatnya adem dan tenang banget buat nugas atau wfc seharian. Wi-Fi kencang dan colokan banyak.",
    created_at: "2026-10-13T10:00:00.000Z",
    is_published: true,
  },
  {
    id: 2,
    name: "Sarah Amanda",
    rating: 5,
    tag: "Nongkrong Santai",
    comment:
      "Ambience sore hari di area outdoor beneran nyaman banget. Croissant-nya renyah fresh dari oven dan barista-nya ramah-ramah. Pasti balik lagi!",
    created_at: "2026-10-10T10:00:00.000Z",
    is_published: true,
  },
  {
    id: 3,
    name: "Rizky Aditya",
    rating: 5,
    tag: "Pecinta Kopi",
    comment:
      "V60 single origin-nya diekstraksi dengan sangat baik, notes rasanya keluar jelas. Salah satu specialty coffee shop terbaik di area Pamulang.",
    created_at: "2026-10-07T10:00:00.000Z",
    is_published: true,
  },
  {
    id: 4,
    name: "Nabila Putri",
    rating: 5,
    tag: "Dine-in",
    comment:
      "Pisang ijo dan es kopi gula arennya perpaduan mantap. Tempatnya bersih, aesthetic, dan parkirannya lega. Sangat recommended buat kumpul santai.",
    created_at: "2026-10-03T10:00:00.000Z",
    is_published: true,
  },
];

export function getReviewSignature(item) {
  if (!item) return "";
  const name = String(item.name || "").trim().toLowerCase();
  const comment = String(item.comment || "").trim().toLowerCase();
  if (!name && !comment) return "";
  return `${name}|${comment}`;
}

function getDeletedReviewIds() {
  try {
    const raw = localStorage.getItem(DELETED_REVIEWS_KEY);
    return raw ? new Set(JSON.parse(raw).map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function getDeletedReviewSigs() {
  try {
    const raw = localStorage.getItem(DELETED_SIGS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedSets(idsSet, sigsSet) {
  try {
    localStorage.setItem(DELETED_REVIEWS_KEY, JSON.stringify(Array.from(idsSet)));
    localStorage.setItem(DELETED_SIGS_KEY, JSON.stringify(Array.from(sigsSet)));
  } catch {
    // ignore
  }
}

function addDeletedReview(id, itemOrSig) {
  const ids = getDeletedReviewIds();
  const sigs = getDeletedReviewSigs();
  if (id !== undefined && id !== null) {
    ids.add(String(id));
  }
  const sig =
    typeof itemOrSig === "string"
      ? itemOrSig
      : getReviewSignature(itemOrSig);
  if (sig) {
    sigs.add(sig);
  }
  saveDeletedSets(ids, sigs);
  return { ids, sigs, sig };
}

function getLocalReviews() {
  const deletedIds = getDeletedReviewIds();
  const deletedSigs = getDeletedReviewSigs();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS.filter(
        (item) =>
          !deletedIds.has(String(item.id)) &&
          !deletedSigs.has(getReviewSignature(item))
      );
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) =>
          item &&
          !deletedIds.has(String(item.id)) &&
          !deletedSigs.has(getReviewSignature(item))
      );
    }
    return DEFAULT_REVIEWS.filter(
      (item) =>
        !deletedIds.has(String(item.id)) &&
        !deletedSigs.has(getReviewSignature(item))
    );
  } catch {
    return DEFAULT_REVIEWS.filter(
      (item) =>
        !deletedIds.has(String(item.id)) &&
        !deletedSigs.has(getReviewSignature(item))
    );
  }
}

function saveLocalReviews(reviews) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn("Gagal menyimpan ulasan ke localStorage:", err);
  }
}

/**
 * Menggabungkan & mendeduplikasi daftar ulasan dari berbagai sumber
 * (Supabase DB, Sync Bridge lintas-browser, dan LocalStorage),
 * memprioritaskan record yang sudah memiliki ID database Supabase asli.
 */
export function mergeAndDedupeReviews(lists, deletedIds = new Set(), deletedSigs = new Set()) {
  const bySig = new Map();

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.name || !item.comment) continue;
      const idStr = String(item.id ?? "");
      const sig = getReviewSignature(item);
      if (!sig) continue;
      if (deletedIds.has(idStr) || deletedSigs.has(sig)) continue;

      const existing = bySig.get(sig);
      if (!existing) {
        bySig.set(sig, item);
      } else {
        // Prioritaskan item dengan ID database (integer kecil < 10^11) dibanding Date.now()
        const itemIsDb = Boolean(item._fromDb) || (Number(item.id) > 4 && Number(item.id) < 100000000000);
        const existIsDb = Boolean(existing._fromDb) || (Number(existing.id) > 4 && Number(existing.id) < 100000000000);
        if (itemIsDb && !existIsDb) {
          bySig.set(sig, item);
        }
      }
    }
  }

  return Array.from(bySig.values())
    .map((r) => {
      const copy = { ...r };
      delete copy._fromDb;
      return copy;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    );
}

// Komunikasi dengan endpoint sync bridge dev server (agar Chrome, Edge, Incognito selalu sinkron)
async function syncWithDevBridge(payload = null) {
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return null;
  }
  try {
    const res = await fetch(
      SYNC_ENDPOINT,
      payload
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        : { method: "GET", cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.reviews)) {
      const ids = getDeletedReviewIds();
      const sigs = getDeletedReviewSigs();
      if (Array.isArray(data.deletedIds)) {
        for (const id of data.deletedIds) ids.add(String(id));
      }
      if (Array.isArray(data.deletedSigs)) {
        for (const s of data.deletedSigs) if (s) sigs.add(s);
      }
      saveDeletedSets(ids, sigs);
      return {
        reviews: data.reviews,
        deletedIds: ids,
        deletedSigs: sigs,
      };
    }
  } catch {
    // Abaikan jika bukan di dev server
  }
  return null;
}

// Broadcast perubahan real-time ke seluruh tab dan browser
let realtimeChannel = null;
let broadcastChan = null;

function notifyAllListeners(eventPayload = { type: "sync", ts: Date.now() }) {
  if (typeof window === "undefined") return;

  try {
    if (!broadcastChan && typeof BroadcastChannel !== "undefined") {
      broadcastChan = new BroadcastChannel("side_line_reviews_channel");
    }
    broadcastChan?.postMessage(eventPayload);
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new CustomEvent("side-line-reviews-updated", { detail: eventPayload }));
  } catch {
    // ignore
  }

  try {
    if (realtimeChannel) {
      realtimeChannel.send({
        type: "broadcast",
        event: "reviews_updated",
        payload: eventPayload,
      });
    }
  } catch {
    // ignore
  }
}

// Promosikan ulasan yang belum masuk ke tabel Supabase `reviews` saat Admin sedang aktif/login
let isPromoting = false;
async function promotePendingToSupabase(mergedReviews, dbReviews, deletedIds, deletedSigs) {
  if (isPromoting) return mergedReviews;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      return mergedReviews;
    }

    const dbSigs = new Set((dbReviews || []).map(getReviewSignature));
    const pending = mergedReviews.filter((r) => {
      const sig = getReviewSignature(r);
      return sig && !dbSigs.has(sig) && !deletedIds.has(String(r.id)) && !deletedSigs.has(sig);
    });

    if (pending.length === 0) return mergedReviews;

    isPromoting = true;
    const newlyInserted = [];

    for (const item of pending) {
      const payload = {
        name: String(item.name).trim().slice(0, 60),
        rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
        comment: String(item.comment).trim().slice(0, 1000),
        tag: String(item.tag || "Pengunjung").trim().slice(0, 40),
        is_published: true,
        created_at: item.created_at || new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from("reviews")
        .insert([payload])
        .select()
        .single();

      if (!error && inserted) {
        newlyInserted.push({ ...inserted, _fromDb: true });
      }
    }

    if (newlyInserted.length > 0) {
      const updated = mergeAndDedupeReviews(
        [newlyInserted, dbReviews, mergedReviews],
        deletedIds,
        deletedSigs
      );
      saveLocalReviews(updated);
      await syncWithDevBridge({
        action: "merge",
        reviews: updated,
        deletedIds: Array.from(deletedIds),
        deletedSigs: Array.from(deletedSigs),
      });
      return updated;
    }
  } catch {
    // ignore
  } finally {
    isPromoting = false;
  }
  return mergedReviews;
}

export const reviewService = {
  // Ambil semua ulasan (Publik & Admin) — selalu sinkron antara Supabase, Bridge lintas-browser, dan LocalStorage
  async getAll() {
    let deletedIds = getDeletedReviewIds();
    let deletedSigs = getDeletedReviewSigs();
    const localReviews = getLocalReviews();

    // 1. Sinkronkan dengan bridge lintas-browser agar ulasan dari Chrome/Edge/Incognito langsung terbaca
    const bridgeData = await syncWithDevBridge({
      action: "merge",
      reviews: localReviews,
      deletedIds: Array.from(deletedIds),
      deletedSigs: Array.from(deletedSigs),
    });

    if (bridgeData) {
      deletedIds = bridgeData.deletedIds;
      deletedSigs = bridgeData.deletedSigs;
    }

    // 2. Ambil data dari tabel Supabase `reviews`
    let dbReviews = [];
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        dbReviews = data.map((r) => ({ ...r, _fromDb: true }));
      }
    } catch {
      // fallback jika offline
    }

    // 3. Gabungkan dan deduplikasi semua sumber
    let merged = mergeAndDedupeReviews(
      [dbReviews, bridgeData?.reviews || [], localReviews],
      deletedIds,
      deletedSigs
    );

    // 4. Jika Admin sedang login, promosikan otomatis ulasan yang belum tersimpan di Supabase DB
    merged = await promotePendingToSupabase(merged, dbReviews, deletedIds, deletedSigs);

    saveLocalReviews(merged);
    return merged;
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

    // Jika sebelumnya ulasan dengan isi sama pernah dihapus lalu diinput ulang sengaja, buka blokir signature-nya
    const sig = getReviewSignature(newReview);
    const deletedSigs = getDeletedReviewSigs();
    if (deletedSigs.has(sig)) {
      deletedSigs.delete(sig);
      saveDeletedSets(getDeletedReviewIds(), deletedSigs);
    }

    let savedItem = null;

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([newReview])
        .select()
        .single();

      if (error) {
        console.warn("Info insert ulasan ke Supabase (akan disinkronkan via bridge):", error.message);
      } else if (data) {
        savedItem = { ...data, _fromDb: true };
      }
    } catch (err) {
      console.warn("Info insert ulasan ke Supabase, simpan via sinkronisasi:", err);
    }

    // Catat timestamp submission sukses
    if (typeof window !== "undefined") {
      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    }

    const itemToSave = savedItem || { ...newReview, id: Date.now() };
    const local = getLocalReviews();
    const updated = mergeAndDedupeReviews(
      [[itemToSave], local],
      getDeletedReviewIds(),
      getDeletedReviewSigs()
    );
    saveLocalReviews(updated);

    // Sinkronkan ke bridge lintas-browser dan pancarkan event real-time
    await syncWithDevBridge({
      action: "add",
      review: itemToSave,
      reviews: updated,
    });

    notifyAllListeners({ type: "created", review: itemToSave, ts: Date.now() });

    return itemToSave;
  },

  // Hapus ulasan (khusus Admin - moderasi permanen di semua tempat)
  async delete(id, reviewItem = null) {
    const local = getLocalReviews();
    const targetItem =
      reviewItem || local.find((item) => String(item.id) === String(id)) || null;
    const { ids, sigs, sig } = addDeletedReview(id, targetItem);

    try {
      // Hapus berdasarkan ID di Supabase
      await supabase.from("reviews").delete().eq("id", id);
      // Hapus juga jika ada duplikat berdasarkan nama & komentar di Supabase
      if (targetItem?.name && targetItem?.comment) {
        await supabase
          .from("reviews")
          .delete()
          .eq("name", targetItem.name)
          .eq("comment", targetItem.comment);
      }
    } catch (err) {
      console.warn("Gagal delete ulasan di Supabase:", err);
    }

    const updated = local.filter(
      (item) =>
        String(item.id) !== String(id) &&
        (!sig || getReviewSignature(item) !== sig)
    );
    saveLocalReviews(updated);

    await syncWithDevBridge({
      action: "delete",
      id,
      sig,
      deletedIds: Array.from(ids),
      deletedSigs: Array.from(sigs),
    });

    notifyAllListeners({ type: "deleted", id, sig, ts: Date.now() });
    return true;
  },

  // Langganan pembaruan ulasan secara Real-Time (Supabase Realtime + BroadcastChannel + Polling ringan)
  subscribe(onUpdate) {
    if (typeof window === "undefined" || typeof onUpdate !== "function") {
      return () => {};
    }

    let debounceTimer = null;
    const triggerRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onUpdate();
      }, 150);
    };

    // 1. CustomEvent & Storage Event
    const handleCustomEvent = () => triggerRefresh();
    const handleStorageEvent = (e) => {
      if (
        !e.key ||
        e.key === LOCAL_STORAGE_KEY ||
        e.key === DELETED_REVIEWS_KEY ||
        e.key === DELETED_SIGS_KEY
      ) {
        triggerRefresh();
      }
    };
    const handleFocus = () => triggerRefresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") triggerRefresh();
    };

    window.addEventListener("side-line-reviews-updated", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // 2. BroadcastChannel (antar-tab instan)
    let bc = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("side_line_reviews_channel");
        bc.onmessage = () => triggerRefresh();
      }
    } catch {
      // ignore
    }

    // 3. Supabase Realtime (postgres_changes + broadcast lintas browser/perangkat)
    let sbChannel = null;
    try {
      sbChannel = supabase
        .channel(`side_line_reviews_sync_${Math.random().toString(36).slice(2, 8)}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "reviews" },
          () => triggerRefresh()
        )
        .on("broadcast", { event: "reviews_updated" }, () => triggerRefresh())
        .subscribe();
      realtimeChannel = sbChannel;
    } catch {
      // ignore
    }

    // 4. Polling sinkronisasi ringan (setiap 3.5 detik) agar perubahan lintas-browser terdeteksi real-time
    const pollInterval = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        onUpdate();
      }
    }, 3500);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      clearInterval(pollInterval);
      window.removeEventListener("side-line-reviews-updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      try {
        bc?.close();
      } catch {
        // ignore
      }
      try {
        if (sbChannel) supabase.removeChannel(sbChannel);
      } catch {
        // ignore
      }
    };
  },
};
