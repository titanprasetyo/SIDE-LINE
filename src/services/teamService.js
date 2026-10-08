import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const teamService = {
  async getAll() {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(payload, imageFile = null) {
    let photoUrl = null;
    if (imageFile) {
      photoUrl = await storageService.uploadImage("team-images", imageFile);
    }

    const record = {
      name: payload.name.trim(),
      role: payload.role.trim(),
      bio: payload.bio?.trim() || "",
      instagram: payload.instagram?.trim() || "",
      order_index: Number(payload.order_index) || 0,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("teams")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload, newImageFile = null, oldImageUrl = null) {
    let photoUrl = payload.photo_url ?? oldImageUrl;

    if (newImageFile) {
      photoUrl = await storageService.uploadImage("team-images", newImageFile);
      if (oldImageUrl) {
        await storageService.deleteImage("team-images", oldImageUrl);
      }
    }

    const updates = {
      name: payload.name.trim(),
      role: payload.role.trim(),
      bio: payload.bio?.trim() || "",
      instagram: payload.instagram?.trim() || "",
      order_index: Number(payload.order_index) || 0,
      photo_url: photoUrl,
    };

    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id, photoUrl = null) {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) throw error;

    if (photoUrl) {
      await storageService.deleteImage("team-images", photoUrl);
    }
    return true;
  },
};
