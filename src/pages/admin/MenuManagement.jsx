import { useState, useEffect, useCallback } from "react";
import {
  menuService,
  calculatePromo,
  getPromoTimeInfo,
  getPromoBadgeLabel,
} from "../../services/menuService";
import { categoryService } from "../../services/categoryService";
import { chefRecommendationService } from "../../services/chefRecommendationService";
import MenuHeroSlidesManager from "../../components/admin/MenuHeroSlidesManager";
import {
  Plus,
  MagnifyingGlass as Search,
  Fire as Flame,
  Tag,
  PencilSimple as Pencil,
  Trash as Trash2,
  Coffee,
  WarningCircle as AlertTriangle,
  CheckCircle as CheckCircle2,
  X,
  ChefHat,
  UploadSimple as Upload,
  Eye,
  EyeSlash as EyeOff,
} from "@phosphor-icons/react";

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
  const [discountType, setDiscountType] = useState("nominal"); // 'nominal' | 'percent'
  const [promoLabelType, setPromoLabelType] = useState("hemat_lebih"); // 'hemat_lebih' | 'hemat' | 'percent' | 'custom'
  const [customPromoLabel, setCustomPromoLabel] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [promoStartDate, setPromoStartDate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");

  // Chef Recommendation Poster State
  const [chefPoster, setChefPoster] = useState(null);
  const [isChefPosterModalOpen, setIsChefPosterModalOpen] = useState(false);
  const [chefTitle, setChefTitle] = useState("");
  const [chefSubtitle, setChefSubtitle] = useState("");
  const [chefBadge, setChefBadge] = useState("PILIHAN CHEF");
  const [chefImageFile, setChefImageFile] = useState(null);
  const [chefImagePreview, setChefImagePreview] = useState("");
  const [chefIsActive, setChefIsActive] = useState(true);
  const [isSavingChefPoster, setIsSavingChefPoster] = useState(false);

  // Refetch helper
  const reloadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const [menusData, categoriesData, posterData] = await Promise.all([
        menuService.getAll(filterCategory),
        categoryService.getAll(),
        chefRecommendationService.getPoster(false).catch(() => null),
      ]);
      setMenus(menusData);
      setCategories(categoriesData);
      if (posterData) setChefPoster(posterData);
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
        const [menusData, categoriesData, posterData] = await Promise.all([
          menuService.getAll(filterCategory),
          categoryService.getAll(),
          chefRecommendationService.getPoster(false).catch(() => null),
        ]);
        if (!ignore) {
          setMenus(menusData);
          setCategories(categoriesData);
          if (posterData) setChefPoster(posterData);
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

  // Chef Poster Handlers
  const handleOpenChefPosterModal = () => {
    if (chefPoster) {
      setChefTitle(chefPoster.title || "Rekomendasi Spesial Chef Bulan Ini");
      setChefSubtitle(chefPoster.subtitle || "");
      setChefBadge(chefPoster.badge || "PILIHAN CHEF");
      setChefImagePreview(chefPoster.image_url || "");
      setChefIsActive(chefPoster.is_active !== false);
    } else {
      setChefTitle("Rekomendasi Spesial Chef Bulan Ini");
      setChefSubtitle(
        "Kombinasi autentik cold brew espresso segar berpadu sentuhan buah delima dan pastry croissant butter hangat dari oven pilihan chef SIDE LINE."
      );
      setChefBadge("PILIHAN CHEF");
      setChefImagePreview("");
      setChefIsActive(true);
    }
    setChefImageFile(null);
    setIsChefPosterModalOpen(true);
  };

  const handleCloseChefPosterModal = () => {
    setIsChefPosterModalOpen(false);
    setChefImageFile(null);
    setChefImagePreview("");
  };

  const handleChefImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran poster maksimal 5 MB!");
        return;
      }
      setChefImageFile(file);
      setChefImagePreview(URL.createObjectURL(file));
      setChefIsActive(true);
    }
  };

  const handleSaveChefPoster = async (e) => {
    e.preventDefault();
    try {
      setIsSavingChefPoster(true);
      setErrorMsg("");
      const saved = await chefRecommendationService.savePoster({
        id: chefPoster?.id,
        title: chefTitle,
        subtitle: chefSubtitle,
        badge: chefBadge,
        imageFile: chefImageFile,
        currentImageUrl: chefPoster?.image_url || "",
        isActive: chefIsActive,
      });
      setChefPoster(saved);
      setSuccessMsg("Poster rekomendasi chef berhasil disimpan dan diperbarui!");
      setIsChefPosterModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan poster chef: " + (err.message || ""));
    } finally {
      setIsSavingChefPoster(false);
    }
  };

  const handleToggleChefPosterActive = async () => {
    try {
      const currentStatus = chefPoster?.is_active !== false;
      const updated = await chefRecommendationService.toggleActive(chefPoster?.id, currentStatus);
      setChefPoster(updated);
      setSuccessMsg(
        updated.is_active
          ? "Status Berhasil Diubah: Poster rekomendasi chef kini AKTIF dan DITAMPILKAN di halaman menu publik."
          : "Status Berhasil Diubah: Poster rekomendasi chef kini DISEMBUNYIKAN dari halaman menu publik."
      );
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal mengubah status poster chef: " + (err.message || ""));
    }
  };

  const handleDeleteChefPoster = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus poster rekomendasi chef ini?")) {
      return;
    }
    try {
      setIsSavingChefPoster(true);
      await chefRecommendationService.deletePoster(chefPoster?.id, chefPoster?.image_url);
      setChefPoster(null);
      setSuccessMsg("Poster rekomendasi chef berhasil dihapus.");
      setIsChefPosterModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus poster chef: " + (err.message || ""));
    } finally {
      setIsSavingChefPoster(false);
    }
  };

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
    const numPrice = Number(newVal) || 0;
    if (isPromo) {
      if (discountType === "nominal") {
        const amt = discountAmount !== "" ? discountAmount : 5000;
        const res = calculatePromo({
          price: numPrice,
          discount_amount: amt,
          changedField: "amount",
        });
        setDiscountPercent(res.discount_percent);
        setDiscountedPrice(res.discounted_price);
      } else {
        const p = discountPercent !== "" ? discountPercent : 15;
        const res = calculatePromo({
          price: numPrice,
          discount_percent: p,
          changedField: "percent",
        });
        setDiscountAmount(res.discount_amount);
        setDiscountedPrice(res.discounted_price);
      }
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

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    if (type === "nominal") {
      setPromoLabelType("hemat_lebih");
      if (price && (!discountAmount || Number(discountAmount) === 0)) {
        const defaultAmt = 5000;
        setDiscountAmount(defaultAmt);
        const res = calculatePromo({ price, discount_amount: defaultAmt, changedField: "amount" });
        setDiscountPercent(res.discount_percent);
        setDiscountedPrice(res.discounted_price);
      }
    } else {
      setPromoLabelType("percent");
      if (price && (!discountPercent || Number(discountPercent) === 0)) {
        const defaultPct = 15;
        setDiscountPercent(defaultPct);
        const res = calculatePromo({ price, discount_percent: defaultPct, changedField: "percent" });
        setDiscountAmount(res.discount_amount);
        setDiscountedPrice(res.discounted_price);
      }
    }
  };

  const handleTogglePromoCheck = (checked) => {
    setIsPromo(checked);
    if (checked) {
      if (discountType === "nominal") {
        const initialAmount = discountAmount || 5000;
        setDiscountAmount(initialAmount);
        const res = calculatePromo({
          price,
          discount_amount: initialAmount,
          changedField: "amount",
        });
        setDiscountPercent(res.discount_percent);
        setDiscountedPrice(res.discounted_price);
      } else {
        const initialPercent = discountPercent || 15;
        setDiscountPercent(initialPercent);
        const res = calculatePromo({
          price,
          discount_percent: initialPercent,
          changedField: "percent",
        });
        setDiscountAmount(res.discount_amount);
        setDiscountedPrice(res.discounted_price);
      }
    } else {
      setDiscountAmount("");
      setDiscountPercent("");
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
    setDiscountType("nominal");
    setPromoLabelType("hemat_lebih");
    setCustomPromoLabel("");
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

    const hasPromo = Boolean(
      menu.is_promo ||
      Number(menu.discount_percent) > 0 ||
      Number(menu.discount_amount) > 0
    );
    setIsPromo(hasPromo);
    setDiscountType(
      menu.discount_type ||
      (Number(menu.discount_amount) > 0 && !menu.discount_percent ? "nominal" : "percent")
    );
    setPromoLabelType(menu.promo_label_type || "hemat_lebih");
    setCustomPromoLabel(menu.custom_promo_label || "");
    setDiscountPercent(menu.discount_percent ?? (hasPromo ? 15 : ""));
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
        discount_type: discountType,
        promo_label_type: promoLabelType,
        custom_promo_label: customPromoLabel,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCECEB] text-[#C8100A] border border-[#F6D5D2]">
            <Coffee className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
              Katalog &amp; Sajian Menu
            </h1>
            <p className="mt-1 text-[13.5px] sm:text-sm text-[#575049]">
              Kelola katalog sajian kopi, makanan, promo potongan harga, serta foto menu
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenChefPosterModal}
            className="justify-center inline-flex items-center gap-2 rounded-xl bg-[#F5EFE6] hover:bg-[#EBE2D5] border border-[#E2D9CC] px-4 py-2.5 text-[13.5px] sm:text-sm font-medium text-[#292524] transition cursor-pointer"
          >
            <ChefHat className="h-4 w-4 text-[#7C4D34]" weight="duotone" />
            <span>Poster Rekomendasi Chef</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="justify-center inline-flex items-center gap-2 rounded-xl bg-[#C8100A] px-4 py-2.5 text-[13.5px] sm:text-sm font-semibold text-white shadow-2xs hover:bg-[#A80D08] transition cursor-pointer"
          >
            <Plus className="h-4 w-4" weight="bold" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Banner Status Poster Rekomendasi Chef */}
      <div
        className={`rounded-2xl border p-5 shadow-2xs transition-all bg-white ${
          chefPoster?.is_active !== false
            ? "border-[#E6DFD5]"
            : "border-[#E6DFD5] opacity-85"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                chefPoster?.is_active !== false
                  ? "bg-[#F5EFE6] text-[#7C4D34] border-[#E8DFD2]"
                  : "bg-[#FAF7F2] text-[#6B635B] border-[#E6DFD5]"
              }`}
            >
              <ChefHat className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                  Rekomendasi Menu oleh Chef
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13.5px] font-medium ${
                    chefPoster?.is_active !== false
                      ? "bg-[#EBF5EE] text-emerald-800 border border-emerald-200"
                      : "bg-[#FAF7F2] text-[#575049] border border-[#E6DFD5]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      chefPoster?.is_active !== false ? "bg-emerald-600" : "bg-[#9A9086]"
                    }`}
                  />
                  {chefPoster?.is_active !== false
                    ? "Aktif di Halaman Menu"
                    : "Disembunyikan"}
                </span>
              </div>
              <p className="mt-1 text-[13.5px] font-medium text-[#292524] line-clamp-1">
                {chefPoster?.title || "Belum ada poster kustom — menggunakan rekomendasi bawaan Side Line"}
              </p>
              <p className="mt-0.5 text-[13.5px] text-[#575049] line-clamp-1">
                {chefPoster?.is_active !== false
                  ? "Poster sedang ditampilkan kepada pelanggan di bagian atas tab Semua Menu."
                  : "Poster sedang disembunyikan. Klik 'Tampilkan ke Menu' untuk mengaktifkannya."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            {chefPoster && (
              <button
                type="button"
                onClick={handleToggleChefPosterActive}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13.5px] font-medium transition cursor-pointer ${
                  chefPoster?.is_active !== false
                    ? "border-[#E2D9CC] bg-[#FAF7F2] text-[#292524] hover:bg-[#EFE9E0]"
                    : "border-emerald-600 bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                {chefPoster?.is_active !== false ? (
                  <>
                    <EyeOff className="h-4 w-4 text-[#575049]" weight="duotone" />
                    <span>Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-white" weight="duotone" />
                    <span>Tampilkan ke Menu</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenChefPosterModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#292524] hover:bg-[#1C1917] text-[#FAF7F2] px-3.5 py-2 text-[13.5px] font-medium transition cursor-pointer"
            >
              <Upload className="h-4 w-4" weight="duotone" />
              <span>{chefPoster?.image_url ? "Kelola Poster" : "Unggah Poster Chef"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Hero Halaman Menu (Carousel Gelas 3D, maks 5 foto) */}
      <MenuHeroSlidesManager />

      {/* Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B635B] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama menu atau deskripsi..."
            className="w-full rounded-xl border border-[#E6DFD5] bg-white pl-10 pr-4 py-2.5 text-[13.5px] text-[#292524] placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={filterCategory}
            onChange={(e) => handleFilterCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-[#E6DFD5] bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-[#44403C] outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition shadow-2xs cursor-pointer"
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
        <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-[13.5px] text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-[13.5px] text-red-800 flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabel Menu */}
      <div className="overflow-hidden rounded-2xl border border-[#E6DFD5] bg-white shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-[#6B635B]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E6DFD5] border-t-[#C8100A]" />
            <p className="mt-3 text-[13.5px] font-medium text-[#6B635B]">Memuat katalog menu...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#7C4D34] mb-3">
              <Coffee className="h-6 w-6" weight="duotone" />
            </div>
            <p className="text-sm font-semibold text-[#1C1917]">
              Tidak ada sajian yang ditemukan
            </p>
            <p className="mt-1 text-[13.5px] text-[#575049] max-w-sm mx-auto">
              {searchQuery
                ? "Coba sesuaikan kata kunci pencarian atau kategori filter Anda."
                : "Mulai tambahkan menu pertama untuk cafe Anda."}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-xl bg-[#C8100A] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[#A80D08] transition cursor-pointer"
            >
              Tambah Menu Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px] text-[#575049]">
              <thead className="border-b border-[#E6DFD5] bg-[#FAF7F2] text-[13.5px] font-medium text-[#575049]">
                <tr>
                  <th className="px-5 py-3.5">Foto</th>
                  <th className="px-5 py-3.5">Nama &amp; Deskripsi</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Harga &amp; Diskon</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
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
                    <tr key={menu.id} className="hover:bg-[#FAF7F2]/80 transition-colors">
                      <td className="px-5 py-3.5">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="h-12 w-12 rounded-lg object-cover border border-[#E6DFD5] shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5EFE6] text-[#6B635B] border border-[#E6DFD5]">
                            <Coffee className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#1C1917] flex items-center flex-wrap gap-2">
                          <span className="text-[13.5px]">{menu.name}</span>
                          {hasPromo && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 text-[13.5px] font-bold">
                              <Flame className="h-3 w-3" />
                              <span>{getPromoBadgeLabel(menu)}</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-[#6B635B] line-clamp-1 max-w-xs">
                          {menu.description || "Tanpa deskripsi"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#F5EFE6] px-2 py-0.5 text-[12.5px] font-medium text-[#44403C] border border-[#E6DFD5]">
                          <Tag className="h-3 w-3 text-[#6B635B]" />
                          <span>{menu.categories?.name || "Uncategorized"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {hasPromo ? (
                          <div>
                            <span className="line-through text-[12.5px] text-[#6B635B] block ">
                              Rp {Number(menu.price).toLocaleString("id-ID")}
                            </span>
                            <span className="font-bold text-[13.5px] text-rose-600 block ">
                              Rp {Number(promoPrice).toLocaleString("id-ID")}
                            </span>
                            <span className="text-[13.5px] text-emerald-600 font-semibold block mt-0.5">
                              Lebih hemat Rp{" "}
                              {Number(
                                menu.discount_amount || menu.price - promoPrice
                              ).toLocaleString("id-ID")}
                            </span>
                            {menu.promo_end_date ? (
                              menu.is_expired ? (
                                <span className="text-[13.5px] text-rose-600 font-bold block mt-0.5">
                                  Kadaluarsa ({menu.formatted_end_date})
                                </span>
                              ) : (
                                <span className="text-[13.5px] text-[#575049] font-medium block mt-0.5">
                                  ⏱️ {menu.remaining_time_text}
                                </span>
                              )
                            ) : (
                              <span className="text-[13.5px] text-[#6B635B] block mt-0.5">
                                Tanpa Batas Waktu
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-semibold text-[#1C1917] text-[13.5px]">
                            Rp {Number(menu.price).toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1.5 items-start">
                          <button
                            onClick={() => handleToggleAvailable(menu)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-medium transition cursor-pointer ${
                              menu.is_available
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
                                : "bg-[#F5EFE6] text-[#575049] ring-1 ring-zinc-300 hover:bg-zinc-200"
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
                            className={`inline-flex items-center gap-1 text-[12.5px] font-medium transition hover:underline cursor-pointer ${
                              hasPromo
                                ? "text-rose-600 font-semibold"
                                : "text-[#6B635B] hover:text-[#44403C]"
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
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E6DFD5] bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-[#44403C] hover:bg-[#FAF7F2] hover:border-[#D6CEC2] transition cursor-pointer shadow-2xs"
                          >
                            <Pencil className="h-3 w-3 text-[#575049]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(menu)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer shadow-2xs"
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
          <div className="border-t border-[#E6DFD5] px-4 sm:px-5 py-3.5 bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px] text-[#575049]">
            <div className="text-center sm:text-left">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredMenus.length)} dari{" "}
              {filteredMenus.length} menu
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-[#E6DFD5] bg-white font-medium hover:bg-[#F5EFE6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                      : "bg-white border border-[#E6DFD5] hover:bg-[#F5EFE6]"
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-[#E6DFD5] bg-white font-medium hover:bg-[#F5EFE6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
            <h2 className="text-lg font-bold text-[#1C1917]">
              {editingMenu ? "Edit Menu & Promo" : "Tambah Menu & Promo Baru"}
            </h2>
            <p className="mt-1 text-[13.5px] text-[#575049]">
              Isi data detail menu, kategori, harga normal, promo potongan harga, dan foto
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Americano / Caramel Macchiato"
                  className="w-full rounded-lg border border-[#E2D9CC] px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                    Kategori *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E2D9CC] px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
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
                  <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
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
                    className="w-full rounded-lg border border-[#E2D9CC] px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
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
                    <span className="bg-red-600 text-white text-[13.5px] font-bold uppercase px-2 py-0.5 rounded tracking-wide">
                      PROMO HARGA
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-red-800">
                  Gantikan status &quot;Signature&quot; dengan Promo Potongan Harga. Sistem akan otomatis menghitung harga promo.
                </p>

                {isPromo && (
                  <div className="space-y-3 pt-2 border-t border-red-200 animate-in fade-in duration-200">
                    {/* Pemilihan Tipe Potongan Harga: Nominal (Rp) vs Persen (%) */}
                    <div>
                      <label className="block text-[12.5px] font-semibold text-[#44403C] mb-1.5">
                        Metode Potongan Harga
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDiscountTypeChange("nominal")}
                          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-bold transition cursor-pointer border ${
                            discountType === "nominal"
                              ? "bg-red-600 text-white border-red-600 shadow-2xs"
                              : "bg-white text-[#44403C] border-[#E2D9CC] hover:bg-[#FAF7F2]"
                          }`}
                        >
                          <span>🏷️</span>
                          <span>Nominal Langsung (Rp)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscountTypeChange("percent")}
                          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-bold transition cursor-pointer border ${
                            discountType === "percent"
                              ? "bg-red-600 text-white border-red-600 shadow-2xs"
                              : "bg-white text-[#44403C] border-[#E2D9CC] hover:bg-[#FAF7F2]"
                          }`}
                        >
                          <span>📊</span>
                          <span>Persentase (%)</span>
                        </button>
                      </div>
                    </div>

                    {/* Input Potongan Berdasarkan Metode yang Dipilih */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {discountType === "nominal" ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[12.5px] font-semibold text-[#44403C]">
                              Potongan Harga (Rp) <span className="text-red-500">*</span>
                            </label>
                            {discountPercent > 0 && (
                              <span className="text-[13.5px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                ≈ {discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#6B635B] font-bold">
                              Rp
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={discountAmount}
                              onChange={(e) => handleAmountChange(e.target.value)}
                              placeholder="Misal: 5000 atau 10000"
                              className="w-full rounded-lg border-2 border-red-300 bg-white pl-9 pr-3 py-1.5 text-sm font-bold text-red-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                          <p className="mt-1 text-[13.5px] text-[#575049]">
                            Masukkan nominal langsung potongan harga yang diberikan kepada pelanggan.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[12.5px] font-semibold text-[#44403C]">
                              Diskon Persen (%) <span className="text-red-500">*</span>
                            </label>
                            {discountAmount > 0 && (
                              <span className="text-[13.5px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                ≈ Rp {Number(discountAmount).toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={discountPercent}
                              onChange={(e) => handlePercentChange(e.target.value)}
                              placeholder="Misal: 10, 20, 25"
                              className="w-full rounded-lg border-2 border-red-300 bg-white px-3 py-1.5 text-sm font-bold text-red-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#6B635B] font-bold">
                              %
                            </span>
                          </div>
                          <p className="mt-1 text-[13.5px] text-[#575049]">
                            Masukkan persentase diskon promo menu.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[12.5px] font-semibold text-[#44403C] mb-1">
                          Harga Promo Akhir (Rp)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#6B635B] font-bold">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={discountedPrice}
                            onChange={(e) =>
                              handleDiscountedPriceChange(e.target.value)
                            }
                            placeholder="Misal: 20000"
                            className="w-full rounded-lg border border-[#E2D9CC] bg-white pl-9 pr-3 py-1.5 text-sm font-bold text-[#1C1917] outline-none focus:border-red-500"
                          />
                        </div>
                        <p className="mt-1 text-[13.5px] text-[#575049]">
                          Harga yang harus dibayar oleh pelanggan setelah dipotong promo.
                        </p>
                      </div>
                    </div>

                    {/* Pilihan Gaya Teks Label di Card Menu */}
                    <div className="rounded-lg bg-white border border-red-200/90 p-3 text-[13.5px] space-y-2">
                      <label className="block text-[12.5px] font-semibold text-[#292524]">
                        🏷️ Pilihan Tampilan Label di Card Menu
                      </label>
                      <p className="text-[12.5px] text-[#575049]">
                        Tentukan teks badge label promo yang akan ditampilkan pada kartu sajian menu di website.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <label
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                            promoLabelType === "hemat_lebih"
                              ? "bg-red-50/80 border-red-500 text-red-950 font-bold"
                              : "border-[#E6DFD5] hover:border-[#E2D9CC] bg-white text-[#44403C]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="promo_label_choice"
                            checked={promoLabelType === "hemat_lebih"}
                            onChange={() => setPromoLabelType("hemat_lebih")}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-[12.5px] leading-tight">
                            Lebih hemat Rp{" "}
                            {Number(discountAmount || 0).toLocaleString("id-ID")}
                          </span>
                        </label>

                        <label
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                            promoLabelType === "hemat"
                              ? "bg-red-50/80 border-red-500 text-red-950 font-bold"
                              : "border-[#E6DFD5] hover:border-[#E2D9CC] bg-white text-[#44403C]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="promo_label_choice"
                            checked={promoLabelType === "hemat"}
                            onChange={() => setPromoLabelType("hemat")}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-[12.5px] leading-tight">
                            Hemat Rp{" "}
                            {Number(discountAmount || 0).toLocaleString("id-ID")}
                          </span>
                        </label>

                        <label
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                            promoLabelType === "percent"
                              ? "bg-red-50/80 border-red-500 text-red-950 font-bold"
                              : "border-[#E6DFD5] hover:border-[#E2D9CC] bg-white text-[#44403C]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="promo_label_choice"
                            checked={promoLabelType === "percent"}
                            onChange={() => setPromoLabelType("percent")}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-[12.5px] leading-tight">
                            Promo -{discountPercent || 0}%
                          </span>
                        </label>
                      </div>

                      {/* Opsi Custom Label */}
                      <div className="pt-1.5 flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-[12.5px] font-semibold text-[#44403C]">
                          <input
                            type="radio"
                            name="promo_label_choice"
                            checked={promoLabelType === "custom"}
                            onChange={() => setPromoLabelType("custom")}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span>Teks Kustom Lainnya:</span>
                        </label>
                        {promoLabelType === "custom" && (
                          <input
                            type="text"
                            value={customPromoLabel}
                            onChange={(e) => setCustomPromoLabel(e.target.value)}
                            placeholder="Misal: SPECIAL DEAL, FLASH SALE"
                            className="flex-1 rounded-md border border-red-300 px-2.5 py-1 text-[13.5px] outline-none focus:border-red-500 bg-white font-bold text-red-700"
                          />
                        )}
                      </div>
                    </div>

                    {/* Live Preview Card & Perhitungan */}
                    <div className="rounded-lg bg-gradient-to-br from-red-50/60 to-amber-50/40 border border-red-200 p-3.5 text-[13.5px] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-red-200/60">
                        <span className="font-semibold text-[#44403C] text-[13.5px]">
                          Preview Tampilan Card Menu Pelanggan:
                        </span>
                        <span className="rounded-full bg-[#C8100A] text-white px-2.5 py-0.5 text-[13.5px] font-semibold shadow-2xs">
                          {getPromoBadgeLabel({
                            is_promo: true,
                            discount_type: discountType,
                            promo_label_type: promoLabelType,
                            custom_promo_label: customPromoLabel,
                            discount_amount: discountAmount,
                            discount_percent: discountPercent,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#575049] text-[13.5px]">
                        <span>Harga Asli:</span>
                        <span className="line-through font-semibold text-[#6B635B] ">
                          Rp {Number(price || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 font-medium text-[13.5px]">
                        <span>Total Penghematan:</span>
                        <span>
                          - Rp {Number(discountAmount || 0).toLocaleString("id-ID")}{" "}
                          {discountPercent > 0 ? `(${discountPercent}%)` : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-red-200/60 pt-1.5 text-red-600 font-bold text-sm">
                        <span>Harga Customer:</span>
                        <div className="text-right">
                          <span className="text-base font-bold text-[#C8100A]">
                            Rp {Number(discountedPrice || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Periode Tanggal Promo (Mulai s/d Akhir) - Tanpa Preset */}
                    <div className="rounded-lg bg-white border border-red-200 p-3 text-[13.5px] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[12.5px] font-semibold text-[#44403C]">
                          🗓️ Periode Promo (Tanggal Mulai & Tanggal Akhir)
                        </label>
                        {(promoStartDate || promoEndDate) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPromoStartDate("");
                              setPromoEndDate("");
                            }}
                            className="text-[13.5px] text-red-600 font-bold hover:underline cursor-pointer"
                          >
                            ✕ Hapus Tanggal
                          </button>
                        )}
                      </div>
                      <p className="text-[12.5px] text-[#575049]">
                        Cukup tentukan tanggal mulai dan tanggal akhir promo. Sistem otomatis menonaktifkan harga promo setelah tanggal akhir berlalu.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[13.5px] font-semibold uppercase text-[#575049] mb-1">
                            Tanggal Mulai Promo
                          </label>
                          <input
                            type="date"
                            value={promoStartDate}
                            onChange={(e) => setPromoStartDate(e.target.value)}
                            className="w-full rounded-lg border border-[#E2D9CC] px-3 py-1.5 text-[13.5px] outline-none focus:border-red-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[13.5px] font-semibold uppercase text-[#575049] mb-1">
                            Tanggal Akhir Promo
                          </label>
                          <input
                            type="date"
                            value={promoEndDate}
                            onChange={(e) => setPromoEndDate(e.target.value)}
                            className="w-full rounded-lg border border-[#E2D9CC] px-3 py-1.5 text-[13.5px] outline-none focus:border-red-500 bg-white"
                          />
                        </div>
                      </div>

                      {(promoStartDate || promoEndDate) && (() => {
                        const timeInfo = getPromoTimeInfo(promoEndDate, promoStartDate);
                        return (
                          <div className="mt-1 pt-2 border-t border-slate-100 text-[12.5px]">
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
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi bahan, cita rasa, atau porsi..."
                  className="w-full rounded-lg border border-[#E2D9CC] px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              {/* Upload Foto */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                  Foto Menu (JPG/PNG, max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-[13.5px] text-[#575049] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[13.5px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover border border-[#E6DFD5]"
                    />
                    <span className="text-[13.5px] text-[#575049]">
                      {imageFile ? "Foto baru siap diupload" : "Foto saat ini"}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#44403C]">
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
                  className="rounded-lg border border-[#E6DFD5] px-4 py-2 text-[13.5px] font-medium text-[#575049] hover:bg-[#F5EFE6] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
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

      {/* ── MODAL UPLOAD & KELOLA POSTER REKOMENDASI CHEF ── */}
      {isChefPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFE9E0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1C1917]">
                    Poster Rekomendasi Menu oleh Chef
                  </h2>
                  <p className="text-[12.5px] text-[#575049]">
                    Dipublikasikan pada bagian atas tab &quot;Semua Menu&quot; di halaman menu publik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseChefPosterModal}
                className="rounded-lg p-1 text-[#6B635B] hover:bg-[#F5EFE6] hover:text-[#575049] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChefPoster} className="mt-4 space-y-4">
              {/* Upload Foto Poster */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Foto / Desain Poster Grafis * (JPG, PNG, WebP — Max 5MB)
                </label>
                <div className="relative rounded-2xl border-2 border-dashed border-[#D6CEC2] hover:border-amber-500 bg-amber-50/20 p-4 transition text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChefImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {chefImagePreview ? (
                    <div className="flex flex-col items-center">
                      <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border border-[#E6DFD5] bg-[#F5EFE6] shadow-xs mb-2">
                        <img
                          src={chefImagePreview}
                          alt="Preview Poster"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[12.5px] text-amber-800 font-semibold">
                        Klik atau drag gambar baru untuk mengganti poster
                      </p>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-[#6B635B]">
                      <Upload className="h-10 w-10 text-amber-500 mb-2" />
                      <p className="text-[13.5px] font-semibold text-[#44403C]">
                        Klik untuk memilih file poster atau tarik gambar ke sini
                      </p>
                      <p className="text-[12.5px] text-[#6B635B] mt-1">
                        Format horizontal atau banner rekomendasi menu (16:9 / 4:3)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Judul Poster */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                  Judul Rekomendasi Menu *
                </label>
                <input
                  type="text"
                  required
                  value={chefTitle}
                  onChange={(e) => setChefTitle(e.target.value)}
                  placeholder="Misal: Rekomendasi Spesial Chef Bulan Ini"
                  className="w-full rounded-xl border border-[#E6DFD5] px-3.5 py-2 text-[13.5px] font-semibold text-[#292524] placeholder-zinc-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 transition"
                />
              </div>

              {/* Badge Label */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={chefBadge}
                  onChange={(e) => setChefBadge(e.target.value)}
                  placeholder="PILIHAN CHEF"
                  className="w-full rounded-xl border border-[#E6DFD5] px-3.5 py-2 text-[13.5px] text-[#292524] placeholder-zinc-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 transition"
                />
              </div>

              {/* Catatan / Cerita Chef */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
                  Catatan / Cerita Chef untuk Pelanggan
                </label>
                <textarea
                  rows="3"
                  value={chefSubtitle}
                  onChange={(e) => setChefSubtitle(e.target.value)}
                  placeholder="Jelaskan keistimewaan rasa, perpaduan bahan, atau cerita dibalik sajian rekomendasi ini..."
                  className="w-full rounded-xl border border-[#E6DFD5] px-3.5 py-2 text-[13.5px] text-[#292524] placeholder-zinc-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 transition"
                />
              </div>

              {/* Toggle Aktif */}
              <div
                className={`rounded-xl border p-3 transition ${
                  chefIsActive
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-[#E6DFD5] bg-[#FAF7F2]"
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer text-[13.5px] font-bold text-[#292524]">
                  <input
                    type="checkbox"
                    checked={chefIsActive}
                    onChange={(e) => setChefIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>
                    {chefIsActive
                      ? "✓ Tampilkan poster ini di halaman menu publik (Status: Aktif)"
                      : "✕ Sembunyikan poster ini dari menu publik (Status: Nonaktif)"}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#EFE9E0]">
                {chefPoster?.id && chefPoster.id !== "default-chef-poster" ? (
                  <button
                    type="button"
                    onClick={handleDeleteChefPoster}
                    disabled={isSavingChefPoster}
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-red-600 hover:text-red-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Poster</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseChefPosterModal}
                    disabled={isSavingChefPoster}
                    className="rounded-xl border border-[#E6DFD5] px-4 py-2 text-[13.5px] font-semibold text-[#575049] hover:bg-[#F5EFE6] transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingChefPoster}
                    className="rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50 transition flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isSavingChefPoster ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Menyimpan Poster...</span>
                      </>
                    ) : (
                      <span>Simpan Poster Chef</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}