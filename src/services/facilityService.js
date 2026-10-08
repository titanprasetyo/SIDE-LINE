import { supabase } from "./supabase";

export const facilityService = {
  async getAll() {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(payload) {
    const record = {
      name: payload.name.trim(),
      icon: payload.icon?.trim() || "✨",
      description: payload.description?.trim() || "",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("facilities")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const updates = {
      name: payload.name.trim(),
      icon: payload.icon?.trim() || "✨",
      description: payload.description?.trim() || "",
    };

    const { data, error } = await supabase
      .from("facilities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("facilities").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
