import { describe, it, expect } from "vitest";
import {
  ALLOWED_BUCKETS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  ALLOWED_VIDEO_MIME_TYPES,
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_VIDEO_FILE_SIZE,
  validateImageFile,
  validateMediaFile,
} from "../src/services/storageService";

describe("Security Audit: Storage Image Upload Hardening", () => {
  it("harus memiliki whitelist bucket yang tepat", () => {
    expect(ALLOWED_BUCKETS).toContain("menu-images");
    expect(ALLOWED_BUCKETS).toContain("gallery-images");
    expect(ALLOWED_BUCKETS).toContain("promo-images");
    expect(ALLOWED_BUCKETS).toContain("hero-images");
    expect(ALLOWED_BUCKETS).toContain("team-images");
    expect(ALLOWED_BUCKETS).toContain("cafe-assets");
    expect(ALLOWED_BUCKETS).not.toContain("system-secrets");
  });

  it("harus membatasi ukuran file foto maksimum 5MB", () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it("harus menolak file foto jika ukuran melebihi batas 5MB", async () => {
    const oversizedFile = {
      name: "big-image.jpg",
      type: "image/jpeg",
      size: 6 * 1024 * 1024, // 6 MB
    };
    await expect(validateImageFile(oversizedFile)).rejects.toThrow(/terlalu besar/);
  });

  it("harus menolak tipe MIME berbahaya seperti script atau executable", async () => {
    const maliciousFiles = [
      { name: "payload.exe", type: "application/x-msdownload", size: 1024 },
      { name: "script.js", type: "application/javascript", size: 1024 },
      { name: "page.html", type: "text/html", size: 1024 },
      { name: "vector.svg", type: "image/svg+xml", size: 1024 }, // SVG berpotensi XSS
      { name: "shell.php", type: "application/x-php", size: 1024 },
    ];

    for (const file of maliciousFiles) {
      await expect(validateImageFile(file)).rejects.toThrow();
    }
  });

  it("harus menolak ekstensi file foto yang tidak ada dalam whitelist", async () => {
    const badExtFile = {
      name: "image.php.jpg.exe",
      type: "image/jpeg",
      size: 2048,
    };
    await expect(validateImageFile(badExtFile)).rejects.toThrow(/Ekstensi file/);
  });

  it("harus menerima metadata file gambar yang valid (JPEG, PNG, WEBP, AVIF)", async () => {
    const validJpg = {
      name: "coffee.jpg",
      type: "image/jpeg",
      size: 500 * 1024,
    };
    await expect(validateImageFile(validJpg)).resolves.toBe(true);

    const validPng = {
      name: "banner.png",
      type: "image/png",
      size: 800 * 1024,
    };
    await expect(validateImageFile(validPng)).resolves.toBe(true);
  });
});

describe("Security Audit: Gallery Video Upload Hardening (Maks 20MB)", () => {
  it("harus mengonfigurasi batas maksimal ukuran video 20 MB", () => {
    expect(MAX_VIDEO_FILE_SIZE).toBe(20 * 1024 * 1024);
    expect(ALLOWED_VIDEO_MIME_TYPES).toContain("video/mp4");
    expect(ALLOWED_VIDEO_MIME_TYPES).toContain("video/webm");
    expect(ALLOWED_VIDEO_MIME_TYPES).toContain("video/quicktime");
    expect(ALLOWED_VIDEO_EXTENSIONS).toContain("mp4");
    expect(ALLOWED_VIDEO_EXTENSIONS).toContain("webm");
    expect(ALLOWED_VIDEO_EXTENSIONS).toContain("mov");
  });

  it("harus menerima video valid berukuran hingga 20 MB jika allowVideo diizinkan", async () => {
    const validVideo = {
      name: "ambience-reel.mp4",
      type: "video/mp4",
      size: 18 * 1024 * 1024, // 18 MB (lolos batas 20MB)
    };
    await expect(
      validateMediaFile(validVideo, { allowVideo: true })
    ).resolves.toBe(true);
  });

  it("harus MENOLAK video jika ukurannya melebihi 20 MB", async () => {
    const oversizedVideo = {
      name: "heavy-ambience.mp4",
      type: "video/mp4",
      size: 22 * 1024 * 1024, // 22 MB (melebihi 20MB)
    };
    await expect(
      validateMediaFile(oversizedVideo, { allowVideo: true })
    ).rejects.toThrow(/terlalu besar.*20 MB/i);
  });

  it("harus MENOLAK video jika allowVideo bernilai false", async () => {
    const videoFile = {
      name: "latte-art.mp4",
      type: "video/mp4",
      size: 5 * 1024 * 1024,
    };
    await expect(
      validateMediaFile(videoFile, { allowVideo: false })
    ).rejects.toThrow(/tidak diizinkan/i);
  });

  it("harus menolak format video berbahaya atau tidak didukung (mis. .avi, .flv, .exe)", async () => {
    const unallowedVideos = [
      { name: "video.avi", type: "video/x-msvideo", size: 5 * 1024 * 1024 },
      { name: "video.flv", type: "video/x-flv", size: 5 * 1024 * 1024 },
      { name: "malicious.mp4.exe", type: "application/x-msdownload", size: 5 * 1024 * 1024 },
    ];

    for (const vid of unallowedVideos) {
      await expect(
        validateMediaFile(vid, { allowVideo: true })
      ).rejects.toThrow();
    }
  });
});
