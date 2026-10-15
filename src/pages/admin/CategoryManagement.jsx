import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../../services/categoryService";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FolderTree,
  Hash,
  ArrowUpDown,
  Search,
} from "lucide-react";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
      setCategories(data || []);
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
          setCategories(data || []);
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

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.slug && cat.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Tag className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Kategori Menu
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {categories.length} Total
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola taksonomi kategori produk untuk filter katalog menu pelanggan
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Kategori</span>
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

      {/* Search Bar & Micro Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari kategori atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
          />
        </div>
      </div>

      {/* Tabel Kategori */}
      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat kategori menu...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <FolderTree className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-800">
              {searchQuery ? "Kategori tidak ditemukan" : "Belum ada kategori"}
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada kategori yang cocok dengan "${searchQuery}". Coba gunakan kata kunci lain.`
                : "Mulai buat pengelompokan menu seperti Coffee, Non-Coffee, Snack, atau Pastry."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Kategori Baru</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-zinc-600">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                <tr>
                  <th className="px-5 py-3.5 w-16">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      <span>NO</span>
                    </span>
                  </th>
                  <th className="px-5 py-3.5">Nama Kategori</th>
                  <th className="px-5 py-3.5">Slug URL</th>
                  <th className="px-5 py-3.5 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                          <Tag className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold text-zinc-900 text-sm">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      <span className="inline-flex items-center rounded-md bg-zinc-100/90 px-2 py-0.5 text-zinc-600 border border-zinc-200/60 font-mono">
                        /{cat.slug || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Kategori"
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          title="Hapus Kategori"
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200/80 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form (Tambah / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Tag className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
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
              {editingCategory
                ? "Perbarui label kategori yang sudah terdaftar di sistem katalog."
                : "Nama kategori akan secara otomatis menghasilkan URL slug yang ramah SEO."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Misal: Signature Espresso, Pastry, Cold Brew..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
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
                  disabled={isSubmitting || !categoryName.trim()}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Simpan Perubahan" : "Simpan Kategori"}</span>
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