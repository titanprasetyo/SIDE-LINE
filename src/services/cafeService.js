import { supabase } from "./supabase";
import { storageService } from "./storageService";

export const cafeService = {
  // Ambil profil informasi cafe
  async get() {
    let data = null;
    try {
      const res = await supabase
        .from("cafe_information")
        .select("*")
        .eq("id", 1)
        .single();

      if (res.error && res.error.code !== "PGRST116") {
        throw res.error;
      }
      data = res.data;
    } catch (err) {
      console.warn("Peringatan saat mengambil cafe_information:", err);
    }

    // Periksa backup logo di localStorage jika ada
    const localLogo =
      typeof window !== "undefined"
        ? localStorage.getItem("side_line_cafe_logo")
        : null;

    const defaultAddress = "Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan";
    const defaultMapsUrl = "https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan";

    if (data) {
      if (!data.logo_url && localLogo) {
        data.logo_url = localLogo;
      }
      if (!data.address || /contoh/i.test(data.address)) {
        data.address = defaultAddress;
      }
      if (!data.google_maps_url || data.google_maps_url === "https://maps.google.com") {
        data.google_maps_url = defaultMapsUrl;
      }
      return data;
    }

    return {
      id: 1,
      name: "SIDE LINE",
      logo_url: localLogo || "",
      address: defaultAddress,
      google_maps_url: defaultMapsUrl,
      opening_hours: "Setiap Hari: 09:00 - 22:00 WIB"
    };
  },

  // Perbarui informasi cafe
  async update(cafePayload, logoFile = null) {
    let logoUrl = cafePayload.logo_url || "";

    // Jika admin upload file logo baru
    if (logoFile) {
      try {
        logoUrl = await storageService.uploadImage("menu-images", logoFile);
      } catch (uploadErr) {
        console.warn("Upload logo ke storage gagal, menggunakan base64 fallback:", uploadErr);
        logoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(logoFile);
        });
      }
    }

    // Simpan ke localStorage dan kirim event untuk update realtime navbar
    if (typeof window !== "undefined") {
      if (logoUrl) {
        localStorage.setItem("side_line_cafe_logo", logoUrl);
      } else {
        localStorage.removeItem("side_line_cafe_logo");
      }
      window.dispatchEvent(
        new CustomEvent("side_line_logo_changed", {
          detail: { logo_url: logoUrl },
        })
      );
    }

    const baseRecord = {
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

    // Coba simpan ke Supabase dengan kolom logo_url
    try {
      const { data, error } = await supabase
        .from("cafe_information")
        .upsert({ ...baseRecord, logo_url: logoUrl })
        .select()
        .single();

      if (error) {
        // Jika kolom logo_url belum dibuat di SQL Supabase (error 42703), fallback simpan baseRecord
        if (error.code === "42703" || error.message?.includes("logo_url")) {
          const { data: fbData, error: fbErr } = await supabase
            .from("cafe_information")
            .upsert(baseRecord)
            .select()
            .single();
          if (fbErr) throw fbErr;
          return { ...fbData, logo_url: logoUrl };
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (err.code === "42703" || err.message?.includes("logo_url")) {
        const { data: fbData, error: fbErr } = await supabase
          .from("cafe_information")
          .upsert(baseRecord)
          .select()
          .single();
        if (fbErr) throw fbErr;
        return { ...fbData, logo_url: logoUrl };
      }
      throw err;
    }
  },
};
