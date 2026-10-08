import { supabase } from "./supabase";

export const categoryService = {
  // Ambil semua kategori
  async getAll() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Tambah kategori baru
  async create(name) {
    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: cleanName, slug }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Perbarui kategori
  async update(id, name) {
    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("categories")
      .update({ name: cleanName, slug })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Hapus kategori
  async delete(id) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
