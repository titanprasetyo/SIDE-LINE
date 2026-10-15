import { supabase } from "./supabase";
import { storageService } from "./storageService";

const LOCAL_EVENTS_KEY = "side_line_local_events";

function getLocalEvents() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export const eventService = {
  // Ambil semua event cafe
  async getAll() {
    let remoteData = [];
    try {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        remoteData = data;
      }
    } catch (err) {
      console.warn("Gagal mengambil event dari remote Supabase:", err);
    }

    const localData = getLocalEvents();

    // Gabungkan remote dan local (hindari duplikat id)
    const remoteIds = new Set(remoteData.map((d) => d.id));
    const combined = [
      ...remoteData,
      ...localData.filter((l) => !remoteIds.has(l.id)),
    ];

    return combined.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  },

  // Tambah event baru
  async create(eventPayload, imageFile = null) {
    let imageUrl = null;
    if (imageFile) {
      try {
        imageUrl = await storageService.uploadImage("promo-images", imageFile);
      } catch {
        try {
          imageUrl = await storageService.uploadImage("gallery-images", imageFile);
        } catch {
          imageUrl = await fileToDataUrl(imageFile);
        }
      }
    }

    const record = {
      title: eventPayload.title.trim(),
      description: eventPayload.description?.trim() || "",
      start_date: eventPayload.start_date || null,
      end_date: eventPayload.end_date || null,
      is_active: eventPayload.is_active ?? true,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("promos")
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Gagal simpan event ke Supabase, fallback ke local storage:", err);
      // Fallback simpan secara lokal agar tidak menggagalkan aksi admin
      const localRecord = {
        ...record,
        id: "local_evt_" + Date.now(),
      };
      const locals = getLocalEvents();
      saveLocalEvents([localRecord, ...locals]);
      return localRecord;
    }
  },

  // Perbarui data event
  async update(id, eventPayload, newImageFile = null, oldImageUrl = null) {
    let imageUrl = eventPayload.image_url ?? oldImageUrl;

    if (newImageFile) {
      try {
        imageUrl = await storageService.uploadImage("promo-images", newImageFile);
      } catch {
        try {
          imageUrl = await storageService.uploadImage("gallery-images", newImageFile);
        } catch {
          imageUrl = await fileToDataUrl(newImageFile);
        }
      }
      if (oldImageUrl && !oldImageUrl.startsWith("data:")) {
        await storageService.deleteImage("promo-images", oldImageUrl).catch(() => {});
      }
    }

    const updates = {
      title: eventPayload.title.trim(),
      description: eventPayload.description?.trim() || "",
      start_date: eventPayload.start_date || null,
      end_date: eventPayload.end_date || null,
      is_active: eventPayload.is_active ?? true,
      image_url: imageUrl,
    };

    try {
      const { data, error } = await supabase
        .from("promos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Gagal update event ke Supabase, update di local storage:", err);
      const locals = getLocalEvents();
      const idx = locals.findIndex((e) => e.id === id);
      if (idx !== -1) {
        locals[idx] = { ...locals[idx], ...updates };
        saveLocalEvents(locals);
        return locals[idx];
      }
      const newLocal = { ...updates, id, created_at: new Date().toISOString() };
      saveLocalEvents([newLocal, ...locals]);
      return newLocal;
    }
  },

  // Toggle status event aktif / non-aktif
  async toggleActive(id, currentStatus) {
    try {
      const { data, error } = await supabase
        .from("promos")
        .update({ is_active: !currentStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch {
      const locals = getLocalEvents();
      const idx = locals.findIndex((e) => e.id === id);
      if (idx !== -1) {
        locals[idx].is_active = !currentStatus;
        saveLocalEvents(locals);
        return locals[idx];
      }
      return { id, is_active: !currentStatus };
    }
  },

  // Hapus event
  async delete(id, imageUrl = null) {
    try {
      const { error } = await supabase.from("promos").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // ignore remote error
    }

    const locals = getLocalEvents().filter((e) => e.id !== id);
    saveLocalEvents(locals);

    if (imageUrl && !imageUrl.startsWith("data:")) {
      await storageService.deleteImage("promo-images", imageUrl).catch(() => {});
    }
    return true;
  },
};
