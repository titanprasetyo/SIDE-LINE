import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../../services/categoryService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Kategori
  const fetchCategories = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setErrorMsg("Gagal memuat kategori: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await categoryService.getAll();
        if (!ignore) {
          setCategories(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat kategori: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Tutup Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  // Simpan Kategori (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (editingCategory) {
        await categoryService.update(editingCategory.id, categoryName);
        setSuccessMsg(`Kategori "${categoryName}" berhasil diperbarui!`);
      } else {
        await categoryService.create(categoryName);
        setSuccessMsg(`Kategori "${categoryName}" berhasil ditambahkan!`);
      }

      handleCloseModal();
      await fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      if (err.message?.includes("duplicate") || err.code === "23505") {
        setErrorMsg("Nama kategori sudah ada! Gunakan nama lain.");
      } else {
        setErrorMsg("Gagal menyimpan kategori: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Kategori
  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?\nPerhatian: Menu yang menggunakan kategori ini akan kehilangan kategorinya.`
      )
    ) {
      return;
    }

    try {
      setErrorMsg("");
      await categoryService.delete(cat.id);
      setSuccessMsg(`Kategori "${cat.name}" berhasil dihapus.`);
      await fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus kategori: " + err.message);
    }
  };

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Category Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola kategori untuk pengelompokan menu di website SIDE LINE
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition"
        >
          <span>➕</span>
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabel Kategori */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
            <p className="mt-3 text-sm">Memuat daftar kategori...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">🏷️</span>
            <p className="mt-3 text-base font-semibold text-slate-700">
              Belum ada kategori
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Mulai dengan menambahkan kategori menu pertama Anda.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Tambah Kategori
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-6 py-3.5">No</th>
                <th className="px-6 py-3.5">Nama Kategori</th>
                <th className="px-6 py-3.5">Slug URL</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-0.5">
                      {cat.slug || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog Form (Tambah / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {editingCategory
                ? "Perbarui nama kategori yang sudah ada."
                : "Masukkan nama kategori baru untuk menu Anda."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Misal: Coffee, Main Course, Pastry..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
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
                  disabled={isSubmitting || !categoryName.trim()}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}