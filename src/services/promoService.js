import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const promoService = {
  // Ambil semua promo
  async getAll() {
    const { data, error } = await supabase
      .from("promos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Tambah promo baru
  async create(promoPayload, imageFile = null) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await storageService.uploadImage("promo-images", imageFile);
    }

    const record = {
      title: promoPayload.title.trim(),
      description: promoPayload.description?.trim() || "",
      start_date: promoPayload.start_date || null,
      end_date: promoPayload.end_date || null,
      is_active: promoPayload.is_active ?? true,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("promos")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Perbarui promo
  async update(id, promoPayload, newImageFile = null, oldImageUrl = null) {
    let imageUrl = promoPayload.image_url ?? oldImageUrl;

    if (newImageFile) {
      imageUrl = await storageService.uploadImage("promo-images", newImageFile);
      if (oldImageUrl) {
        await storageService.deleteImage("promo-images", oldImageUrl);
      }
    }

    const updates = {
      title: promoPayload.title.trim(),
      description: promoPayload.description?.trim() || "",
      start_date: promoPayload.start_date || null,
      end_date: promoPayload.end_date || null,
      is_active: promoPayload.is_active ?? true,
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from("promos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle status promo aktif / non-aktif
  async toggleActive(id, currentStatus) {
    const { data, error } = await supabase
      .from("promos")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Hapus promo
  async delete(id, imageUrl = null) {
    const { error } = await supabase.from("promos").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await storageService.deleteImage("promo-images", imageUrl);
    }
    return true;
  },
};
