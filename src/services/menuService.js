import { supabase } from "./supabase";
import { storageService } from "./storageService";

// Helper regex untuk metadata promo tersemat di deskripsi
const PROMO_TAG_REGEX = /<!--PROMO:(.*?)-->/;

/**
 * Logika perhitungan potongan harga & promo:
 * Contoh: Normal 40.000, Diskon 12% -> Potongan 4.800, Harga Akhir 35.200
 */
export function calculatePromo({
  price,
  discount_percent,
  discount_amount,
  discounted_price,
  changedField,
}) {
  const normalPrice = Math.max(0, Number(price) || 0);

  // Jika input kosong string, pertahankan agar input dapat dihapus oleh admin
  if (changedField === "percent") {
    if (discount_percent === "" || discount_percent === null || discount_percent === undefined) {
      return {
        discount_percent: "",
        discount_amount: "",
        discounted_price: normalPrice,
      };
    }
    const percentNum = Number(discount_percent);
    if (isNaN(percentNum)) {
      return {
        discount_percent: discount_percent,
        discount_amount: "",
        discounted_price: normalPrice,
      };
    }
    // Admin bebas input berapa pun persennya (misal: 22, 23, 12.5, 33, dll.)
    const clampedPercent = Math.min(100, Math.max(0, percentNum));
    const amount = Math.round((normalPrice * clampedPercent) / 100);
    const finalPrice = Math.max(0, normalPrice - amount);
    return {
      discount_percent: discount_percent, // Biarkan nilai yang diketik pengguna (misal "22" atau "23")
      discount_amount: amount,
      discounted_price: finalPrice,
    };
  }

  if (changedField === "amount") {
    if (discount_amount === "" || discount_amount === null || discount_amount === undefined) {
      return {
        discount_percent: "",
        discount_amount: "",
        discounted_price: normalPrice,
      };
    }
    const amountNum = Number(discount_amount);
    if (isNaN(amountNum)) {
      return {
        discount_percent: "",
        discount_amount: discount_amount,
        discounted_price: normalPrice,
      };
    }
    const clampedAmount = Math.min(normalPrice, Math.max(0, amountNum));
    const percent =
      normalPrice > 0
        ? Number(((clampedAmount / normalPrice) * 100).toFixed(1))
        : 0;
    const finalPrice = Math.max(0, normalPrice - clampedAmount);
    return {
      discount_percent: percent,
      discount_amount: clampedAmount,
      discounted_price: finalPrice,
    };
  }

  if (changedField === "finalPrice") {
    if (discounted_price === "" || discounted_price === null || discounted_price === undefined) {
      return {
        discount_percent: "",
        discount_amount: "",
        discounted_price: "",
      };
    }
    const finalNum = Number(discounted_price);
    if (isNaN(finalNum)) {
      return {
        discount_percent: "",
        discount_amount: "",
        discounted_price: discounted_price,
      };
    }
    const clampedFinal = Math.min(normalPrice, Math.max(0, finalNum));
    const amount = Math.max(0, normalPrice - clampedFinal);
    const percent =
      normalPrice > 0
        ? Number(((amount / normalPrice) * 100).toFixed(1))
        : 0;
    return {
      discount_percent: percent,
      discount_amount: amount,
      discounted_price: clampedFinal,
    };
  }

  // Default kalkulasi sinkronisasi
  const percentNum = Number(discount_percent) || 0;
  const amountNum = Number(discount_amount) || 0;
  if (percentNum > 0) {
    const amount = Math.round((normalPrice * percentNum) / 100);
    return {
      discount_percent: percentNum,
      discount_amount: amount,
      discounted_price: Math.max(0, normalPrice - amount),
    };
  } else if (amountNum > 0) {
    const percent =
      normalPrice > 0
        ? Number(((amountNum / normalPrice) * 100).toFixed(1))
        : 0;
    return {
      discount_percent: percent,
      discount_amount: amountNum,
      discounted_price: Math.max(0, normalPrice - amountNum),
    };
  }

  return {
    discount_percent: 0,
    discount_amount: 0,
    discounted_price: normalPrice,
  };
}

