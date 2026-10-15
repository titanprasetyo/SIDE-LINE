import { useState, useEffect, useCallback } from "react";
import { spaceBookingService } from "../../services/spaceBookingService";
import {
  Building2,
  Users,
  CreditCard,
  Sparkles,
  Phone,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function SpaceBookingManagement() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
  const [isAvailable, setIsAvailable] = useState(true);
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
    setIsAvailable(true);
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCapacity(item.capacity || "");
    setFacilities(item.facilities || "");
    setPriceInfo(item.price_info || "");
    setContactPhone(item.contact_phone || "");
    setDescription(item.description || "");
    setIsAvailable(item.is_available);
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
        setSuccessMsg("Informasi paket booking berhasil diperbarui!");
      } else {
        await spaceBookingService.create(payload, imageFile);
        setSuccessMsg("Paket booking baru berhasil ditambahkan!");
      }

      handleCloseModal();
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await spaceBookingService.toggleAvailability(item.id, item.is_available);
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, is_available: !s.is_available } : s
        )
      );
    } catch (err) {
      setErrorMsg("Gagal mengubah status: " + err.message);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Building2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Sewa Tempat & Private Space
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {spaces.length} Ruangan
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola pilihan ruang meeting, perayaan acara privat, kapasitas, fasilitas, dan kontak reservasi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Paket Ruang</span>
        </button>
      </div>

      {/* Messages */}
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

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-zinc-200/80 bg-white text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat paket ruangan...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <Building2 className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Belum ada paket sewa tempat
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Tambahkan opsi ruang meeting, area lantai 2, atau gathering room agar pengunjung bisa memesan.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Paket Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {spaces.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {item.image_url ? (
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          title={item.is_available ? "Klik untuk tutup pemesanan" : "Klik untuk buka pemesanan"}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition shadow-xs cursor-pointer ${
                            item.is_available
                              ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                              : "bg-rose-500/90 text-white hover:bg-rose-600"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          <span>{item.is_available ? "Tersedia" : "Penuh / Tutup"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 pb-0 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                          item.is_available
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_available ? "bg-emerald-600" : "bg-rose-600"}`} />
                        <span>{item.is_available ? "Tersedia" : "Penuh / Tutup"}</span>
                      </button>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-bold text-zinc-900 text-base group-hover:text-zinc-950">
                      {item.name}
                    </h3>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.capacity && (
                        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 border border-zinc-200/60 text-zinc-700">
                          <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="font-medium truncate">{item.capacity}</span>
                        </div>
                      )}
                      {item.price_info && (
                        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 border border-zinc-200/60 text-zinc-700 font-mono">
                          <CreditCard className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="font-semibold truncate">{item.price_info}</span>
                        </div>
                      )}
                    </div>

                    {item.facilities && (
                      <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-zinc-50/70 p-2.5 border border-zinc-200/60 text-xs text-zinc-600">
                        <Sparkles className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed line-clamp-2">{item.facilities}</span>
                      </div>
                    )}

                    {item.contact_phone && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 font-mono">
                        <Phone className="h-3 w-3 text-zinc-400" />
                        <span>WhatsApp: {item.contact_phone}</span>
                      </div>
                    )}

                    <p className="mt-2.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.description || "Tidak ada deskripsi tambahan untuk paket ruang ini."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3">
                  <span className="text-[11px] font-mono text-zinc-400">
                    ID #{String(item.id).slice(-4)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Ruang"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Hapus Ruang"
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingItem ? "Edit Paket Ruangan" : "Tambah Paket Ruangan Baru"}
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
              Lengkapi nama area, kapasitas tamu, sarana fasilitas, estimasi tarif, dan nomor kontak reservasi.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nama Paket / Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: VIP Meeting Room Lantai 2"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Kapasitas Ruang
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="10 - 25 Orang"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Tarif / Biaya Sewa
                  </label>
                  <input
                    type="text"
                    value={priceInfo}
                    onChange={(e) => setPriceInfo(e.target.value)}
                    placeholder="Mulai Rp 50.000 / orang"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Fasilitas yang Didapat
                </label>
                <input
                  type="text"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  placeholder="AC Dingin, High-speed Wi-Fi, Smart TV 55 inci, Whiteboard..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nomor WhatsApp Reservasi
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 font-mono placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Deskripsi / Ketentuan Sewa
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Durasi minimal sewa, ketentuan konsumsi, cara pelunasan uang muka..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Foto Area (Opsional, JPG / PNG, Maks 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-zinc-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>Buka untuk reservasi online pelanggan</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
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
                  disabled={isSubmitting || !name.trim()}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Terbitkan Paket"}</span>
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
