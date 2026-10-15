import { useState, useEffect, useCallback } from "react";
import { menuService, calculatePromo, getPromoTimeInfo } from "../../services/menuService";
import { categoryService } from "../../services/categoryService";
import {
  Plus,
  Search,
  Filter,
  Flame,
  Tag,
  Pencil,
  Trash2,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination Admin
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Promo Potongan Harga Fields
  const [isPromo, setIsPromo] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [promoStartDate, setPromoStartDate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");

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

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFilterCategoryChange = (val) => {
    setFilterCategory(val);
    setCurrentPage(1);
  };

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

  // Logic Perhitungan Potongan Harga Otomatis
  const handlePriceChange = (newVal) => {
    setPrice(newVal);
    if (isPromo) {
      const p = discountPercent || 12;
      const res = calculatePromo({
        price: newVal,
        discount_percent: p,
        changedField: "percent",
      });
      setDiscountAmount(res.discount_amount);
      setDiscountedPrice(res.discounted_price);
    }
  };

  const handlePercentChange = (val) => {
    setDiscountPercent(val);
    if (val === "" || isNaN(Number(val))) {
      setDiscountAmount("");
      setDiscountedPrice(price || "");
      return;
    }
    const res = calculatePromo({
      price,
      discount_percent: val,
      changedField: "percent",
    });
    setDiscountAmount(res.discount_amount);
    setDiscountedPrice(res.discounted_price);
  };

  const handleAmountChange = (val) => {
    setDiscountAmount(val);
    if (val === "" || isNaN(Number(val))) {
      setDiscountPercent("");
      setDiscountedPrice(price || "");
      return;
    }
    const res = calculatePromo({
      price,
      discount_amount: val,
      changedField: "amount",
    });
    setDiscountPercent(res.discount_percent);
    setDiscountedPrice(res.discounted_price);
  };

  const handleDiscountedPriceChange = (val) => {
    setDiscountedPrice(val);
    if (val === "" || isNaN(Number(val))) {
      setDiscountPercent("");
      setDiscountAmount("");
      return;
    }
    const res = calculatePromo({
      price,
      discounted_price: val,
      changedField: "finalPrice",
    });
    setDiscountPercent(res.discount_percent);
    setDiscountAmount(res.discount_amount);
  };

  const handleTogglePromoCheck = (checked) => {
    setIsPromo(checked);
    if (checked) {
      const initialPercent = discountPercent || 10;
      setDiscountPercent(initialPercent);
      const res = calculatePromo({
        price,
        discount_percent: initialPercent,
        changedField: "percent",
      });
      setDiscountAmount(res.discount_amount);
      setDiscountedPrice(res.discounted_price);
    } else {
      setDiscountAmount("");
      setDiscountedPrice(price);
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
    setIsPromo(false);
    setDiscountPercent("");
    setDiscountAmount("");
    setDiscountedPrice("");
    setPromoStartDate("");
    setPromoEndDate("");
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

    const hasPromo = Boolean(menu.is_promo || Number(menu.discount_percent) > 0);
    setIsPromo(hasPromo);
    setDiscountPercent(menu.discount_percent ?? (hasPromo ? 10 : ""));
    setDiscountAmount(menu.discount_amount || "");
    setDiscountedPrice(menu.discounted_price || menu.price || "");

    if (menu.promo_start_date) {
      const d = new Date(menu.promo_start_date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const date = String(d.getDate()).padStart(2, "0");
        setPromoStartDate(`${year}-${month}-${date}`);
      } else {
        setPromoStartDate("");
      }
    } else {
      setPromoStartDate("");
    }

    if (menu.promo_end_date) {
      const d = new Date(menu.promo_end_date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const date = String(d.getDate()).padStart(2, "0");
        setPromoEndDate(`${year}-${month}-${date}`);
      } else {
        setPromoEndDate("");
      }
    } else {
      setPromoEndDate("");
    }

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

      const finalPrice = Number(price) || 0;
      const isPromoActive = Boolean(isPromo);
      const discPercent = isPromoActive
        ? discountPercent === ""
          ? 0
          : Number(discountPercent) || 0
        : 0;
      const discAmount = isPromoActive ? Number(discountAmount) || 0 : 0;
      const discPrice = isPromoActive
        ? Number(discountedPrice) || Math.max(0, finalPrice - discAmount)
        : finalPrice;

      let finalPromoStartDate = null;
      if (isPromoActive && promoStartDate) {
        const d = new Date(promoStartDate);
        if (!isNaN(d.getTime())) {
          finalPromoStartDate = d.toISOString();
        }
      }

      let finalPromoEndDate = null;
      if (isPromoActive && promoEndDate) {
        const d = new Date(promoEndDate);
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          finalPromoEndDate = d.toISOString();
        }
      }

      const payload = {
        name,
        category_id: categoryId || null,
        price: finalPrice,
        description,
        is_available: isAvailable,
        is_featured: isPromoActive || isFeatured,
        is_promo: isPromoActive,
        discount_percent: discPercent,
        discount_amount: discAmount,
        discounted_price: discPrice,
        promo_start_date: finalPromoStartDate,
        promo_end_date: finalPromoEndDate,
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

  // Toggle Promo Langsung di Tabel
  const handleTogglePromoRow = async (menu) => {
    try {
      const updated = await menuService.togglePromo(menu);
      setMenus((prev) =>
        prev.map((m) => (m.id === menu.id ? updated : m))
      );
      setSuccessMsg(
        `Status promo menu "${menu.name}" berhasil diubah!`
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Gagal mengubah promo menu: " + err.message);
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

  // Pagination Slice
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage) || 1;
  const paginatedMenus = filteredMenus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Menu Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Kelola katalog sajian kopi, makanan, promo harga real-time, dan foto menu
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl bg-[#FF0000] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#D60000] active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama menu atau deskripsi..."
            className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={filterCategory}
            onChange={(e) => handleFilterCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition shadow-2xs cursor-pointer"
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
        <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-800 flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabel Menu */}
      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-zinc-400">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-zinc-800" />
            <p className="mt-3 text-xs font-medium text-zinc-500">Memuat katalog menu...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 mb-3">
              <Coffee className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-zinc-800">
              Tidak ada sajian yang ditemukan
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? "Coba sesuaikan kata kunci pencarian atau kategori filter Anda."
                : "Mulai tambahkan menu pertama untuk cafe Anda."}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-xl bg-[#0B0F17] px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              Tambah Menu Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5">Foto</th>
                  <th className="px-5 py-3.5">Nama & Deskripsi</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Harga & Diskon</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedMenus.map((menu) => {
                  const hasPromo = Boolean(
                    menu.is_promo || Number(menu.discount_percent) > 0
                  );
                  const promoPrice =
                    menu.discounted_price ||
                    Math.max(
                      0,
                      menu.price - (Number(menu.discount_amount) || 0)
                    );

                  return (
                    <tr key={menu.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="h-12 w-12 rounded-lg object-cover border border-zinc-200/80 shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 border border-zinc-200">
                            <Coffee className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-zinc-900 flex items-center flex-wrap gap-2">
                          <span className="text-xs">{menu.name}</span>
                          {hasPromo && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 px-1.5 py-0.5 text-[10px] font-bold">
                              <Flame className="h-3 w-3" />
                              <span>{menu.discount_percent ? `-${menu.discount_percent}%` : "Promo"}</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-400 line-clamp-1 max-w-xs">
                          {menu.description || "Tanpa deskripsi"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 border border-zinc-200/60">
                          <Tag className="h-3 w-3 text-zinc-400" />
                          <span>{menu.categories?.name || "Uncategorized"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {hasPromo ? (
                          <div>
                            <span className="line-through text-[11px] text-zinc-400 block font-mono">
                              Rp {Number(menu.price).toLocaleString("id-ID")}
                            </span>
                            <span className="font-bold text-xs text-rose-600 block font-mono">
                              Rp {Number(promoPrice).toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                              Hemat Rp{" "}
                              {Number(
                                menu.discount_amount || menu.price - promoPrice
                              ).toLocaleString("id-ID")}
                            </span>
                            {menu.promo_end_date ? (
                              menu.is_expired ? (
                                <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                                  Kadaluarsa ({menu.formatted_end_date})
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-600 font-medium block mt-0.5">
                                  ⏱️ {menu.remaining_time_text}
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                Tanpa Batas Waktu
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-semibold text-zinc-900 font-mono text-xs">
                            Rp {Number(menu.price).toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1.5 items-start">
                          <button
                            onClick={() => handleToggleAvailable(menu)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                              menu.is_available
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
                                : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300 hover:bg-zinc-200"
                            }`}
                            title="Klik untuk ubah ketersediaan"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                menu.is_available ? "bg-emerald-500" : "bg-zinc-400"
                              }`}
                            />
                            {menu.is_available ? "Tersedia" : "Habis"}
                          </button>

                          <button
                            onClick={() => handleTogglePromoRow(menu)}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium transition hover:underline cursor-pointer ${
                              hasPromo
                                ? "text-rose-600 font-semibold"
                                : "text-zinc-400 hover:text-zinc-700"
                            }`}
                          >
                            <Flame className="h-3 w-3" />
                            <span>{hasPromo ? "Nonaktifkan Promo" : "Jadikan Promo"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(menu)}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition cursor-pointer shadow-2xs"
                          >
                            <Pencil className="h-3 w-3 text-zinc-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(menu)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Admin Pagination Controls */}
        {filteredMenus.length > itemsPerPage && (
          <div className="border-t border-slate-200 px-4 sm:px-5 py-3.5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="text-center sm:text-left">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredMenus.length)} dari{" "}
              {filteredMenus.length} menu
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-7 h-7 rounded font-bold cursor-pointer ${
                    currentPage === num
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog Form (Tambah / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900">
              {editingMenu ? "Edit Menu & Promo" : "Tambah Menu & Promo Baru"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Isi data detail menu, kategori, harga normal, promo potongan harga, dan foto
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
                  placeholder="Misal: Americano / Caramel Macchiato"
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
                    Harga Normal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="40000"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                  />
                </div>
              </div>

              {/* ==============================================================
                  BAGIAN PROMO POTONGAN HARGA (DENGAN LOGIC HITUNG OTOMATIS)
              ============================================================== */}
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-red-950">
                    <input
                      type="checkbox"
                      checked={isPromo}
                      onChange={(e) => handleTogglePromoCheck(e.target.checked)}
                      className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span>🔥 Aktifkan Promo Potongan Harga</span>
                  </label>
                  {isPromo && (
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                      PROMO HARGA
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-red-800">
                  Gantikan status &quot;Signature&quot; dengan Promo Potongan Harga. Sistem akan otomatis menghitung harga promo.
                </p>

                {isPromo && (
                  <div className="space-y-3 pt-2 border-t border-red-200 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Promo Diskon (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={discountPercent}
                            onChange={(e) => handlePercentChange(e.target.value)}
                            placeholder="Misal: 10, 20, 22, 23"
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-red-500 bg-white"
                          />
                          <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Potongan Harga (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={discountAmount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="Misal: 9000"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-red-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Harga Promo Akhir (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={discountedPrice}
                          onChange={(e) =>
                            handleDiscountedPriceChange(e.target.value)
                          }
                          placeholder="Misal: 36000"
                          className="w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-bold text-red-600 outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Live Preview Perhitungan */}
                    <div className="rounded-lg bg-white border border-red-200 p-3 text-xs flex flex-col gap-1 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Harga Asli:</span>
                        <span className="line-through font-semibold">
                          Rp {Number(price || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 font-medium">
                        <span>Potongan ({discountPercent || 0}%):</span>
                        <span>
                          - Rp {Number(discountAmount || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-1 text-red-600 font-bold text-sm">
                        <span>Harga Customer:</span>
                        <span>
                          Rp {Number(discountedPrice || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Periode Tanggal Promo (Mulai s/d Akhir) - Tanpa Preset */}
                    <div className="rounded-lg bg-white border border-red-200 p-3 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          🗓️ Periode Promo (Tanggal Mulai & Tanggal Akhir)
                        </label>
                        {(promoStartDate || promoEndDate) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPromoStartDate("");
                              setPromoEndDate("");
                            }}
                            className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                          >
                            ✕ Hapus Tanggal
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Cukup tentukan tanggal mulai dan tanggal akhir promo. Sistem otomatis menonaktifkan harga promo setelah tanggal akhir berlalu.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                            Tanggal Mulai Promo
                          </label>
                          <input
                            type="date"
                            value={promoStartDate}
                            onChange={(e) => setPromoStartDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                            Tanggal Akhir Promo
                          </label>
                          <input
                            type="date"
                            value={promoEndDate}
                            onChange={(e) => setPromoEndDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-red-500 bg-white"
                          />
                        </div>
                      </div>

                      {(promoStartDate || promoEndDate) && (() => {
                        const timeInfo = getPromoTimeInfo(promoEndDate, promoStartDate);
                        return (
                          <div className="mt-1 pt-2 border-t border-slate-100 text-[11px]">
                            {timeInfo.is_expired ? (
                              <span className="text-red-600 font-bold flex items-center gap-1">
                                ⚠️ Waktu telah lewat! Promo akan berstatus kadaluarsa dan kembali ke harga normal.
                              </span>
                            ) : (
                              <span className="text-amber-800 font-semibold flex items-center gap-1">
                                <span>⏱️</span>
                                <span>
                                  Periode: <strong>{timeInfo.formatted_range || "Aktif"}</strong>{" "}
                                  {timeInfo.remaining_time_text ? `(${timeInfo.remaining_time_text})` : ""}
                                </span>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
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
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
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