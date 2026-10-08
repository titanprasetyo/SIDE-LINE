import { supabase } from "./supabase";

export const storageService = {
  // Upload file gambar ke bucket Supabase
  async uploadImage(bucket, file) {
    if (!file) return null;

    // Bersihkan nama file dan buat unik dengan timestamp
    const fileExt = file.name.split(".").pop();
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const uniquePath = `${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Dapatkan URL publik gambar
    const { data } = supabase.storage.from(bucket).getPublicUrl(uniquePath);

    return data.publicUrl;
  },

  // Hapus file gambar dari bucket Supabase berdasarkan public URL
  async deleteImage(bucket, imageUrl) {
    if (!imageUrl) return;

    try {
      const parts = imageUrl.split(`/${bucket}/`);
      if (parts.length > 1) {
        const filePath = decodeURIComponent(parts[1]);
        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) {
          console.warn("Peringatan saat menghapus gambar storage:", error.message);
        }
      }
    } catch (err) {
      console.warn("Kesalahan parsing URL gambar saat delete:", err);
    }
  },
};
