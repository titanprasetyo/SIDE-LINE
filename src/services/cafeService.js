import { supabase } from "./supabase";

export const cafeService = {
  // Ambil profil informasi café
  async get() {
    const { data, error } = await supabase
      .from("cafe_information")
      .select("*")
      .eq("id", 1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data || null;
  },

  // Perbarui informasi café
  async update(cafePayload) {
    const record = {
      id: 1,
      name: cafePayload.name?.trim() || "SIDE LINE",
      tagline: cafePayload.tagline?.trim() || "",
      about_text: cafePayload.about_text?.trim() || "",
      address: cafePayload.address?.trim() || "",
      google_maps_url: cafePayload.google_maps_url?.trim() || "",
      phone: cafePayload.phone?.trim() || "",
      instagram: cafePayload.instagram?.trim() || "",
      opening_hours: cafePayload.opening_hours?.trim() || "",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("cafe_information")
      .upsert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
