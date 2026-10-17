import { useState, useEffect, useCallback } from "react";
import { galleryService } from "../../services/galleryService";
import {
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Video,
  Play,
} from "lucide-react";

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [isVideoFile, setIsVideoFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load photos & videos
  const reloadGalleries = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await galleryService.getAll();
      setGalleries(data || []);
    } catch (err) {
      setErrorMsg("Gagal memuat galeri: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await galleryService.getAll();
        if (!ignore) {
          setGalleries(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat galeri: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle pilih file foto / video
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo =
        file.type?.startsWith("video/") ||
        /\.(mp4|webm|mov)$/i.test(file.name);

      if (isVideo) {
        // Batas ukuran video: 20 MB
        if (file.size > 20 * 1024 * 1024) {
          alert(`Ukuran video terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB)! Batas maksimal video adalah 20 MB.`);
          e.target.value = "";
          return;
        }
        setIsVideoFile(true);
      } else {
        // Batas ukuran foto: 5 MB
        if (file.size > 5 * 1024 * 1024) {
          alert(`Ukuran foto terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB)! Batas maksimal foto adalah 5 MB.`);
          e.target.value = "";
          return;
        }
        setIsVideoFile(false);
      }

      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle("");
    setMediaFile(null);
    setMediaPreview("");
    setIsVideoFile(false);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit Judul
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title || "");
    setMediaFile(null);
    setMediaPreview(item.image_url);
    setIsVideoFile(
      item.media_type === "video" || /\.(mp4|webm|mov)$/i.test(item.image_url)
    );
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setMediaFile(null);
    setMediaPreview("");
    setIsVideoFile(false);
  };

  // Submit Simpan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem && !mediaFile) {
      setErrorMsg("Harap pilih file foto atau video yang ingin diupload!");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (editingItem) {
        await galleryService.update(editingItem.id, title);
        setSuccessMsg("Keterangan media berhasil diperbarui!");
      } else {
        await galleryService.create(title, mediaFile);
        setSuccessMsg(
          isVideoFile
            ? "Video suasana cafe berhasil ditambahkan ke galeri!"
            : "Foto suasana cafe berhasil ditambahkan ke galeri!"
        );
      }

      handleCloseModal();
      await reloadGalleries();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan galeri: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Media
  const handleDelete = async (item) => {
    const isVideo =
      item.media_type === "video" || /\.(mp4|webm|mov)$/i.test(item.image_url);
    const mediaLabel = isVideo ? "video" : "foto";

    if (!window.confirm(`Hapus ${mediaLabel} "${item.title || "Galeri"}" ini secara permanen?`)) {
      return;
    }

    try {
      setErrorMsg("");
      await galleryService.delete(item.id, item.image_url);
      setSuccessMsg(`${isVideo ? "Video" : "Foto"} berhasil dihapus dari galeri.`);
      await reloadGalleries();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus media: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <ImageIcon className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Galeri Visual & Video
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {galleries.length} Media
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Koleksi dokumentasi foto suasana cafe serta video aktivitas seduhan & keramahan pengunjung
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <UploadCloud className="h-4 w-4 stroke-[2.5]" />
          <span>Upload Media Baru</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-xs sm:text-sm text-emerald-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium truncate">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50/90 border border-rose-200/80 p-3.5 text-xs sm:text-sm text-rose-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-medium truncate">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-600 hover:text-rose-800 p-0.5 rounded cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Grid Galeri */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-zinc-200/80 bg-white text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat galeri media...</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <ImageIcon className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Belum ada foto atau video di galeri
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Unggah dokumentasi suasana atau video pendek cafe untuk memperkuat citra visual dan daya tarik tempat.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Media Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {galleries.map((item) => {
              const isVideo =
                item.media_type === "video" ||
                /\.(mp4|webm|mov)$/i.test(item.image_url);

              return (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-900 border-b border-zinc-100">
                      {isVideo ? (
                        <video
                          src={item.image_url}
                          muted
                          loop
                          playsInline
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                          onMouseEnter={(e) => e.target.play().catch(() => {})}
                          onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                        />
                      ) : (
                        <img
                          src={item.image_url}
                          alt={item.title || "Foto Galeri"}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}

                      {/* Badge Jenis Media */}
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-black/75 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono font-bold text-white flex items-center gap-1 shadow-xs border border-white/10">
                        {isVideo ? (
                          <>
                            <Video className="h-2.5 w-2.5 text-rose-400" />
                            <span>VIDEO</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-2.5 w-2.5 text-amber-400" />
                            <span>FOTO</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-3.5">
                      <p className="font-semibold text-sm text-zinc-900 truncate" title={item.title}>
                        {item.title || "Dokumentasi SIDE LINE"}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition cursor-pointer"
                      title="Ubah Keterangan"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Hapus Media"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Upload & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  {isVideoFile ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingItem ? "Edit Keterangan Media" : "Upload Media Galeri"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              {editingItem
                ? "Perbarui keterangan foto atau video dokumentasi cafe."
                : "Unggah foto suasana (JPG/PNG maks 5MB) atau video pendek (MP4/WebM maks 20MB)."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Judul / Keterangan Media
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Suasana Sunset Lantai 2 / Video Latte Art"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              {!editingItem && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Pilih File Foto atau Video <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
                    onChange={handleMediaChange}
                    className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Batas: Foto maks 5 MB | Video (MP4/WebM/MOV) maks 20 MB
                  </p>
                </div>
              )}

              {mediaPreview && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-zinc-600 mb-1.5">
                    Preview {isVideoFile ? "Video" : "Foto"}:
                  </p>
                  <div className="relative rounded-lg overflow-hidden border border-zinc-200 bg-black">
                    {isVideoFile ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="h-44 w-full object-contain"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="h-44 w-full object-cover"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : isVideoFile ? "Upload Video (Maks 20MB)" : "Upload Foto"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}