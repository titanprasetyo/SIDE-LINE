import { supabase } from "./supabase";

export const ALLOWED_BUCKETS = [
  "menu-images",
  "gallery-images",
  "promo-images",
  "hero-images",
  "team-images",
  "livemusic-images",
  "cafe-assets",
];

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];
export const MAX_VIDEO_FILE_SIZE = 20 * 1024 * 1024; // 20 MB (Sesuai kebutuhan galeri video)

/**
 * Memeriksa header biner (magic bytes) dari file gambar
 */
export async function verifyImageMagicBytes(file) {
  if (!file || typeof file.slice !== "function") {
    return false;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!reader.result || !(reader.result instanceof ArrayBuffer)) {
        return resolve(false);
      }
      const arr = new Uint8Array(reader.result);
      if (arr.length < 4) return resolve(false);

      // JPEG: FF D8 FF
      const isJpeg = arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff;

      // PNG: 89 50 4E 47
      const isPng =
        arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47;

      // WEBP: RIFF....WEBP (52 49 46 46 ... 57 45 42 50)
      const isRiff =
        arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46;
      let isWebp = false;
      if (isRiff && arr.length >= 12) {
        isWebp =
          arr[8] === 0x57 &&
          arr[9] === 0x45 &&
          arr[10] === 0x42 &&
          arr[11] === 0x50;
      }

      // AVIF: contains 'ftyp' at bytes 4-7
      let isAvif = false;
      if (arr.length >= 12) {
        const ftyp = String.fromCharCode(arr[4], arr[5], arr[6], arr[7]);
        if (ftyp === "ftyp") {
          const brand = String.fromCharCode(arr[8], arr[9], arr[10], arr[11]);
          if (brand === "avif" || brand === "mif1") {
            isAvif = true;
          }
        }
      }

      resolve(isJpeg || isPng || isWebp || isAvif);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 16));
  });
}

/**
 * Memeriksa header biner (magic bytes) dari file video (MP4, WebM, MOV)
 */
export async function verifyVideoMagicBytes(file) {
  if (!file || typeof file.slice !== "function") {
    return false;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!reader.result || !(reader.result instanceof ArrayBuffer)) {
        return resolve(false);
      }
      const arr = new Uint8Array(reader.result);
      if (arr.length < 4) return resolve(false);

      // WebM: 1A 45 DF A3 (EBML)
      const isWebm =
        arr[0] === 0x1a && arr[1] === 0x45 && arr[2] === 0xdf && arr[3] === 0xa3;

      // MP4 / QuickTime MOV: bytes 4-7 contain 'ftyp', 'moov', 'mdat', or 'wide'
      let isMp4OrMov = false;
      if (arr.length >= 8) {
        const box = String.fromCharCode(arr[4], arr[5], arr[6], arr[7]);
        if (box === "ftyp" || box === "moov" || box === "mdat" || box === "wide") {
          isMp4OrMov = true;
        }
      }

      resolve(isWebm || isMp4OrMov);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 16));
  });
}

/**
 * Validasi ketat file gambar sebelum diunggah ke storage
 */
export async function validateImageFile(file) {
  if (!file) {
    throw new Error("File gambar tidak ditemukan.");
  }

  // 1. Validasi ukuran file (Max 5MB)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimum gambar adalah 5 MB.`
    );
  }

  // 2. Validasi MIME Type
  if (!ALLOWED_MIME_TYPES.includes(file.type?.toLowerCase())) {
    throw new Error(
      `Format file "${file.type || "tidak diketahui"}" tidak didukung. Format gambar yang diizinkan: JPG, PNG, WEBP, atau AVIF.`
    );
  }

  // 3. Validasi Ekstensi File
  const fileExt = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    throw new Error(
      `Ekstensi file ".${fileExt}" tidak diizinkan. Gunakan file berekstensi .jpg, .jpeg, .png, .webp, atau .avif.`
    );
  }

  // 4. Validasi Magic Bytes (file biner asli)
  if (typeof FileReader !== "undefined") {
    const isRealImage = await verifyImageMagicBytes(file);
    if (!isRealImage) {
      throw new Error(
        "Verifikasi integritas file gagal: File bukan format gambar JPEG, PNG, WEBP, atau AVIF yang valid."
      );
    }
  }

  return true;
}

/**
 * Validasi umum media (Mendukung gambar maks 5MB & video maks 20MB di galeri)
 */
export async function validateMediaFile(file, { allowVideo = false } = {}) {
  if (!file) {
    throw new Error("File media tidak ditemukan.");
  }

  const isVideo =
    file.type?.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(file.name);

  if (isVideo) {
    if (!allowVideo) {
      throw new Error("Unggah video tidak diizinkan pada bagian ini.");
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      throw new Error(
        `Ukuran file video terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimum video adalah 20 MB.`
      );
    }

    if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.type?.toLowerCase())) {
      throw new Error(
        `Format video "${file.type || "tidak diketahui"}" tidak didukung. Format video yang diizinkan: MP4, WebM, atau MOV.`
      );
    }

    const fileExt = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(fileExt)) {
      throw new Error(
        `Ekstensi file video ".${fileExt}" tidak diizinkan. Gunakan file .mp4, .webm, atau .mov.`
      );
    }

    if (typeof FileReader !== "undefined") {
      const isRealVideo = await verifyVideoMagicBytes(file);
      if (!isRealVideo) {
        throw new Error(
          "Verifikasi integritas file gagal: File bukan format video MP4, WebM, atau MOV yang valid."
        );
      }
    }

    return true;
  }

  return await validateImageFile(file);
}

export const storageService = {
  // Upload file gambar/video ke bucket Supabase dengan validasi keamanan ketat
  async uploadImage(bucket, file, { allowVideo = false } = {}) {
    if (!file) return null;

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      throw new Error(`Bucket storage "${bucket}" tidak terdaftar dalam konfigurasi sistem.`);
    }

    const isVideo =
      file.type?.startsWith("video/") ||
      /\.(mp4|webm|mov)$/i.test(file.name);

    // Di bucket gallery-images, video otomatis diizinkan jika parameter allowVideo aktif atau bucket gallery
    const permitsVideo = allowVideo || bucket === "gallery-images";
    await validateMediaFile(file, { allowVideo: permitsVideo });

    const fileExt = (file.name.split(".").pop() || "").toLowerCase();
    const validExtensions = permitsVideo
      ? [...ALLOWED_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS]
      : ALLOWED_EXTENSIONS;
    const safeExt = validExtensions.includes(fileExt)
      ? fileExt
      : isVideo
      ? "mp4"
      : "jpg";

    const randomSuffix =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);
    const uniquePath = `${Date.now()}_${randomSuffix}.${safeExt}`;

    const contentType = file.type || (isVideo ? `video/${safeExt}` : `image/${safeExt}`);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(uniquePath);
    return data.publicUrl;
  },

  // Hapus file dari bucket Supabase berdasarkan public URL
  async deleteImage(bucket, imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return;

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      console.warn(`Peringatan: Bucket "${bucket}" tidak valid untuk penghapusan.`);
      return;
    }

    try {
      const parts = imageUrl.split(`/${bucket}/`);
      if (parts.length > 1) {
        const filePath = decodeURIComponent(parts[1]);
        if (filePath.includes("..") || filePath.startsWith("/")) {
          console.warn("Peringatan: Upaya manipulasi path file storage ditolak.");
          return;
        }

        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) {
          console.warn("Peringatan saat menghapus media storage:", error.message);
        }
      }
    } catch (err) {
      console.warn("Kesalahan parsing URL media saat delete:", err);
    }
  },
};
