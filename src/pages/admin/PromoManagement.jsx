import { useState, useEffect, useCallback } from "react";
import { promoService } from "../../services/promoService";

export default function PromoManagement() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Load promos
  const reloadPromos = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await promoService.getAll();
      setPromos(data);
    } catch (err) {
      setErrorMsg("Gagal memuat promo: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await promoService.getAll();
        if (!ignore) {
          setPromos(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat promo: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle pilih banner gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran banner maksimal 2 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingPromo(null);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (p) => {
    setEditingPromo(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setStartDate(p.start_date || "");
    setEndDate(p.end_date || "");
    setIsActive(p.is_active);
    setImageFile(null);
    setImagePreview(p.image_url || "");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    setImageFile(null);
    setImagePreview("");
  };

  // Simpan Promo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        title,
        description,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: isActive,
        image_url: editingPromo?.image_url,
      };

      if (editingPromo) {
        await promoService.update(
          editingPromo.id,
          payload,
          imageFile,
          editingPromo.image_url
        );
        setSuccessMsg(`Promo "${title}" berhasil diperbarui!`);
      } else {
        await promoService.create(payload, imageFile);
        setSuccessMsg(`Promo "${title}" berhasil ditambahkan!`);
      }

      handleCloseModal();
      await reloadPromos();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan promo: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status aktif
  const handleToggleActive = async (p) => {
    try {
      await promoService.toggleActive(p.id, p.is_active);
      setPromos((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, is_active: !item.is_active } : item
        )
      );
    } catch (err) {
      setErrorMsg("Gagal mengubah status promo: " + err.message);
    }
  };

  // Hapus promo
  const handleDelete = async (p) => {
    if (!window.confirm(`Hapus promo "${p.title}" secara permanen?`)) return;

    try {
      setErrorMsg("");
      await promoService.delete(p.id, p.image_url);
      setSuccessMsg(`Promo "${p.title}" berhasil dihapus.`);
      await reloadPromos();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus promo: " + err.message);
    }
  };

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Promo Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola penawaran spesial, diskon, dan event promosi SIDE LINE
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition"
        >
          <span>🎉</span>
          <span>Tambah Promo Baru</span>
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

      {/* Grid Cards Promo */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-200 bg-white text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
            <p className="mt-3 text-sm">Memuat daftar promo...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-slate-200 bg-white">
            <span className="text-5xl">🎁</span>
            <p className="mt-4 text-base font-semibold text-slate-700">
              Belum ada promo aktif
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Buat penawaran atau potongan harga menarik untuk pengunjung café.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Buat Promo Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col"
              >
                {p.image_url ? (
                  <div className="h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-amber-50 text-3xl text-amber-500">
                    🎉
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {p.title}
                      </h3>
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition ${
                          p.is_active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.is_active ? "bg-emerald-600" : "bg-slate-400"
                          }`}
                        />
                        {p.is_active ? "Aktif" : "Non-Aktif"}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                      {p.description || "Tidak ada deskripsi khusus."}
                    </p>

                    {(p.start_date || p.end_date) && (
                      <p className="mt-3 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <span>🗓️</span>
                        <span>
                          {p.start_date ? new Date(p.start_date).toLocaleDateString("id-ID") : "Sekarang"}
                          {" — "}
                          {p.end_date ? new Date(p.end_date).toLocaleDateString("id-ID") : "Selesai"}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editingPromo ? "Edit Promo" : "Tambah Promo Baru"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Lengkapi judul, banner promo, deskripsi, dan periode berlaku
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Judul Promo *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Buy 1 Get 1 Coffee Setiap Hari Senin"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Promo
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Syarat & ketentuan atau detail promo..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Banner Promo (JPG/PNG, Max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Banner Preview"
                      className="h-32 w-full rounded-lg object-cover border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Tampilkan Sebagai Promo Aktif</span>
                </label>
              </div>

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
                  disabled={isSubmitting || !title.trim()}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingPromo ? "Simpan Perubahan" : "Tambah Promo"}</span>
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