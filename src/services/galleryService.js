import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const galleryService = {
  // Ambil semua foto galeri terurut dari yang terbaru
  async getAll() {
    const { data, error } = await supabase
      .from("galleries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Tambah foto galeri baru
  async create(title, imageFile) {
    if (!imageFile) {
      throw new Error("File foto galeri wajib dipilih.");
    }

    const imageUrl = await storageService.uploadImage("gallery-images", imageFile);

    const { data, error } = await supabase
      .from("galleries")
      .insert([
        {
          title: title?.trim() || "Suasana SIDE LINE",
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Perbarui judul foto
  async update(id, title) {
    const { data, error } = await supabase
      .from("galleries")
      .update({ title: title?.trim() || "" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Hapus foto dari database dan storage
  async delete(id, imageUrl) {
    const { error } = await supabase.from("galleries").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await storageService.deleteImage("gallery-images", imageUrl);
    }
    return true;
  },
};
