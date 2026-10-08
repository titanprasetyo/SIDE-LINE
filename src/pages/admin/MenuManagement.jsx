import { useState, useEffect, useCallback } from "react";
import { menuService } from "../../services/menuService";
import { categoryService } from "../../services/categoryService";

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Refetch helper
  const reloadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const [menusData, categoriesData] = await Promise.all([
        menuService.getAll(filterCategory),
        categoryService.getAll(),
      ]);
      setMenus(menusData);
      setCategories(categoriesData);
    } catch (err) {
      setErrorMsg("Gagal memuat data menu: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const [menusData, categoriesData] = await Promise.all([
          menuService.getAll(filterCategory),
          categoryService.getAll(),
        ]);
        if (!ignore) {
          setMenus(menusData);
          setCategories(categoriesData);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat data menu: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, [filterCategory]);

  // Handle Pilih File Gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingMenu(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setPrice("");
    setDescription("");
    setIsAvailable(true);
    setIsFeatured(false);
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (menu) => {
    setEditingMenu(menu);
    setName(menu.name);
    setCategoryId(menu.category_id || "");
    setPrice(menu.price);
    setDescription(menu.description || "");
    setIsAvailable(menu.is_available);
    setIsFeatured(menu.is_featured);
    setImageFile(null);
    setImagePreview(menu.image_url || "");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Tutup Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
    setImageFile(null);
    setImagePreview("");
  };

  // Simpan Menu (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        name,
        category_id: categoryId || null,
        price,
        description,
        is_available: isAvailable,
        is_featured: isFeatured,
        image_url: editingMenu?.image_url,
      };

      if (editingMenu) {
        await menuService.update(
          editingMenu.id,
          payload,
          imageFile,
          editingMenu.image_url
        );
        setSuccessMsg(`Menu "${name}" berhasil diperbarui!`);
      } else {
        await menuService.create(payload, imageFile);
        setSuccessMsg(`Menu "${name}" berhasil ditambahkan!`);
      }

      handleCloseModal();
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan menu: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Ketersediaan
  const handleToggleAvailable = async (menu) => {
    try {
      await menuService.toggleAvailability(menu.id, menu.is_available);
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menu.id ? { ...m, is_available: !m.is_available } : m
        )
      );
    } catch (err) {
      setErrorMsg("Gagal mengubah status ketersediaan: " + err.message);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (menu) => {
    try {
      await menuService.toggleFeatured(menu.id, menu.is_featured);
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menu.id ? { ...m, is_featured: !m.is_featured } : m
        )
      );
    } catch (err) {
      setErrorMsg("Gagal mengubah status rekomendasi: " + err.message);
    }
  };

  // Hapus Menu
  const handleDelete = async (menu) => {
    if (!window.confirm(`Hapus menu "${menu.name}" secara permanen?`)) return;

    try {
      setErrorMsg("");
      await menuService.delete(menu.id, menu.image_url);
      setSuccessMsg(`Menu "${menu.name}" berhasil dihapus.`);
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus menu: " + err.message);
    }
  };

  // Filter Search
  const filteredMenus = menus.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Menu Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola daftar makanan, minuman, harga, ketersediaan, dan foto menu
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition"
        >
          <span>➕</span>
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari nama menu..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 transition"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabel Menu */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
            <p className="mt-3 text-sm">Memuat daftar menu...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">☕</span>
            <p className="mt-3 text-base font-semibold text-slate-700">
              Tidak ada menu yang ditemukan
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery
                ? "Coba kata kunci pencarian yang lain."
                : "Mulai tambahkan menu pertama untuk café Anda."}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Tambah Menu Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Foto</th>
                  <th className="px-5 py-3.5">Nama & Deskripsi</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Harga</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMenus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      {menu.image_url ? (
                        <img
                          src={menu.image_url}
                          alt={menu.name}
                          className="h-12 w-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-400">
                          ☕
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{menu.name}</span>
                        {menu.is_featured && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            ⭐ Unggulan
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400 line-clamp-1 max-w-xs">
                        {menu.description || "Tanpa deskripsi"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {menu.categories?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      Rp {Number(menu.price).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleToggleAvailable(menu)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition cursor-pointer ${
                            menu.is_available
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                          title="Klik untuk ubah ketersediaan"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              menu.is_available ? "bg-emerald-600" : "bg-red-600"
                            }`}
                          />
                          {menu.is_available ? "Tersedia" : "Habis"}
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(menu)}
                          className={`text-[11px] font-medium text-left hover:underline ${
                            menu.is_featured
                              ? "text-amber-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {menu.is_featured ? "★ Hapus Rekomendasi" : "☆ Set Rekomendasi"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(menu)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(menu)}
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
          </div>
        )}
      </div>

      {/* Modal Dialog Form (Tambah / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Isi data detail menu, kategori, harga, dan upload foto
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Caramel Macchiato"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi bahan, cita rasa, atau porsi..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              {/* Upload Foto */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Foto Menu (JPG/PNG, max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                    />
                    <span className="text-xs text-slate-500">
                      {imageFile ? "Foto baru siap diupload" : "Foto saat ini"}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Tersedia untuk Dipesan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Menu Unggulan (Featured)</span>
                </label>
              </div>

              {/* Action Buttons */}
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
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingMenu ? "Simpan Perubahan" : "Tambah Menu"}</span>
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