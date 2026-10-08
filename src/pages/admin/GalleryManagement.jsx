import { useState, useEffect, useCallback } from "react";
import { galleryService } from "../../services/galleryService";

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load photos
  const reloadGalleries = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await galleryService.getAll();
      setGalleries(data);
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
          setGalleries(data);
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

  // Handle pilih file foto
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Ukuran file maksimal 3 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle("");
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit Judul
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setImageFile(null);
    setImagePreview(item.image_url);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreview("");
  };

  // Submit Simpan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem && !imageFile) {
      setErrorMsg("Harap pilih foto yang ingin diupload!");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (editingItem) {
        await galleryService.update(editingItem.id, title);
        setSuccessMsg("Judul foto berhasil diperbarui!");
      } else {
        await galleryService.create(title, imageFile);
        setSuccessMsg("Foto galeri berhasil ditambahkan!");
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

  // Hapus Foto
  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus foto "${item.title || "Galeri"}" ini secara permanen?`)) {
      return;
    }

    try {
      setErrorMsg("");
      await galleryService.delete(item.id, item.image_url);
      setSuccessMsg("Foto berhasil dihapus.");
      await reloadGalleries();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus foto: " + err.message);
    }
  };

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gallery Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola foto suasana café, area indoor/outdoor, dan aktivitas SIDE LINE
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition"
        >
          <span>📸</span>
          <span>Upload Foto Baru</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Galeri */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-200 bg-white text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
            <p className="mt-3 text-sm">Memuat galeri foto...</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-slate-200 bg-white">
            <span className="text-5xl">🖼️</span>
            <p className="mt-4 text-base font-semibold text-slate-700">
              Belum ada foto di galeri
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Upload foto suasana café untuk ditampilkan pada website publik.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Upload Foto Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {galleries.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.title || "Foto Galeri"}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-3.5">
                  <p className="font-semibold text-sm text-slate-800 truncate" title={item.title}>
                    {item.title || "Suasana SIDE LINE"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="rounded px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? "Edit Keterangan Foto" : "Upload Foto Galeri"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {editingItem
                ? "Perbarui judul foto suasana café."
                : "Pilih foto suasana café terbaik Anda untuk ditampilkan ke pengunjung."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Judul / Keterangan Foto
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Outdoor Seating Lantai 2"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              {!editingItem && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Pilih File Foto (JPG/PNG, Max 3MB) *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              )}

              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-full rounded-lg object-cover border border-slate-200 shadow-inner"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Upload Foto"}</span>
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