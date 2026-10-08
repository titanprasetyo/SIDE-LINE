import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const spaceBookingService = {
  async getAll() {
    const { data, error } = await supabase
      .from("space_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAvailable() {
    const { data, error } = await supabase
      .from("space_bookings")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload, imageFile = null) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await storageService.uploadImage("menu-images", imageFile);
    }

    const record = {
      name: payload.name.trim(),
      capacity: payload.capacity?.trim() || "",
      facilities: payload.facilities?.trim() || "",
      price_info: payload.price_info?.trim() || "",
      description: payload.description?.trim() || "",
      contact_phone: payload.contact_phone?.trim() || "",
      image_url: imageUrl,
      is_available: payload.is_available ?? true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("space_bookings")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload, newImageFile = null, oldImageUrl = null) {
    let imageUrl = payload.image_url ?? oldImageUrl;

    if (newImageFile) {
      imageUrl = await storageService.uploadImage("menu-images", newImageFile);
      if (oldImageUrl) {
        await storageService.deleteImage("menu-images", oldImageUrl);
      }
    }

    const updates = {
      name: payload.name.trim(),
      capacity: payload.capacity?.trim() || "",
      facilities: payload.facilities?.trim() || "",
      price_info: payload.price_info?.trim() || "",
      description: payload.description?.trim() || "",
      contact_phone: payload.contact_phone?.trim() || "",
      image_url: imageUrl,
      is_available: payload.is_available ?? true,
    };

    const { data, error } = await supabase
      .from("space_bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleAvailability(id, currentStatus) {
    const { data, error } = await supabase
      .from("space_bookings")
      .update({ is_available: !currentStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id, imageUrl = null) {
    const { error } = await supabase
      .from("space_bookings")
      .delete()
      .eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await storageService.deleteImage("menu-images", imageUrl);
    }
    return true;
  },
};
