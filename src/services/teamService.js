import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const DEMO_TEAM_MEMBERS = [
  {
    name: "AARON LOEB",
    role: "Leader",
    bio: "Leader yang berdedikasi mengarahkan seluruh operasional, konsistensi rasa kopi, dan kenyamanan pengunjung SIDE LINE.",
    instagram: "@aaronloeb",
    order_index: 1,
    photo_url: "/team/aaron-loeb.png",
  },
  {
    name: "DREW FEIG",
    role: "Marketing",
    bio: "Menghubungkan cerita kopi SIDE LINE dengan komunitas lokal, program kemitraan kreatif, serta event musik dan seni.",
    instagram: "@drewfeig",
    order_index: 2,
    photo_url: "/team/drew-feig.png",
  },
  {
    name: "SACHA DUBOIS",
    role: "Employee",
    bio: "Barista terampil dengan kecermatan teknik manual brew dan pour-over, menghadirkan aroma terbaik di setiap cangkir.",
    instagram: "@sachadubois",
    order_index: 3,
    photo_url: "/team/sacha-dubois.png",
  },
  {
    name: "JULIANA SILVA",
    role: "Employee",
    bio: "Menyambut setiap pelanggan dengan senyuman tulus dan menjaga keramahan atmosfer bar tetap hangat setiap hari.",
    instagram: "@julianasilva",
    order_index: 4,
    photo_url: "/team/juliana-silva.png",
  },
];

export const DEFAULT_HEADER_SETTINGS = {
  title: "TIM KAMI",
  subtitle:
    "Dedikasi di balik setiap seduhan istimewa. Menjaga cita rasa autentik, aroma kopi terbaik, dan kehangatan ruang untuk setiap momen santai Anda.",
};

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
    let photoUrl = payload.photo_url || null;
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
      if (oldImageUrl && typeof oldImageUrl === "string" && oldImageUrl.includes("team-images")) {
        try {
          await storageService.deleteImage("team-images", oldImageUrl);
        } catch (e) {
          console.warn("Gagal menghapus gambar lama:", e);
        }
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

    if (photoUrl && typeof photoUrl === "string" && photoUrl.includes("team-images")) {
      try {
        await storageService.deleteImage("team-images", photoUrl);
      } catch (e) {
        console.warn("Gagal menghapus gambar tim dari storage:", e);
      }
    }
    return true;
  },

  getHeaderSettings() {
    if (typeof window === "undefined") return DEFAULT_HEADER_SETTINGS;
    try {
      const raw = localStorage.getItem("side_line_team_header");
      if (raw) {
        const parsed = JSON.parse(raw);
        const title =
          !parsed.title || parsed.title === "OUR TEAM"
            ? DEFAULT_HEADER_SETTINGS.title
            : parsed.title;
        const subtitle =
          !parsed.subtitle || parsed.subtitle.includes("Lorem ipsum")
            ? DEFAULT_HEADER_SETTINGS.subtitle
            : parsed.subtitle;
        return { title, subtitle };
      }
    } catch (e) {
      console.warn("Gagal parse team header settings:", e);
    }
    return DEFAULT_HEADER_SETTINGS;
  },

  saveHeaderSettings(settings) {
    if (typeof window === "undefined") return;
    const payload = {
      title: (settings?.title || DEFAULT_HEADER_SETTINGS.title).trim(),
      subtitle: (settings?.subtitle ?? DEFAULT_HEADER_SETTINGS.subtitle).trim(),
    };
    localStorage.setItem("side_line_team_header", JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent("side_line_team_header_changed", { detail: payload })
    );
    return payload;
  },

  // Muat 4 data contoh seperti di gambar referensi
  async seedDemoTemplates() {
    const results = [];
    for (const item of DEMO_TEAM_MEMBERS) {
      const created = await this.create(item);
      results.push(created);
    }
    return results;
  },
};
