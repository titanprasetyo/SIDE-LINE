import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const galleryService = {
  // Ambil semua foto & video galeri terurut dari yang terbaru
  async getAll() {
    const { data, error } = await supabase
      .from("galleries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((item) => ({
      ...item,
      media_type:
        item.media_type ||
        (/\.(mp4|webm|mov)$/i.test(item.image_url) ? "video" : "image"),
    }));
  },

  // Tambah media galeri baru (Foto maks 5MB atau Video maks 20MB)
  async create(title, mediaFile) {
    if (!mediaFile) {
      throw new Error("File foto atau video galeri wajib dipilih.");
    }

    const isVideo =
      mediaFile.type?.startsWith("video/") ||
      /\.(mp4|webm|mov)$/i.test(mediaFile.name);

    const mediaUrl = await storageService.uploadImage("gallery-images", mediaFile, {
      allowVideo: true,
    });

    const newRecord = {
      title: title?.trim() || (isVideo ? "Video Dokumentasi SIDE LINE" : "Suasana SIDE LINE"),
      image_url: mediaUrl,
      media_type: isVideo ? "video" : "image",
      created_at: new Date().toISOString(),
    };

    // Coba insert dengan media_type, fallback jika kolom media_type belum ada di postgres
    try {
      const { data, error } = await supabase
        .from("galleries")
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        if (error.code === "42703" || error.message?.includes("media_type")) {
          const { media_type, ...fallbackRecord } = newRecord;
          const { data: fbData, error: fbError } = await supabase
            .from("galleries")
            .insert([fallbackRecord])
            .select()
            .single();
          if (fbError) throw fbError;
          return { ...fbData, media_type: isVideo ? "video" : "image" };
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (err.code === "42703" || err.message?.includes("media_type")) {
        const { media_type, ...fallbackRecord } = newRecord;
        const { data: fbData, error: fbError } = await supabase
          .from("galleries")
          .insert([fallbackRecord])
          .select()
          .single();
        if (fbError) throw fbError;
        return { ...fbData, media_type: isVideo ? "video" : "image" };
      }
      throw err;
    }
  },

  // Perbarui keterangan media
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

  // Hapus foto/video dari database dan storage
  async delete(id, imageUrl) {
    const { error } = await supabase.from("galleries").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await storageService.deleteImage("gallery-images", imageUrl);
    }
    return true;
  },
};
