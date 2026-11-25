import { useState, useMemo } from "react";
import {
  ChefHat,
  PencilSimple,
  MagnifyingGlass,
  Coffee,
  Check,
  X,
  WarningCircle,
  CheckCircle,
  Fire,
  Sparkle,
} from "@phosphor-icons/react";
import {
  chefRecommendationService,
  DEFAULT_CHEF_CATALOG,
} from "../../services/chefRecommendationService";

const PERIOD_PRESETS = [
  "Rekomendasi Bulan Ini",
  "Spesial Musim Hujan",
  "Segar Saat Cuaca Panas",
  "Favorit Akhir Pekan",
  "Pilihan Saat Ini",
];

/**
 * Panel admin untuk mengelola Katalog Tulisan & Daftar Menu Pilihan pada tab "Rekomendasi Chef".
 */
export default function ChefRecommendationManager({
  catalog,
  menus = [],
  categories = [],
  loading = false,
  onCatalogUpdated,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodLabel, setPeriodLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);

  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const activeCatalog = catalog || DEFAULT_CHEF_CATALOG;

  const menuMap = useMemo(() => {
    const map = new Map();
    for (const m of menus) {
      map.set(String(m.id), m);
    }
    return map;
  }, [menus]);

  // Menu yang benar-benar ada di daftar menu sesuai urutan pilihan admin
  const activeSelectedMenus = useMemo(() => {
    const ids = Array.isArray(activeCatalog.menu_ids) ? activeCatalog.menu_ids : [];
    return ids.map((id) => menuMap.get(String(id))).filter(Boolean);
  }, [activeCatalog.menu_ids, menuMap]);

  const draftSelectedMenus = useMemo(() => {
    return selectedMenuIds.map((id) => menuMap.get(String(id))).filter(Boolean);
  }, [selectedMenuIds, menuMap]);

  const draftSelectedSet = useMemo(
    () => new Set(selectedMenuIds.map((id) => String(id))),
    [selectedMenuIds]
  );

  const filteredPickerMenus = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return menus.filter((m) => {
      const matchCat =
        pickerCategory === "all" ||
        (pickerCategory === "selected" && draftSelectedSet.has(String(m.id))) ||
        String(m.category_id) === String(pickerCategory);

      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.categories?.name && m.categories.name.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [menus, pickerSearch, pickerCategory, draftSelectedSet]);

  const openModal = () => {
    const isConfigured = Boolean(activeCatalog.is_configured);
    setPeriodLabel(
      isConfigured ? activeCatalog.period_label : DEFAULT_CHEF_CATALOG.period_label
    );
    setTitle(isConfigured ? activeCatalog.title : DEFAULT_CHEF_CATALOG.title);
    setDescription(
      isConfigured ? activeCatalog.description : DEFAULT_CHEF_CATALOG.description
    );
    setSelectedMenuIds(activeSelectedMenus.map((m) => String(m.id)));
    setPickerSearch("");
    setPickerCategory("all");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setErrorMsg("");
  };

  const toggleDraftMenu = (menuId) => {
    const strId = String(menuId);
    setSelectedMenuIds((prev) =>
      prev.includes(strId) ? prev.filter((id) => id !== strId) : [...prev, strId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg("");
      const saved = await chefRecommendationService.saveCatalog({
        id: activeCatalog.id,
        period_label: periodLabel,
        title,
        description,
        menu_ids: selectedMenuIds,
      });
      onCatalogUpdated?.(saved);
      setIsModalOpen(false);
      setSuccessMsg(
        `Katalog Rekomendasi Chef berhasil disimpan (${saved.menu_ids.length} menu terpilih).`
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan katalog rekomendasi chef.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-2xs">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCECEB] text-[#C8100A] border border-[#F6D5D2]">
            <ChefHat className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                Katalog Rekomendasi Chef
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-medium border ${
                  activeSelectedMenus.length > 0
                    ? "bg-[#EBF5EE] text-emerald-800 border-emerald-200"
                    : "bg-[#FAF7F2] text-[#6B635B] border-[#E6DFD5]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    activeSelectedMenus.length > 0 ? "bg-emerald-600" : "bg-[#9A9086]"
                  }`}
                />
                {activeSelectedMenus.length} Menu Dipilih
              </span>
            </div>
            <p className="mt-0.5 text-[13.5px] text-[#575049]">
              Tulis catatan rekomendasi chef bulan ini / keadaan sekarang dan pilih beberapa menu yang tampil pada tab{" "}
              <strong className="font-semibold text-[#1C1917]">Rekomendasi Chef</strong> pelanggan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#292524] hover:bg-[#1C1917] text-[#FAF7F2] px-4 py-2.5 text-[13.5px] font-semibold transition shadow-2xs shrink-0 cursor-pointer"
        >
          <PencilSimple className="h-4 w-4" weight="duotone" />
          <span>Atur Katalog &amp; Pilih Menu</span>
        </button>
      </div>

      {/* Notifikasi */}
      {successMsg && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-[#EBF5EE] px-4 py-3 text-[13.5px] text-emerald-900">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700" weight="fill" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ringkasan Katalog Saat Ini */}
      <div className="mt-4">
        {loading ? (
          <div className="rounded-xl border border-[#EFE9E0] bg-[#FAF7F2] p-5 text-center text-[13.5px] text-[#6B635B]">
            Memuat katalog rekomendasi chef...
          </div>
        ) : activeCatalog.is_configured || activeSelectedMenus.length > 0 ? (
          <div className="rounded-xl border border-[#ECE5DA] bg-[#FAF7F2] p-4 space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                {activeCatalog.period_label && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8100A] text-white px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide">
                    <Sparkle className="h-3 w-3" weight="fill" />
                    <span>{activeCatalog.period_label}</span>
                  </span>
                )}
                <h3 className="text-[15px] font-bold text-[#1C1917]">
                  {activeCatalog.title || DEFAULT_CHEF_CATALOG.title}
                </h3>
                {activeCatalog.description ? (
                  <p className="text-[13px] text-[#575049] leading-relaxed whitespace-pre-line line-clamp-3">
                    {activeCatalog.description}
                  </p>
                ) : (
                  <p className="text-[13px] italic text-[#8A7F74]">
                    Belum ada tulisan catatan katalog chef.
                  </p>
                )}
              </div>
            </div>

            {/* Daftar Menu Terpilih */}
            <div className="pt-3 border-t border-[#E6DFD5]">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B635B] mb-2">
                Menu yang Ditampilkan ({activeSelectedMenus.length})
              </p>
              {activeSelectedMenus.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeSelectedMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E2D9CC] bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-[#292524] shadow-2xs"
                    >
                      {menu.image_url ? (
                        <img
                          src={menu.image_url}
                          alt={menu.name}
                          className="h-6 w-6 rounded-md object-cover border border-[#EFE9E0]"
                        />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F5EFE6] text-[#7C4D34]">
                          <Coffee className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span>{menu.name}</span>
                      {menu.categories?.name && (
                        <span className="text-[11px] text-[#78716C] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#EFE9E0]">
                          {menu.categories.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#6B635B]">
                  Belum ada menu yang dipilih. Klik{" "}
                  <button
                    type="button"
                    onClick={openModal}
                    className="font-semibold text-[#C8100A] hover:underline cursor-pointer"
                  >
                    Atur Katalog &amp; Pilih Menu
                  </button>{" "}
                  atau gunakan tombol{" "}
                  <span className="font-semibold text-[#292524]">
                    Jadikan Rekomendasi Chef
                  </span>{" "}
                  pada tabel menu di bawah.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D8CFC2] bg-[#FAF7F2] py-6 px-4 text-center">
            <p className="text-[14px] font-semibold text-[#1C1917]">
              Katalog Rekomendasi Chef belum diatur
            </p>
            <p className="mt-1 text-[13px] text-[#575049] max-w-lg mx-auto">
              Buat tulisan rekomendasi chef untuk bulan ini atau keadaan sekarang, lalu pilih beberapa menu yang cocok untuk tampil di tab{" "}
              <strong className="text-[#1C1917]">Rekomendasi Chef</strong> halaman pelanggan.
            </p>
            <button
              type="button"
              onClick={openModal}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#C8100A] hover:bg-[#A80D08] text-white px-4 py-2 text-[13px] font-semibold transition cursor-pointer"
            >
              <ChefHat className="h-4 w-4" weight="duotone" />
              <span>Mulai Atur Rekomendasi Chef</span>
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL KELOLA KATALOG & PILIH MENU REKOMENDASI CHEF ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-[#E6DFD5] my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EFE9E0] bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCECEB] text-[#C8100A] border border-[#F6D5D2]">
                  <ChefHat className="h-5 w-5" weight="duotone" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1C1917]">
                    Kelola Katalog Rekomendasi Chef
                  </h2>
                  <p className="text-[12.5px] text-[#575049]">
                    Ditampilkan saat pelanggan membuka tab &quot;Rekomendasi Chef&quot; di halaman Menu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Tutup modal rekomendasi chef"
                className="rounded-lg p-1.5 text-[#6B635B] hover:bg-[#FAF7F2] hover:text-[#1C1917] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              id="chef-catalog-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6"
            >
              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
                  <WarningCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" weight="fill" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ── BAGIAN 1: INPUT KATALOG TULISAN ── */}
              <div className="space-y-4 rounded-2xl border border-[#ECE5DA] bg-[#FAF7F2]/70 p-4 sm:p-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-[#C8100A]">
                    1. Katalog Tulisan Rekomendasi Chef
                  </span>
                  <p className="mt-0.5 text-[12.5px] text-[#575049]">
                    Tulis pesan atau pengantar katalog rekomendasi chef di bulan ini atau sesuai keadaan sekarang (musim, cuaca, momen spesial).
                  </p>
                </div>

                {/* Periode / Keadaan Sekarang */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#292524] mb-1">
                    Label Bulan Ini / Keadaan Sekarang
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    placeholder="Misal: Bulan Ini • November, Spesial Musim Hujan, Favorit Akhir Pekan"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2 text-[13.5px] text-[#1C1917] placeholder-[#9A9086] outline-none focus:border-[#C8100A] focus:ring-2 focus:ring-[#C8100A]/10 transition"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PERIOD_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPeriodLabel(preset)}
                        className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium border transition cursor-pointer ${
                          periodLabel === preset
                            ? "bg-[#C8100A] text-white border-[#C8100A]"
                            : "bg-white text-[#575049] border-[#E2D9CC] hover:border-[#C8100A]/50 hover:text-[#1C1917]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Judul Katalog */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#292524] mb-1">
                    Judul Katalog Rekomendasi *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Misal: Rekomendasi Chef Bulan Ini / Sajian Hangat untuk Hari Hujan"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2 text-[13.5px] font-semibold text-[#1C1917] placeholder-[#9A9086] outline-none focus:border-[#C8100A] focus:ring-2 focus:ring-[#C8100A]/10 transition"
                  />
                </div>

                {/* Tulisan / Catatan Katalog */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#292524] mb-1">
                    Tulisan / Catatan Katalog Chef
                  </label>
                  <textarea
                    rows="3"
                    maxLength={600}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tulis keterangan rekomendasi chef di bulan ini atau keadaan sekarang, misalnya rekomendasi minuman hangat untuk cuaca mendung beserta paduan pastry terbaik..."
                    className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2.5 text-[13.5px] text-[#1C1917] placeholder-[#9A9086] outline-none focus:border-[#C8100A] focus:ring-2 focus:ring-[#C8100A]/10 transition"
                  />
                </div>

                {/* Live Preview Tampilan Pelanggan */}
                <div className="rounded-xl border border-[#E2D9CC] border-l-4 border-l-[#C8100A] bg-[#FAF4E6] p-3.5 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B635B]">
                    Preview Katalog di Halaman Pelanggan
                  </p>
                  {periodLabel.trim() && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#C8100A] text-white px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider">
                      <ChefHat className="h-3 w-3" weight="fill" />
                      <span>{periodLabel.trim()}</span>
                    </span>
                  )}
                  <p className="text-[15px] font-bold text-[#141414]">
                    {title.trim() || DEFAULT_CHEF_CATALOG.title}
                  </p>
                  {description.trim() && (
                    <p className="text-[12.5px] text-[#474238] leading-relaxed whitespace-pre-line">
                      {description.trim()}
                    </p>
                  )}
                </div>
              </div>

              {/* ── BAGIAN 2: PILIH BEBERAPA MENU REKOMENDASI CHEF ── */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-[#C8100A]">
                      2. Pilih Menu yang Ditampilkan
                    </span>
                    <p className="mt-0.5 text-[12.5px] text-[#575049]">
                      Klik beberapa menu yang cocok untuk masuk ke daftar Rekomendasi Chef.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-[#FCECEB] text-[#C8100A] border border-[#F6D5D2] px-3 py-1 text-[12.5px] font-semibold">
                      {selectedMenuIds.length} Menu Dipilih
                    </span>
                    {selectedMenuIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMenuIds([])}
                        className="text-[12.5px] font-semibold text-[#6B635B] hover:text-rose-600 hover:underline cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    )}
                  </div>
                </div>

                {/* Chip Menu Terpilih */}
                {draftSelectedMenus.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#ECE5DA] bg-[#FAF7F2] p-2.5">
                    {draftSelectedMenus.map((menu) => (
                      <span
                        key={menu.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#C8100A]/30 pl-2.5 pr-1.5 py-1 text-[12px] font-semibold text-[#1C1917]"
                      >
                        <span>{menu.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleDraftMenu(menu.id)}
                          aria-label={`Hapus ${menu.name} dari rekomendasi chef`}
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FCECEB] text-[#C8100A] hover:bg-[#C8100A] hover:text-white transition cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" weight="bold" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Filter & Cari Menu di dalam Picker */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B635B] pointer-events-none" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Cari menu untuk dipilih..."
                      className="w-full rounded-xl border border-[#E2D9CC] bg-white pl-9 pr-3.5 py-2 text-[13px] text-[#1C1917] placeholder-[#9A9086] outline-none focus:border-[#C8100A] transition"
                    />
                  </div>
                  <select
                    value={pickerCategory}
                    onChange={(e) => setPickerCategory(e.target.value)}
                    className="sm:w-48 rounded-xl border border-[#E2D9CC] bg-white px-3 py-2 text-[13px] font-medium text-[#44403C] outline-none focus:border-[#C8100A] cursor-pointer"
                  >
                    <option value="all">Semua Kategori ({menus.length})</option>
                    <option value="selected">Terpilih ({draftSelectedMenus.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Multi-Select Menu */}
                {menus.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D8CFC2] bg-[#FAF7F2] p-6 text-center text-[13px] text-[#575049]">
                    Belum ada daftar menu di database. Tambahkan menu terlebih dahulu agar bisa dipilih.
                  </div>
                ) : filteredPickerMenus.length === 0 ? (
                  <div className="rounded-xl border border-[#EFE9E0] bg-[#FAF7F2] p-6 text-center text-[13px] text-[#575049]">
                    Tidak ada menu yang cocok dengan pencarian atau filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {filteredPickerMenus.map((menu) => {
                      const isSelected = draftSelectedSet.has(String(menu.id));
                      const hasPromo = Boolean(
                        menu.is_promo &&
                          !menu.is_expired &&
                          Number(menu.discounted_price || menu.price) < Number(menu.price || 0)
                      );
                      const displayPrice = hasPromo
                        ? Number(menu.discounted_price)
                        : Number(menu.price || 0);

                      return (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() => toggleDraftMenu(menu.id)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                            isSelected
                              ? "border-[#C8100A] bg-[#FCECEB]/55 ring-1 ring-[#C8100A]/20"
                              : "border-[#E6DFD5] bg-white hover:bg-[#FAF7F2] hover:border-[#D6CEC2]"
                          }`}
                        >
                          {/* Thumbnail */}
                          {menu.image_url ? (
                            <img
                              src={menu.image_url}
                              alt={menu.name}
                              className="h-12 w-12 shrink-0 rounded-lg object-cover border border-[#E6DFD5]"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F5EFE6] text-[#7C4D34] border border-[#E6DFD5]">
                              <Coffee className="h-5 w-5" weight="duotone" />
                            </div>
                          )}

                          {/* Info Menu */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13.5px] font-semibold text-[#1C1917] truncate">
                                {menu.name}
                              </p>
                              {!menu.is_available && (
                                <span className="shrink-0 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                                  Habis
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#575049] flex-wrap">
                              <span>{menu.categories?.name || "Menu"}</span>
                              <span>•</span>
                              <span className="font-semibold text-[#292524]">
                                Rp {displayPrice.toLocaleString("id-ID")}
                              </span>
                              {hasPromo && (
                                <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold">
                                  <Fire className="h-3 w-3" weight="fill" />
                                  Promo
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Checkbox Indicator */}
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "bg-[#C8100A] border-[#C8100A] text-white"
                                : "bg-white border-[#D6CEC2] text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" weight="bold" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-[#EFE9E0] bg-[#FAF7F2] shrink-0">
              <p className="text-[12.5px] text-[#575049] hidden sm:block">
                <strong className="text-[#1C1917]">{selectedMenuIds.length}</strong> menu akan tampil di tab{" "}
                <strong className="text-[#1C1917]">Rekomendasi Chef</strong>
              </p>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-[#E2D9CC] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#575049] hover:bg-[#F5EFE6] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="chef-catalog-form"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C8100A] hover:bg-[#A80D08] disabled:opacity-60 px-5 py-2 text-[13.5px] font-semibold text-white shadow-2xs transition cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Rekomendasi Chef</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
