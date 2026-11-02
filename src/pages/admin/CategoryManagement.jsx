import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../../services/categoryService";
import {
  Tag,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  WarningCircle,
  X,
  Folders,
  MagnifyingGlass,
} from "@phosphor-icons/react";

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
        setSuccessMsg(`Kategori "${categoryName}" berhasil diperbarui.`);
      } else {
        await categoryService.create(categoryName);
        setSuccessMsg(`Kategori "${categoryName}" berhasil ditambahkan.`);
      }

      handleCloseModal();
      await fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      if (err.message?.includes("duplicate") || err.code === "23505") {
        setErrorMsg("Nama kategori sudah ada. Gunakan nama lain.");
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

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.slug && cat.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#6E4730] border border-[#E8DFD2]">
            <Tag className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                Kategori Menu
              </h1>
              <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[13.5px] font-medium text-[#6B635B] border border-[#E6DFD5]">
                {categories.length} kategori
              </span>
            </div>
            <p className="mt-1 text-[13.5px] sm:text-sm text-[#575049]">
              Kelola pengelompokan jenis minuman dan makanan untuk mempermudah filter katalog pelanggan
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8100A] px-4 py-2.5 text-[13.5px] sm:text-sm font-semibold text-white shadow-2xs hover:bg-[#A80D08] transition cursor-pointer"
        >
          <Plus className="h-4 w-4" weight="bold" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="rounded-xl bg-[#EBF5EE] border border-emerald-200 p-3.5 text-[13.5px] sm:text-sm text-emerald-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" weight="fill" />
            <span className="font-medium truncate">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-[13.5px] sm:text-sm text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <WarningCircle className="h-4 w-4 text-rose-600 shrink-0" weight="fill" />
            <span className="font-medium truncate">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-600 hover:text-rose-800 p-0.5 rounded cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B635B]"
            weight="duotone"
          />
          <input
            type="text"
            placeholder="Cari nama kategori atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E2D9CC] bg-white pl-10 pr-3.5 py-2.5 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#9A9086] focus:border-[#C8100A] focus:outline-none transition shadow-2xs"
          />
        </div>
      </div>

      {/* Tabel Kategori */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DFD5] bg-white shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-[#6B635B]">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E6DFD5] border-t-[#C8100A]" />
            <p className="mt-3 text-[13.5px] sm:text-sm font-medium text-[#6B635B]">
              Memuat kategori menu...
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#7C4D34]">
              <Folders className="h-6 w-6" weight="duotone" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1C1917]">
              {searchQuery ? "Kategori tidak ditemukan" : "Belum ada kategori"}
            </p>
            <p className="mt-1 text-[13.5px] text-[#575049] max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada kategori yang cocok dengan "${searchQuery}".`
                : "Mulai buat pengelompokan menu seperti Coffee, Non-Coffee, Snack, atau Pastry."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#C8100A] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[#A80D08] transition cursor-pointer"
              >
                <Plus className="h-4 w-4" weight="bold" />
                <span>Tambah Kategori Baru</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px] sm:text-sm text-[#575049]">
              <thead className="border-b border-[#E6DFD5] bg-[#FAF7F2] text-[13.5px] font-medium text-[#575049]">
                <tr>
                  <th className="px-5 py-3.5 w-16">No</th>
                  <th className="px-5 py-3.5">Nama Kategori</th>
                  <th className="px-5 py-3.5">Slug URL</th>
                  <th className="px-5 py-3.5 text-right w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-5 py-4 text-[13.5px] text-[#6B635B]">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5EFE6] text-[#6E4730]">
                          <Tag className="h-4 w-4" weight="duotone" />
                        </span>
                        <span className="font-semibold text-[#1C1917] text-sm">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13.5px]">
                      <span className="inline-flex items-center rounded-lg bg-[#FAF7F2] px-2.5 py-1 text-[#6B635B] border border-[#E6DFD5]">
                        /{cat.slug || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Kategori"
                          className="inline-flex items-center gap-1 rounded-xl border border-[#E2D9CC] bg-white px-3 py-1.5 text-[13.5px] font-medium text-[#292524] hover:bg-[#FAF7F2] transition cursor-pointer"
                        >
                          <PencilSimple className="h-3.5 w-3.5 text-[#6E4730]" weight="duotone" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          title="Hapus Kategori"
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-[13.5px] font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5 text-rose-500" weight="duotone" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE9E0]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCECEB] text-[#C8100A]">
                  <Tag className="h-4 w-4" weight="duotone" />
                </span>
                <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#6B635B] hover:text-[#1C1917] p-1 rounded-lg transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2.5 text-[13.5px] text-[#575049]">
              {editingCategory
                ? "Perbarui label kategori yang sudah terdaftar di sistem katalog."
                : "Nama kategori akan otomatis digunakan untuk mengelompokkan menu sajian."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[13.5px] font-semibold text-[#292524] mb-1.5">
                  Nama Kategori <span className="text-[#C8100A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Misal: Signature Espresso, Pastry, Cold Brew..."
                  className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#9A9086] outline-none focus:border-[#C8100A] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EFE9E0]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-[#E2D9CC] px-4 py-2 text-[13.5px] font-medium text-[#575049] hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !categoryName.trim()}
                  className="rounded-xl bg-[#C8100A] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[#A80D08] disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  {isSubmitting ? "Menyimpan..." : editingCategory ? "Simpan Perubahan" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