/**
 * Hitung estimasi waktu promo (sisa hari / jam) dan status kadaluarsa
 */
export function getPromoTimeInfo(promoEndDate, promoStartDate = null) {
  if (!promoEndDate) {
    return {
      is_expired: false,
      is_upcoming: false,
      remaining_time_text: "",
      formatted_end_date: "",
      formatted_start_date: "",
      formatted_range: "",
    };
  }

  const endD = new Date(promoEndDate);
  if (isNaN(endD.getTime())) {
    return {
      is_expired: false,
      is_upcoming: false,
      remaining_time_text: "",
      formatted_end_date: "",
      formatted_start_date: "",
      formatted_range: "",
    };
  }

  const now = new Date();
  const formatted_end_date = endD.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let formatted_start_date = "";
  let is_upcoming = false;
  if (promoStartDate) {
    const startD = new Date(promoStartDate);
    if (!isNaN(startD.getTime())) {
      formatted_start_date = startD.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (startD.getTime() > now.getTime()) {
        is_upcoming = true;
      }
    }
  }

  const formatted_range = formatted_start_date
    ? `${formatted_start_date} — ${formatted_end_date}`
    : `s/d ${formatted_end_date}`;

  if (endD.getTime() < now.getTime()) {
    return {
      is_expired: true,
      is_upcoming: false,
      remaining_time_text: "Promo telah berakhir",
      formatted_end_date,
      formatted_start_date,
      formatted_range,
    };
  }

  const diffMs = endD.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let remaining_time_text = "";
  if (is_upcoming) {
    remaining_time_text = `Mulai ${formatted_start_date}`;
  } else if (diffDays > 1) {
    remaining_time_text = `Sisa ${diffDays} hari`;
  } else if (diffDays === 1) {
    remaining_time_text = `Hari terakhir promo`;
  } else {
    remaining_time_text = `Berakhir hari ini`;
  }

  return {
    is_expired: false,
    is_upcoming,
    remaining_time_text,
    formatted_end_date,
    formatted_start_date,
    formatted_range,
  };
}

/**
 * Sisipkan metadata promo ke dalam string deskripsi sebagai fallback
 */
export function encodeDescriptionWithPromo(cleanDesc, promoData) {
  const desc = (cleanDesc || "").replace(PROMO_TAG_REGEX, "").trim();
  if (!promoData || !promoData.is_promo) {
    return desc;
  }
  const meta = JSON.stringify({
    is_promo: true,
    discount_percent: Number(promoData.discount_percent) || 0,
    discount_amount: Number(promoData.discount_amount) || 0,
    discounted_price: Number(promoData.discounted_price) || 0,
    promo_start_date: promoData.promo_start_date || null,
    promo_end_date: promoData.promo_end_date || null,
  });
  return `${desc} <!--PROMO:${meta}-->`.trim();
}

/**
 * Parse data promo dari record menu (kolom tabel atau komentar deskripsi atau localStorage)
 */
