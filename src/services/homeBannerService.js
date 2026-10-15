import { supabase } from "./supabase";
import { storageService } from "./storageService";

export function parseAboutStory(banner) {
  if (!banner) return null;

  let meta = {};
  if (banner.subtitle) {
    try {
      meta = JSON.parse(banner.subtitle);
    } catch {
      // Jika string biasa lama (misal: "tampilan")
      meta = {
        description: banner.subtitle,
      };
    }
  }

  return {
    id: banner.id,
    image_url: banner.image_url,
    photo_label: meta.photo_label || banner.title || "BERANDA",
    badge: banner.badge || "ARSIP SUASANA",
    kicker: meta.kicker || "TENTANG SIDE LINE",
    heading: meta.heading || "LEBIH DARI SEKADAR CAFE, SEBUAH RUANG JEDA BERMAKNA.",
    paragraph1:
      meta.paragraph1 ||
      (meta.description && meta.description !== "tampilan" ? meta.description : "") ||
      "SIDE LINE bermula dari sebuah gagasan sederhana: menciptakan tempat perlindungan dari kesibukan harian, di mana aroma seduhan kopi segar dan kehangatan interior menyatu dalam harmoni.",
    paragraph2:
      meta.paragraph2 ||
      "Setiap sudut ditata dengan cermat agar Anda dapat menikmati waktu berkualitas—baik saat mengerjakan proyek penting, menikmati bacaan, maupun mengobrol hangat bersama teman terdekat.",
    highlight1_title: meta.highlight1_title ?? "SENI SANGRAI KOPI",
    highlight1_desc:
      meta.highlight1_desc ??
      "Biji kopi terkurasi melalui kurasi sangrai teliti untuk menonjolkan profil rasa otentik.",
    highlight2_title: meta.highlight2_title ?? "TATA RUANG ARSITEKTURAL",
    highlight2_desc:
      meta.highlight2_desc ??
      "Tata ruang minimalis beraksen kayu hangat untuk privasi maupun interaksi sosial santai.",
    order_index: banner.order_index ?? 1,
    is_active: banner.is_active ?? true,
    created_at: banner.created_at,
  };
}

export const homeBannerService = {
  // --------------------------------------------------------------------------
  // 1. HERO BANNER (1 Foto Khusus untuk Hero Atas)
  // --------------------------------------------------------------------------
  async getHero() {
    try {
      const { data, error } = await supabase
        .from("home_banners")
        .select("*")
        .eq("placement", "hero_primary")
        .order("order_index", { ascending: true })
        .limit(1);

      if (error) {
        console.warn("Gagal mengambil hero banner:", error.message);
        return null;
      }
      return data?.[0] || null;
    } catch (err) {
      console.warn("Gagal load hero:", err.message);
      return null;
    }
  },

  async saveHero(imageFile) {
    if (!imageFile) {
      throw new Error("Pilih foto baru untuk Hero.");
    }

    let finalImageUrl = "";
    try {
      finalImageUrl = await storageService.uploadImage("hero-images", imageFile);
    } catch {
      finalImageUrl = await storageService.uploadImage("gallery-images", imageFile);
    }

    // Periksa apakah sudah ada hero_primary
    const currentHero = await this.getHero();

    if (currentHero) {
      const { data, error } = await supabase
        .from("home_banners")
        .update({
          image_url: finalImageUrl,
          title: "Hero Utama",
          is_active: true,
        })
        .eq("id", currentHero.id)
        .select()
        .single();

      if (error) throw error;
      if (currentHero.image_url) {
        try {
          await storageService.deleteImage("hero-images", currentHero.image_url);
        } catch {
          // ignore
        }
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from("home_banners")
        .insert([
          {
            title: "Hero Utama",
            subtitle: "",
            badge: "ARSIP SUASANA",
            placement: "hero_primary",
            is_active: true,
            order_index: 1,
            image_url: finalImageUrl,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // --------------------------------------------------------------------------
  // 2. ABOUT STORIES (Daftar Cerita & Foto About - Zigzag Kanan Kiri)
  // --------------------------------------------------------------------------
  async getAboutStories(activeOnly = true) {
    try {
      let query = supabase
        .from("home_banners")
        .select("*")
        .eq("placement", "hero_secondary")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.warn("Gagal mengambil about stories:", error.message);
        return [];
      }

      return (data || []).map((row) => parseAboutStory(row));
    } catch (err) {
      console.warn("Gagal load about stories:", err.message);
      return [];
    }
  },

  async saveAboutStory(storyPayload, imageFile = null) {
    let finalImageUrl = storyPayload.image_url;

    if (imageFile) {
      try {
        finalImageUrl = await storageService.uploadImage("hero-images", imageFile);
      } catch {
        finalImageUrl = await storageService.uploadImage("gallery-images", imageFile);
      }
    }

    if (!finalImageUrl) {
      throw new Error("Foto untuk cerita About wajib dipilih.");
    }

    // Serialize metadata into subtitle
    const metaObj = {
      photo_label: storyPayload.photo_label || "BERANDA",
      kicker: storyPayload.kicker || "TENTANG SIDE LINE",
      heading: storyPayload.heading || "LEBIH DARI SEKADAR CAFE, SEBUAH RUANG JEDA BERMAKNA.",
      paragraph1: storyPayload.paragraph1 || "",
      paragraph2: storyPayload.paragraph2 || "",
      highlight1_title: storyPayload.highlight1_title || "",
      highlight1_desc: storyPayload.highlight1_desc || "",
      highlight2_title: storyPayload.highlight2_title || "",
      highlight2_desc: storyPayload.highlight2_desc || "",
    };

    const record = {
      title: storyPayload.photo_label || "Cerita About",
      subtitle: JSON.stringify(metaObj),
      badge: storyPayload.badge || "ARSIP SUASANA",
      placement: "hero_secondary",
      is_active: storyPayload.is_active ?? true,
      order_index: Number(storyPayload.order_index) || 1,
      image_url: finalImageUrl,
    };

    if (storyPayload.id) {
      // Update
      const { data, error } = await supabase
        .from("home_banners")
        .update(record)
        .eq("id", storyPayload.id)
        .select()
        .single();

      if (error) throw error;
      return parseAboutStory(data);
    } else {
      // Create
      record.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("home_banners")
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return parseAboutStory(data);
    }
  },

  async deleteAboutStory(id, imageUrl) {
    const { error } = await supabase.from("home_banners").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      try {
        await storageService.deleteImage("hero-images", imageUrl);
      } catch {
        try {
          await storageService.deleteImage("gallery-images", imageUrl);
        } catch {
          // ignore
        }
      }
    }
    return true;
  },

  async toggleActive(id, currentActive) {
    const { data, error } = await supabase
      .from("home_banners")
      .update({ is_active: !currentActive })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --------------------------------------------------------------------------
  // 3. LEGACY / GENERIC COMPATIBILITY METHODS
  // --------------------------------------------------------------------------
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("home_banners")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getActive() {
    try {
      const { data, error } = await supabase
        .from("home_banners")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async delete(id, imageUrl) {
    return this.deleteAboutStory(id, imageUrl);
  },
};
