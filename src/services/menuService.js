import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const menuService = {
  // Ambil semua menu dengan data kategori relasi
  async getAll(categoryId = null) {
    let query = supabase
      .from("menus")
      .select("*, categories(id, name)")
      .order("created_at", { ascending: false });

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Tambah menu baru beserta upload foto (jika ada)
  async create(menuPayload, imageFile = null) {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await storageService.uploadImage("menu-images", imageFile);
    }

    const record = {
      name: menuPayload.name.trim(),
      description: menuPayload.description?.trim() || "",
      price: Number(menuPayload.price) || 0,
      category_id: menuPayload.category_id || null,
      image_url: imageUrl,
      is_available: menuPayload.is_available ?? true,
      is_featured: menuPayload.is_featured ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("menus")
      .insert([record])
      .select("*, categories(id, name)")
      .single();

    if (error) throw error;
    return data;
  },

  // Perbarui menu dan ganti foto (jika ada upload baru)
  async update(id, menuPayload, newImageFile = null, oldImageUrl = null) {
    let imageUrl = menuPayload.image_url ?? oldImageUrl;

    if (newImageFile) {
      imageUrl = await storageService.uploadImage("menu-images", newImageFile);
      if (oldImageUrl) {
        await storageService.deleteImage("menu-images", oldImageUrl);
      }
    }

    const updates = {
      name: menuPayload.name.trim(),
      description: menuPayload.description?.trim() || "",
      price: Number(menuPayload.price) || 0,
      category_id: menuPayload.category_id || null,
      image_url: imageUrl,
      is_available: menuPayload.is_available ?? true,
      is_featured: menuPayload.is_featured ?? false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("menus")
      .update(updates)
      .eq("id", id)
      .select("*, categories(id, name)")
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle ketersediaan menu (Tersedia / Habis)
  async toggleAvailability(id, currentStatus) {
    const { data, error } = await supabase
      .from("menus")
      .update({
        is_available: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle rekomendasi / featured menu
  async toggleFeatured(id, currentStatus) {
    const { data, error } = await supabase
      .from("menus")
      .update({
        is_featured: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Hapus menu beserta file gambar di storage
  async delete(id, imageUrl = null) {
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await storageService.deleteImage("menu-images", imageUrl);
    }

    return true;
  },
};