export function parseMenuPromoData(item) {
  if (!item) return item;

  let is_promo = Boolean(item.is_promo);
  let discount_percent = Number(item.discount_percent) || 0;
  let discount_amount = Number(item.discount_amount) || 0;
  let discounted_price = Number(item.discounted_price) || 0;
  let promo_start_date = item.promo_start_date || null;
  let promo_end_date = item.promo_end_date || null;
  let cleanDescription = item.description || "";

  // 1. Cek metadata tag di description
  const match = (item.description || "").match(PROMO_TAG_REGEX);
  if (match) {
    cleanDescription = item.description.replace(PROMO_TAG_REGEX, "").trim();
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.is_promo) {
        is_promo = true;
        if (!discount_percent) discount_percent = Number(parsed.discount_percent) || 0;
        if (!discount_amount) discount_amount = Number(parsed.discount_amount) || 0;
        if (!discounted_price) discounted_price = Number(parsed.discounted_price) || 0;
        if (!promo_start_date && parsed.promo_start_date) promo_start_date = parsed.promo_start_date;
        if (!promo_end_date && parsed.promo_end_date) promo_end_date = parsed.promo_end_date;
      }
    } catch {
      // ignore
    }
  }

  // 2. Cek cache localStorage jika belum aktif
  if (!is_promo && typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`side_line_menu_promo_${item.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.is_promo) {
          is_promo = true;
          if (!discount_percent) discount_percent = Number(parsed.discount_percent) || 0;
          if (!discount_amount) discount_amount = Number(parsed.discount_amount) || 0;
          if (!discounted_price) discounted_price = Number(parsed.discounted_price) || 0;
          if (!promo_start_date && parsed.promo_start_date) promo_start_date = parsed.promo_start_date;
          if (!promo_end_date && parsed.promo_end_date) promo_end_date = parsed.promo_end_date;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Cek estimasi waktu promo / kadaluarsa
  const timeInfo = getPromoTimeInfo(promo_end_date, promo_start_date);
  if (timeInfo.is_expired) {
    // Jika batas waktu promo sudah terlewati, promo otomatis nonaktif
    is_promo = false;
  }

  // 4. Pastikan perhitungan konsisten jika promo aktif
  const normalPrice = Number(item.price) || 0;
  if (is_promo && (discount_percent > 0 || discount_amount > 0)) {
    if (!discounted_price) {
      if (discount_amount > 0) {
        discounted_price = Math.max(0, normalPrice - discount_amount);
      } else if (discount_percent > 0) {
        discounted_price = Math.round(normalPrice * (1 - discount_percent / 100));
      }
    }
    if (!discount_amount && discount_percent > 0) {
      discount_amount = Math.round((normalPrice * discount_percent) / 100);
    }
  } else if (!is_promo) {
    discount_percent = 0;
    discount_amount = 0;
    discounted_price = normalPrice;
  }

  return {
    ...item,
    description: cleanDescription,
    is_promo,
    is_expired: timeInfo.is_expired,
    is_upcoming: timeInfo.is_upcoming,
    promo_start_date,
    promo_end_date,
    remaining_time_text: timeInfo.remaining_time_text,
    formatted_start_date: timeInfo.formatted_start_date,
    formatted_end_date: timeInfo.formatted_end_date,
    formatted_range: timeInfo.formatted_range,
    discount_percent,
    discount_amount,
    discounted_price: is_promo ? (discounted_price || normalPrice) : normalPrice,
  };
}

export const menuService = {
  // Ambil semua menu dengan data kategori relasi
  async getAll(categoryId = null) {
    let query = supabase
      .from("menus")
      .select("*, categories(id, name)")
      .order("created_at", { ascending: false });

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const parsed = (data || []).map(parseMenuPromoData);

    // Auto-expire: patch DB in background for menus whose promo has expired
    const expiredIds = (data || [])
      .filter((row) => {
        if (!row.is_promo || !row.promo_end_date) return false;
        return new Date(row.promo_end_date).getTime() < Date.now();
      })
      .map((row) => row.id);

    if (expiredIds.length > 0) {
      // Fire-and-forget: update DB without blocking UI
      supabase
        .from("menus")
        .update({ is_promo: false, discount_percent: 0, discount_amount: 0 })
        .in("id", expiredIds)
        .then(() => {}) // silent, non-blocking
        .catch(() => {}); // ignore errors silently
    }

    return parsed;
  },

  // Tambah menu baru beserta upload foto (jika ada)
  async create(menuPayload, imageFile = null) {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await storageService.uploadImage("menu-images", imageFile);
    }

    const isPromo = Boolean(menuPayload.is_promo);
    const discPercent = Number(menuPayload.discount_percent) || 0;
    const discAmount = Number(menuPayload.discount_amount) || 0;
    const discPrice = Number(menuPayload.discounted_price) || 0;
    const promoStartDate = menuPayload.promo_start_date || null;
    const promoEndDate = menuPayload.promo_end_date || null;

    // Persiapkan deskripsi dengan metadata tersemat
    const finalDescription = encodeDescriptionWithPromo(
      menuPayload.description,
      {
        is_promo: isPromo,
        discount_percent: discPercent,
        discount_amount: discAmount,
        discounted_price: discPrice,
        promo_start_date: promoStartDate,
        promo_end_date: promoEndDate,
      }
    );

    const baseRecord = {
      name: menuPayload.name.trim(),
      description: finalDescription,
      price: Number(menuPayload.price) || 0,
      category_id: menuPayload.category_id || null,
      image_url: imageUrl,
      is_available: menuPayload.is_available ?? true,
      is_featured: isPromo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const fullRecord = {
      ...baseRecord,
      is_promo: isPromo,
      discount_percent: discPercent,
      discount_amount: discAmount,
      discounted_price: discPrice,
      promo_start_date: promoStartDate,
      promo_end_date: promoEndDate,
    };

    let resultData = null;

    // Coba simpan dengan kolom promo & batas waktu
    try {
      const { data, error } = await supabase
        .from("menus")
        .insert([fullRecord])
        .select("*, categories(id, name)")
        .single();

      if (error) {
        if (
          error.code === "42703" ||
          error.message?.includes("discount") ||
          error.message?.includes("promo_")
        ) {
          // Fallback tanpa kolom baru
          const { data: fbData, error: fbError } = await supabase
            .from("menus")
            .insert([baseRecord])
            .select("*, categories(id, name)")
            .single();
          if (fbError) throw fbError;
          resultData = fbData;
        } else {
          throw error;
        }
      } else {
        resultData = data;
      }
    } catch (err) {
      if (
        err.code === "42703" ||
        err.message?.includes("discount") ||
        err.message?.includes("promo_")
      ) {
        const { data: fbData, error: fbError } = await supabase
          .from("menus")
          .insert([baseRecord])
          .select("*, categories(id, name)")
          .single();
        if (fbError) throw fbError;
        resultData = fbData;
      } else {
        throw err;
      }
    }

    // Simpan di local storage cache
    if (resultData && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `side_line_menu_promo_${resultData.id}`,
          JSON.stringify({
            is_promo: isPromo,
            discount_percent: discPercent,
            discount_amount: discAmount,
            discounted_price: discPrice,
            promo_start_date: promoStartDate,
            promo_end_date: promoEndDate,
          })
        );
      } catch {
        // ignore
      }
    }

    return parseMenuPromoData({
      ...resultData,
      promo_start_date: promoStartDate,
      promo_end_date: promoEndDate,
    });
  },

  // Perbarui menu dan ganti foto (jika ada upload baru)
  async update(id, menuPayload, newImageFile = null, oldImageUrl = null) {
    let imageUrl = menuPayload.image_url ?? oldImageUrl;

    if (newImageFile) {
      imageUrl = await storageService.uploadImage("menu-images", newImageFile);
      if (oldImageUrl) {
        await storageService.deleteImage("menu-images", oldImageUrl);
      }
    }

    const isPromo = Boolean(menuPayload.is_promo);
    const discPercent = Number(menuPayload.discount_percent) || 0;
    const discAmount = Number(menuPayload.discount_amount) || 0;
    const discPrice = Number(menuPayload.discounted_price) || 0;
    const promoStartDate = menuPayload.promo_start_date || null;
    const promoEndDate = menuPayload.promo_end_date || null;

    const finalDescription = encodeDescriptionWithPromo(
      menuPayload.description,
      {
        is_promo: isPromo,
        discount_percent: discPercent,
        discount_amount: discAmount,
        discounted_price: discPrice,
        promo_start_date: promoStartDate,
        promo_end_date: promoEndDate,
      }
    );

    const baseUpdates = {
      name: menuPayload.name.trim(),
      description: finalDescription,
      price: Number(menuPayload.price) || 0,
      category_id: menuPayload.category_id || null,
      image_url: imageUrl,
      is_available: menuPayload.is_available ?? true,
      is_featured: isPromo,
      updated_at: new Date().toISOString(),
    };

    const fullUpdates = {
      ...baseUpdates,
      is_promo: isPromo,
      discount_percent: discPercent,
      discount_amount: discAmount,
      discounted_price: discPrice,
      promo_start_date: promoStartDate,
      promo_end_date: promoEndDate,
    };

    let resultData = null;

    try {
      const { data, error } = await supabase
        .from("menus")
        .update(fullUpdates)
        .eq("id", id)
        .select("*, categories(id, name)")
        .single();

      if (error) {
        if (
          error.code === "42703" ||
          error.message?.includes("discount") ||
          error.message?.includes("promo_")
        ) {
          const { data: fbData, error: fbError } = await supabase
            .from("menus")
            .update(baseUpdates)
            .eq("id", id)
            .select("*, categories(id, name)")
            .single();
          if (fbError) throw fbError;
          resultData = fbData;
        } else {
          throw error;
        }
      } else {
        resultData = data;
      }
    } catch (err) {
      if (
        err.code === "42703" ||
        err.message?.includes("discount") ||
        err.message?.includes("promo_")
      ) {
        const { data: fbData, error: fbError } = await supabase
          .from("menus")
          .update(baseUpdates)
          .eq("id", id)
          .select("*, categories(id, name)")
          .single();
        if (fbError) throw fbError;
        resultData = fbData;
      } else {
        throw err;
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `side_line_menu_promo_${id}`,
          JSON.stringify({
            is_promo: isPromo,
            discount_percent: discPercent,
            discount_amount: discAmount,
            discounted_price: discPrice,
            promo_start_date: promoStartDate,
            promo_end_date: promoEndDate,
          })
        );
      } catch {
        // ignore
      }
    }

    return parseMenuPromoData({
      ...resultData,
      promo_start_date: promoStartDate,
      promo_end_date: promoEndDate,
    });
  },

  // Toggle ketersediaan menu (Tersedia / Habis)
  async toggleAvailability(id, currentStatus) {
    const { data, error } = await supabase
      .from("menus")
      .update({
        is_available: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle promo potongan harga
  async togglePromo(menu) {
    const newIsPromo = !menu.is_promo;
    const calc = calculatePromo({
      price: menu.price,
      discount_percent: newIsPromo ? menu.discount_percent || 12 : 0,
      changedField: "percent",
    });

    const payload = {
      ...menu,
      is_promo: newIsPromo,
      discount_percent: newIsPromo ? menu.discount_percent || 12 : 0,
      discount_amount: newIsPromo
        ? menu.discount_amount || calc.discount_amount
        : 0,
      discounted_price: newIsPromo
        ? menu.discounted_price || calc.discounted_price
        : menu.price,
      promo_end_date: newIsPromo ? menu.promo_end_date || null : null,
    };

    return await this.update(menu.id, payload, null, menu.image_url);
  },

  // Toggle rekomendasi / featured menu (tetap dipertahankan untuk kompatibilitas)
  async toggleFeatured(id, currentStatus) {
    const { data, error } = await supabase
      .from("menus")
      .update({
        is_featured: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Hapus menu beserta file gambar di storage
  async delete(id, imageUrl = null) {
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) throw error;

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`side_line_menu_promo_${id}`);
      } catch {
        // ignore
      }
    }

    if (imageUrl) {
      await storageService.deleteImage("menu-images", imageUrl);
    }

    return true;
  },
};
