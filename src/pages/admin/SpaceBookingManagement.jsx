import { useState, useEffect, useCallback, useMemo } from "react";
import { spaceBookingService } from "../../services/spaceBookingService";
import {
  Storefront as Building2,
  Users,
  CreditCard,
  Sparkle as Sparkles,
  Phone,
  Plus,
  PencilSimple as Pencil,
  Trash as Trash2,
  CheckCircle as CheckCircle2,
  WarningCircle as AlertCircle,
  X,
  Globe,
  FileText,
  EyeSlash as EyeOff,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";

export default function SpaceBookingManagement() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter & Search State
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'public' | 'draft'
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [facilities, setFacilities] = useState("");
  const [priceInfo, setPriceInfo] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true); // true = Publik, false = Draft
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const reloadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await spaceBookingService.getAll();
      setSpaces(data || []);
    } catch (err) {
      setErrorMsg("Gagal memuat ruang booking: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await spaceBookingService.getAll();
        if (!ignore) {
          setSpaces(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat ruang booking: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered spaces & counts
  const publicCount = useMemo(
    () => spaces.filter((s) => s.is_available).length,
    [spaces]
  );
  const draftCount = useMemo(
    () => spaces.filter((s) => !s.is_available).length,
    [spaces]
  );

  const filteredSpaces = useMemo(() => {
    return spaces.filter((item) => {
      if (filterTab === "public" && !item.is_available) return false;
      if (filterTab === "draft" && item.is_available) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchFac = item.facilities?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCap = item.capacity?.toLowerCase().includes(q);
        if (!matchName && !matchFac && !matchDesc && !matchCap) return false;
      }
      return true;
    });
  }, [spaces, filterTab, searchQuery]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName("");
    setCapacity("");
    setFacilities("");
    setPriceInfo("");
    setContactPhone("+62 812-3456-7890");
    setDescription("");
    // Default Publik atau Draft bisa dipilih bebas
    setIsAvailable(true);
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name || "");
    setCapacity(item.capacity || "");
    setFacilities(item.facilities || "");
    setPriceInfo(item.price_info || "");
    setContactPhone(item.contact_phone || "");
    setDescription(item.description || "");
    setIsAvailable(Boolean(item.is_available));
    setImageFile(null);
    setImagePreview(item.image_url || "");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        name,
        capacity,
        facilities,
        price_info: priceInfo,
        contact_phone: contactPhone,
        description,
        is_available: isAvailable,
        image_url: editingItem?.image_url,
      };

      if (editingItem) {
        await spaceBookingService.update(
          editingItem.id,
          payload,
          imageFile,
          editingItem.image_url
        );
        setSuccessMsg(
          `Paket booking berhasil diperbarui (${isAvailable ? "Status: Publik" : "Status: Draft"})!`
        );
      } else {
        await spaceBookingService.create(payload, imageFile);
        setSuccessMsg(
          `Paket booking baru berhasil ditambahkan sebagai ${isAvailable ? "Publik (Tayang)" : "Draft"}!`
        );
      }

      handleCloseModal();
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Gagal menyimpan: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Publik vs Draft via tombol aksi cepat
  const handleTogglePublish = async (item) => {
    try {
      setTogglingId(item.id);
      const nextStatus = !item.is_available;
      await spaceBookingService.setPublishStatus(item.id, nextStatus);

      setSpaces((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, is_available: nextStatus } : s
        )
      );

      setSuccessMsg(
        nextStatus
          ? `"${item.name}" berhasil dialihkan ke PUBLIK (sekarang tayang di website)!`
          : `"${item.name}" berhasil dialihkan ke DRAFT (disimpan sebagai draft internal)!`
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Gagal mengubah status publikasi: " + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus paket booking "${item.name}"?`)) return;

    try {
      setErrorMsg("");
      await spaceBookingService.delete(item.id, item.image_url);
      setSuccessMsg("Paket booking berhasil dihapus.");
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#6E4730] border border-[#E8DFD2]">
            <Building2 className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                Sewa Tempat &amp; Private Space
              </h1>
              <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[13.5px] font-medium text-[#6B635B] border border-[#E6DFD5]">
                {spaces.length} ruangan
              </span>
            </div>
            <p className="mt-1 text-[13.5px] sm:text-sm text-[#575049]">
              Kelola pilihan ruang meeting, perayaan acara privat, kapasitas, dan kontak reservasi
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8100A] px-4 py-2.5 text-[13.5px] sm:text-sm font-semibold text-white shadow-2xs hover:bg-[#A80D08] transition cursor-pointer"
        >
          <Plus className="h-4 w-4" weight="bold" />
          <span>Tambah Paket Ruang</span>
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-[13.5px] sm:text-sm text-emerald-800 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
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
        <div className="rounded-xl bg-rose-50/90 border border-rose-200/80 p-3.5 text-[13.5px] sm:text-sm text-rose-800 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
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

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E6DFD5] shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition cursor-pointer whitespace-nowrap ${
              filterTab === "all"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "text-[#575049] hover:bg-[#F5EFE6]"
            }`}
          >
            <span>Semua</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[13.5px] ${
                filterTab === "all"
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-[#F5EFE6] text-[#575049]"
              }`}
            >
              {spaces.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("public")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition cursor-pointer whitespace-nowrap ${
              filterTab === "public"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#575049] hover:bg-[#F5EFE6]"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Publik (Tayang)</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[13.5px] ${
                filterTab === "public"
                  ? "bg-emerald-700 text-emerald-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {publicCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("draft")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition cursor-pointer whitespace-nowrap ${
              filterTab === "draft"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-[#575049] hover:bg-[#F5EFE6]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Draft</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[13.5px] ${
                filterTab === "draft"
                  ? "bg-amber-700 text-amber-100"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {draftCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B635B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ruang / fasilitas..."
            className="w-full rounded-lg border border-[#E6DFD5] bg-[#FAF7F2]/70 pl-9 pr-3 py-1.5 text-[13.5px] text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B635B] hover:text-[#575049] p-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content List */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-[#E6DFD5] bg-white text-[#6B635B]">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E6DFD5] border-t-zinc-900" />
            <p className="mt-3 text-[13.5px] sm:text-sm font-medium text-[#575049]">
              Memuat paket ruangan...
            </p>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-[#E6DFD5] bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#6B635B]">
              <Building2 className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#292524]">
              {searchQuery
                ? "Tidak ada paket ruang yang sesuai pencarian"
                : filterTab === "draft"
                ? "Tidak ada paket dengan status Draft"
                : filterTab === "public"
                ? "Belum ada paket yang berstatus Publik"
                : "Belum ada paket sewa tempat"}
            </p>
            <p className="mt-1 text-[13.5px] text-[#575049] max-w-sm mx-auto">
              {searchQuery
                ? "Coba gunakan kata kunci pencarian yang lain."
                : filterTab === "draft"
                ? "Paket yang berstatus Draft akan tersimpan di sini sebelum dipublikasikan ke publik."
                : filterTab === "public"
                ? "Semua paket yang aktif tayang di website publik akan tampil di sini."
                : "Tambahkan opsi ruang meeting, area lantai 2, atau gathering room agar pengunjung bisa memesan."}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-[13.5px] font-semibold text-white hover:bg-[#292524] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Paket Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredSpaces.map((item) => {
              const isItemPublic = Boolean(item.is_available);
              const isToggling = togglingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`group overflow-hidden rounded-xl border bg-white shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                    isItemPublic
                      ? "border-[#E6DFD5] hover:border-[#D6CEC2]"
                      : "border-amber-200/70 bg-amber-50/10 hover:border-amber-300"
                  }`}
                >
                  <div>
                    {item.image_url ? (
                      <div className="relative h-48 w-full overflow-hidden bg-[#F5EFE6] border-b border-[#EFE9E0]">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Status Badge On Image */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            disabled={isToggling}
                            title={
                              isItemPublic
                                ? "Status saat ini: PUBLIK. Klik untuk ubah ke DRAFT"
                                : "Status saat ini: DRAFT. Klik untuk ubah ke PUBLIK"
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold backdrop-blur-md transition shadow-xs cursor-pointer ${
                              isItemPublic
                                ? "bg-emerald-600/90 text-white hover:bg-emerald-700"
                                : "bg-amber-600/90 text-white hover:bg-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isItemPublic
                                  ? "bg-white animate-pulse"
                                  : "bg-amber-200"
                              }`}
                            />
                            {isItemPublic ? (
                              <>
                                <Globe className="h-3 w-3" />
                                <span>Publik</span>
                              </>
                            ) : (
                              <>
                                <FileText className="h-3 w-3" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 pb-0 flex items-center justify-between">
                        {/* Status Badge without image */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          disabled={isToggling}
                          title={
                            isItemPublic
                              ? "Status saat ini: PUBLIK. Klik untuk ubah ke DRAFT"
                              : "Status saat ini: DRAFT. Klik untuk ubah ke PUBLIK"
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold transition cursor-pointer ${
                            isItemPublic
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isItemPublic ? "bg-emerald-600" : "bg-amber-600"
                            }`}
                          />
                          {isItemPublic ? (
                            <>
                              <Globe className="h-3 w-3" />
                              <span>Publik (Tayang di Web)</span>
                            </>
                          ) : (
                            <>
                              <FileText className="h-3 w-3" />
                              <span>Draft (Belum Publik)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-[#1C1917] text-base group-hover:text-zinc-950">
                          {item.name}
                        </h3>
                        {!item.image_url && (
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[13.5px] font-semibold ${
                              isItemPublic
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isItemPublic ? "Publik" : "Draft"}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13.5px]">
                        {item.capacity && (
                          <div className="flex items-center gap-2 rounded-lg bg-[#FAF7F2] px-2.5 py-1.5 border border-[#E6DFD5] text-[#44403C]">
                            <Users className="h-3.5 w-3.5 text-[#6B635B] shrink-0" />
                            <span className="font-medium truncate">
                              {item.capacity}
                            </span>
                          </div>
                        )}
                        {item.price_info && (
                          <div className="flex items-center gap-2 rounded-lg bg-[#FAF7F2] px-2.5 py-1.5 border border-[#E6DFD5] text-[#44403C] ">
                            <CreditCard className="h-3.5 w-3.5 text-[#6B635B] shrink-0" />
                            <span className="font-semibold truncate">
                              {item.price_info}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.facilities && (
                        <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-[#FAF7F2] p-2.5 border border-[#E6DFD5] text-[13.5px] text-[#575049]">
                          <Sparkles className="h-3.5 w-3.5 text-[#575049] shrink-0 mt-0.5" />
                          <span className="leading-relaxed line-clamp-2">
                            {item.facilities}
                          </span>
                        </div>
                      )}

                      {item.contact_phone && (
                        <div className="mt-2 flex items-center gap-2 text-[13.5px] text-[#575049] ">
                          <Phone className="h-3 w-3 text-[#6B635B]" />
                          <span>WhatsApp: {item.contact_phone}</span>
                        </div>
                      )}

                      <p className="mt-2.5 text-[13.5px] text-[#575049] line-clamp-2 leading-relaxed">
                        {item.description ||
                          "Tidak ada deskripsi tambahan untuk paket ruang ini."}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFE9E0] bg-[#FAF7F2]/70 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] text-[#6B635B]">
                        ID #{String(item.id).slice(-4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Tombol Cepat: Ganti Status Publik / Draft */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        disabled={isToggling}
                        title={
                          isItemPublic
                            ? "Ubah status ke Draft (sembunyikan dari web)"
                            : "Ubah status ke Publik (tayangkan di web)"
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13.5px] font-semibold transition cursor-pointer disabled:opacity-50 ${
                          isItemPublic
                            ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {isToggling ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : isItemPublic ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                            <span>Jadikan Draft</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Jadikan Publik</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Ruang"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E6DFD5] bg-white px-2.5 py-1.5 text-[13.5px] font-medium text-[#44403C] hover:bg-[#F5EFE6] hover:text-[#1C1917] transition cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#575049]" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Hapus Ruang"
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[13.5px] font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E6DFD5] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E0]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1C1917] text-white">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-[#1C1917]">
                  {editingItem ? "Edit Paket Ruangan" : "Tambah Paket Ruangan Baru"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#6B635B] hover:text-[#575049] p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-[13.5px] text-[#575049]">
              Tentukan nama area, status publikasi (Publik / Draft), kapasitas tamu, sarana fasilitas, dan estimasi biaya reservasi.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Opsi Status Publikasi: Publik vs Draft */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-2">
                  Status Publikasi Paket Booking <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Publik */}
                  <div
                    onClick={() => setIsAvailable(true)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      isAvailable
                        ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-xs"
                        : "border-[#E6DFD5] hover:border-[#D6CEC2] bg-white text-[#575049]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe
                          className={`h-4 w-4 ${
                            isAvailable ? "text-emerald-600" : "text-[#6B635B]"
                          }`}
                        />
                        <span className="text-[13.5px] font-semibold">
                          Publik (Tayang)
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="space_status"
                        checked={isAvailable}
                        onChange={() => setIsAvailable(true)}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[#575049]">
                      Tampil di halaman web publik. Pelanggan dapat melihat fasilitas dan reservasi online via WhatsApp.
                    </p>
                  </div>

                  {/* Card 2: Draft */}
                  <div
                    onClick={() => setIsAvailable(false)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      !isAvailable
                        ? "border-amber-600 bg-amber-50/60 text-amber-950 shadow-xs"
                        : "border-[#E6DFD5] hover:border-[#D6CEC2] bg-white text-[#575049]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText
                          className={`h-4 w-4 ${
                            !isAvailable ? "text-amber-600" : "text-[#6B635B]"
                          }`}
                        />
                        <span className="text-[13.5px] font-semibold">
                          Draft (Belum Publik)
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="space_status"
                        checked={!isAvailable}
                        onChange={() => setIsAvailable(false)}
                        className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[#575049]">
                      Disimpan sebagai draft internal / persiapan event booking. Tidak langsung dipublikasikan ke publik.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Nama Paket / Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: VIP Meeting Room Lantai 2 / Birthday Event Booking"
                  className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                    Kapasitas Ruang
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="10 - 25 Orang"
                    className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                    Tarif / Biaya Sewa
                  </label>
                  <input
                    type="text"
                    value={priceInfo}
                    onChange={(e) => setPriceInfo(e.target.value)}
                    placeholder="Mulai Rp 50.000 / orang"
                    className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Fasilitas yang Didapat
                </label>
                <input
                  type="text"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  placeholder="AC Dingin, High-speed Wi-Fi, Smart TV 55 inci, Whiteboard..."
                  className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Nomor WhatsApp Reservasi
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Deskripsi / Ketentuan Sewa
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Durasi minimal sewa, ketentuan konsumsi, cara pelunasan uang muka..."
                  className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] placeholder:text-[#6B635B] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Foto Area (Opsional, JPG / PNG, Maks 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-[13.5px] text-[#575049] file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-[13.5px] file:font-semibold file:bg-[#F5EFE6] file:text-[#292524] hover:file:bg-zinc-200 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-[#E6DFD5]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EFE9E0]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-lg border border-[#E6DFD5] px-3.5 py-2 text-[13.5px] font-medium text-[#575049] hover:bg-[#F5EFE6] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="rounded-lg bg-[#1C1917] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[#292524] disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : editingItem ? (
                    <span>Simpan Perubahan</span>
                  ) : isAvailable ? (
                    <span>Publikasikan Paket</span>
                  ) : (
                    <span>Simpan Sebagai Draft</span>
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