import { useState, useEffect, useCallback } from "react";
import {
  Images,
  Plus,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  X,
  UploadSimple,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  menuHeroService,
  validateMenuHeroFile,
  MAX_MENU_HERO_SLIDES,
} from "../../services/menuHeroService";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  badge: "",
  orderIndex: 1,
  isActive: true,
};

/**
 * Panel admin untuk mengelola slide hero (carousel 3D) di halaman Menu publik.
 */
export default function MenuHeroSlidesManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFull = slides.length >= MAX_MENU_HERO_SLIDES;

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const loadSlides = useCallback(async () => {
    try {
      const data = await menuHeroService.getSlides(false);
      setSlides(data);
    } catch (err) {
      setErrorMsg("Gagal memuat slide hero menu: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const openAdd = () => {
    if (isFull) {
      setErrorMsg(
        `Maksimal ${MAX_MENU_HERO_SLIDES} foto slide. Hapus salah satu slide terlebih dahulu.`
      );
      return;
    }
    setEditingSlide(null);
    setForm({ ...EMPTY_FORM, orderIndex: slides.length + 1 });
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEdit = (slide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      badge: slide.badge || "",
      orderIndex: slide.order_index || 1,
      isActive: slide.is_active !== false,
    });
    setImageFile(null);
    setImagePreview(slide.image_url || "");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      validateMenuHeroFile(file);
    } catch (err) {
      alert(err.message);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingSlide && !imageFile) {
      alert("Foto slide wajib diupload.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      if (editingSlide) {
        await menuHeroService.update(editingSlide.id, {
          ...form,
          imageFile,
          currentImageUrl: editingSlide.image_url,
        });
        flashSuccess(`Slide "${form.title}" berhasil diperbarui.`);
      } else {
        await menuHeroService.create({ ...form, imageFile });
        flashSuccess(`Slide "${form.title}" berhasil ditambahkan ke hero halaman menu.`);
      }
      closeModal();
      await loadSlides();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan slide.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (slide) => {
    try {
      setErrorMsg("");
      await menuHeroService.toggleActive(slide.id, slide.is_active);
      flashSuccess(
        slide.is_active
          ? `Slide "${slide.title}" kini disembunyikan dari halaman menu.`
          : `Slide "${slide.title}" kini ditampilkan di halaman menu.`
      );
      await loadSlides();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Hapus slide "${slide.title}" secara permanen?`)) return;
    try {
      setErrorMsg("");
      await menuHeroService.remove(slide.id, slide.image_url);
      flashSuccess(`Slide "${slide.title}" berhasil dihapus.`);
      await loadSlides();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCECEB] text-[#C8100A] border border-[#F6D5D2]">
            <Images className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                Slide Hero Halaman Menu (Carousel Gelas)
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[13.5px] font-medium border ${
                  isFull
                    ? "bg-[#FDF2F1] text-[#C8100A] border-[#F6D5D2]"
                    : "bg-[#FAF7F2] text-[#6B635B] border-[#E6DFD5]"
                }`}
              >
                {slides.length} / {MAX_MENU_HERO_SLIDES} Foto
              </span>
            </div>
            <p className="mt-0.5 text-[13.5px] text-[#575049]">
              Kelola foto minuman unggulan yang berputar di bagian atas halaman Menu pelanggan (maksimal 5 foto).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAdd}
          disabled={isFull}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C8100A] hover:bg-[#A80D08] disabled:bg-[#E2DBD0] disabled:text-[#6B635B] disabled:cursor-not-allowed text-white px-4 py-2 text-[13.5px] font-semibold transition shadow-2xs cursor-pointer"
        >
          <Plus className="h-4 w-4" weight="bold" />
          <span>{isFull ? "Slot Penuh (Maks 5)" : "Tambah Slide"}</span>
        </button>
      </div>

      {/* Notifikasi */}
      {errorMsg && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] text-rose-800">
          <WarningCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" weight="fill" />
          <span className="flex-1">{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg("")} className="cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-[#EBF5EE] px-4 py-3 text-[13.5px] text-emerald-900">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700" weight="fill" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Daftar Slide */}
      <div className="mt-5">
        {loading ? (
          <p className="text-[13.5px] text-[#575049] py-6 text-center">Memuat slide...</p>
        ) : slides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D8CFC2] bg-[#FAF7F2] py-8 text-center">
            <p className="text-[13.5px] font-semibold text-[#292524]">Belum ada slide hero menu</p>
            <p className="text-[13.5px] text-[#575049] mt-1">
              Klik &quot;Tambah Slide&quot; untuk mengunggah foto minuman pertama Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={`rounded-xl border bg-[#FAF7F2] overflow-hidden transition ${
                  slide.is_active ? "border-[#E6DFD5]" : "border-[#E6DFD5] opacity-60"
                }`}
              >
                <div className="relative aspect-[3/4] bg-[#C8100A] flex items-end justify-center p-2.5">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="h-full w-full object-contain object-bottom drop-shadow-lg"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[13.5px] font-medium text-white">
                    #{slide.order_index}
                  </span>
                  <span
                    className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[13.5px] font-medium ${
                      slide.is_active ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {slide.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="p-3 bg-white">
                  {slide.badge && (
                    <p className="text-[13.5px] font-medium text-[#C8100A] truncate">
                      {slide.badge}
                    </p>
                  )}
                  <p className="text-[13.5px] font-semibold text-[#1C1917] truncate">{slide.title}</p>
                  <p className="text-[12.5px] text-[#575049] truncate">{slide.subtitle || "-"}</p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(slide)}
                      title={slide.is_active ? "Sembunyikan dari menu" : "Tampilkan ke menu"}
                      className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#E6DFD5] py-1.5 text-[#575049] hover:bg-[#FAF7F2] cursor-pointer"
                    >
                      {slide.is_active ? (
                        <EyeSlash className="h-4 w-4" weight="duotone" />
                      ) : (
                        <Eye className="h-4 w-4" weight="duotone" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(slide)}
                      title="Edit slide"
                      className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#E6DFD5] py-1.5 text-[#575049] hover:bg-[#FAF7F2] cursor-pointer"
                    >
                      <PencilSimple className="h-4 w-4" weight="duotone" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slide)}
                      title="Hapus slide"
                      className="flex-1 inline-flex items-center justify-center rounded-lg border border-rose-200 py-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash className="h-4 w-4" weight="duotone" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E6DFD5] my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFE9E0] pb-3.5">
              <h2 className="text-base sm:text-[17px] font-bold text-[#1C1917]">
                {editingSlide ? "Edit Slide Hero Menu" : "Tambah Slide Hero Menu"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-[#6B635B] hover:bg-[#FAF7F2] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Upload */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#292524] mb-1.5">
                  Foto Minuman *
                </label>
                <div className="relative flex gap-4 rounded-2xl border border-dashed border-[#D8CFC2] hover:border-[#C8100A] bg-[#FAF7F2] p-3.5 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-24 shrink-0 aspect-[3/4] rounded-xl bg-[#C8100A] flex items-end justify-center overflow-hidden p-1.5">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-contain object-bottom drop-shadow-lg"
                      />
                    ) : (
                      <UploadSimple className="h-7 w-7 text-white/85 mb-auto mt-auto" weight="duotone" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center text-[13.5px] text-[#6B635B] space-y-1">
                    <p className="font-semibold text-[#1C1917]">
                      {imagePreview ? "Klik untuk mengganti foto" : "Klik untuk memilih foto"}
                    </p>
                    <p>• Bebas mengunggah ukuran &amp; format gambar apa saja (JPG, PNG, WEBP, dll)</p>
                    <p>• Maksimal {MAX_MENU_HERO_SLIDES} foto slide</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#292524] mb-1.5">
                  Nama Minuman *
                </label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Misal: Minions"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2 text-sm text-[#1C1917] outline-none focus:border-[#C8100A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#292524] mb-1.5">
                    Subjudul / Keterangan Singkat
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Specialty Latte"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2 text-sm text-[#1C1917] outline-none focus:border-[#C8100A]"
                  />
                </div>
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#292524] mb-1.5">
                    Label Badge
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="New Recipe"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2 text-sm text-[#1C1917] outline-none focus:border-[#C8100A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#292524] mb-1.5">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={MAX_MENU_HERO_SLIDES}
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                    className="w-full rounded-xl border border-[#E2D9CC] bg-white px-3.5 py-2 text-sm text-[#1C1917] outline-none focus:border-[#C8100A]"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-[13.5px] font-semibold text-[#292524] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-[#C8100A]"
                  />
                  <span>{form.isActive ? "Tampil di menu" : "Disembunyikan"}</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EFE9E0]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#E2D9CC] px-4 py-2 text-[13.5px] font-medium text-[#575049] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#C8100A] hover:bg-[#A80D08] disabled:opacity-60 px-4 py-2 text-[13.5px] font-semibold text-white cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : editingSlide ? "Simpan Perubahan" : "Tambah Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
