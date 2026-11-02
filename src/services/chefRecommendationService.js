import { supabase } from "./supabase";
import { storageService } from "./storageService";

const LOCAL_STORAGE_KEY = "side_line_chef_recommendation_poster";

export const DEFAULT_CHEF_POSTER = {
  id: "default-chef-poster",
  title: "Rekomendasi Spesial Chef Bulan Ini",
  subtitle:
    "Kombinasi autentik cold brew espresso segar berpadu sentuhan buah delima dan pastry croissant butter hangat dari oven pilihan chef SIDE LINE.",
  badge: "PILIHAN CHEF",
  image_url: "",
  is_active: true,
  placement: "chef_recommendation",
  created_at: new Date().toISOString(),
};

const isValidUuid = (val) =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

function getLocalPoster() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalPoster(poster) {
  try {
    if (poster) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(poster));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("Gagal simpan poster chef ke local storage:", err);
  }
}

export const chefRecommendationService = {
  // Ambil poster secara instan dari cache lokal (sinkron tanpa delay loading)
  getCachedPoster() {
    return getLocalPoster();
  },

  // Ambil poster rekomendasi chef aktif untuk publik / admin
  async getPoster(activeOnly = false) {
    try {
      let query = supabase
        .from("home_banners")
        .select("*")
        .eq("placement", "chef_recommendation");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      query = query.order("created_at", { ascending: false }).limit(1);

      const { data, error } = await query;
      if (error) {
        console.warn("Gagal mengambil poster chef dari Supabase:", error.message);
        const local = getLocalPoster();
        if (local) {
          if (activeOnly && !local.is_active) return null;
          return local;
        }
        return DEFAULT_CHEF_POSTER;
      }

      if (data && data.length > 0) {
        saveLocalPoster(data[0]);
        return data[0];
      }

      const local = getLocalPoster();
      if (local) {
        if (activeOnly && !local.is_active) return null;
        return local;
      }

      return DEFAULT_CHEF_POSTER;
    } catch (err) {
      console.warn("Error saat memuat poster chef:", err);
      const local = getLocalPoster();
      if (local) {
        if (activeOnly && !local.is_active) return null;
        return local;
      }
      return DEFAULT_CHEF_POSTER;
    }
  },

  // Simpan / update poster rekomendasi chef (khusus Admin)
  async savePoster({
    id = null,
    title = "",
    subtitle = "",
    badge = "PILIHAN CHEF",
    imageFile = null,
    currentImageUrl = "",
    isActive = true,
  }) {
    let finalImageUrl = currentImageUrl || "";

    if (imageFile) {
      try {
        finalImageUrl = await storageService.uploadImage("menu-images", imageFile);
      } catch (uploadErr) {
        console.warn("Upload poster ke storage gagal, fallback base64:", uploadErr);
        finalImageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(currentImageUrl || "");
          reader.readAsDataURL(imageFile);
        });
      }
    }

    const payload = {
      title: (title || "Rekomendasi Spesial Chef").trim(),
      subtitle: (subtitle || "").trim(),
      badge: (badge || "PILIHAN CHEF").trim(),
      placement: "chef_recommendation",
      image_url: finalImageUrl,
      is_active: Boolean(isActive),
      order_index: 1,
    };

    try {
      // Cek apakah data sudah ada sebelumnya di Supabase
      const existing = await this.getPoster(false);
      const targetId = isValidUuid(id)
        ? id
        : existing && isValidUuid(existing.id)
        ? existing.id
        : null;

      if (targetId) {
        const { data, error } = await supabase
          .from("home_banners")
          .update(payload)
          .eq("id", targetId)
          .select()
          .single();

        if (error) {
          console.error("Gagal update poster chef di Supabase:", error.message);
          const localRecord = { ...payload, id: targetId, updated_at: new Date().toISOString() };
          saveLocalPoster(localRecord);
          if (error.message && error.message.toLowerCase().includes("check constraint")) {
            throw new Error(
              "Database Supabase menolak 'chef_recommendation'. Silakan jalankan script SQL 'supabase/migration_chef_recommendation_poster.sql' di Supabase SQL Editor agar poster tersimpan online."
            );
          }
          throw new Error(`Gagal memperbarui poster di database Supabase: ${error.message}`);
        }

        saveLocalPoster(data);
        return data;
      } else {
        const newRecord = {
          ...payload,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("home_banners")
          .insert([newRecord])
          .select()
          .single();

        if (error) {
          console.error("Gagal insert poster chef di Supabase:", error.message);
          const localRecord = { ...newRecord, id: `local-chef-${Date.now()}` };
          saveLocalPoster(localRecord);
          if (error.message && error.message.toLowerCase().includes("check constraint")) {
            throw new Error(
              "Database Supabase menolak 'chef_recommendation'. Silakan jalankan script SQL 'supabase/migration_chef_recommendation_poster.sql' di Supabase SQL Editor agar poster tersimpan online."
            );
          }
          throw new Error(`Gagal menyimpan poster baru ke database Supabase: ${error.message}`);
        }

        saveLocalPoster(data);
        return data;
      }
    } catch (err) {
      console.error("Error saat menyimpan poster chef:", err);
      if (err.message && (err.message.includes("Supabase") || err.message.includes("database"))) {
        throw err;
      }
      const localRecord = {
        ...payload,
        id: isValidUuid(id) ? id : `local-chef-${Date.now()}`,
        updated_at: new Date().toISOString(),
      };
      saveLocalPoster(localRecord);
      throw err;
    }
  },

  // Toggle status aktif poster
  async toggleActive(id, currentStatus) {
    const newStatus = !currentStatus;
    try {
      if (isValidUuid(id)) {
        const { data, error } = await supabase
          .from("home_banners")
          .update({ is_active: newStatus })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        saveLocalPoster(data);
        return data;
      }
    } catch (err) {
      console.warn("Gagal toggle status poster di Supabase:", err);
    }

    const local = getLocalPoster() || DEFAULT_CHEF_POSTER;
    const updated = { ...local, is_active: newStatus };
    saveLocalPoster(updated);
    return updated;
  },

  // Hapus poster
  async deletePoster(id, imageUrl = null) {
    if (imageUrl) {
      try {
        await storageService.deleteImage("menu-images", imageUrl);
      } catch {
        // ignore
      }
    }

    try {
      if (isValidUuid(id)) {
        await supabase.from("home_banners").delete().eq("id", id);
      }
    } catch (err) {
      console.warn("Gagal delete poster di Supabase:", err);
    }

    saveLocalPoster(null);
    return true;
  },
};
