import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const liveMusicService = {
  async getAll() {
    const { data, error } = await supabase
      .from("live_music_schedules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActive() {
    const { data, error } = await supabase
      .from("live_music_schedules")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload, imageFile = null) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await storageService.uploadImage("livemusic-images", imageFile);
    }

    const record = {
      title: payload.title.trim(),
      performer: payload.performer?.trim() || "",
      day_time: payload.day_time.trim(),
      description: payload.description?.trim() || "",
      image_url: imageUrl,
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("live_music_schedules")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload, newImageFile = null, oldImageUrl = null) {
    let imageUrl = payload.image_url ?? oldImageUrl;

    if (newImageFile) {
      imageUrl = await storageService.uploadImage("livemusic-images", newImageFile);
      if (oldImageUrl) {
        await storageService.deleteImage("livemusic-images", oldImageUrl);
      }
    }

    const updates = {
      title: payload.title.trim(),
      performer: payload.performer?.trim() || "",
      day_time: payload.day_time.trim(),
      description: payload.description?.trim() || "",
      image_url: imageUrl,
      is_active: payload.is_active ?? true,
    };

    const { data, error } = await supabase
      .from("live_music_schedules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleActive(id, currentStatus) {
    const { data, error } = await supabase
      .from("live_music_schedules")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id, imageUrl = null) {
    const { error } = await supabase
      .from("live_music_schedules")
      .delete()
      .eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await storageService.deleteImage("livemusic-images", imageUrl);
    }
    return true;
  },
};
