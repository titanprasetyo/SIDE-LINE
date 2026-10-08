import { useState, useEffect, useCallback } from "react";
import { spaceBookingService } from "../../services/spaceBookingService";

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
      setSpaces(data);
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
          setSpaces(data);
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
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Booking & Sewa Tempat
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pilihan ruang meeting, perayaan acara privat, kapasitas, fasilitas, dan kontak booking
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition"
        >
          <span>🏢</span>
          <span>Tambah Paket Tempat</span>
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-200 bg-white text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
            <p className="mt-3 text-sm">Memuat data booking tempat...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-slate-200 bg-white">
            <span className="text-5xl">📋</span>
            <p className="mt-4 text-base font-semibold text-slate-700">
              Belum ada paket sewa tempat
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan opsi ruang meeting atau gathering agar pengunjung bisa memesan.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Tambah Paket Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spaces.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {item.image_url && (
                  <div className="h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition ${
                          item.is_available
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.is_available ? "bg-emerald-600" : "bg-red-600"
                          }`}
                        />
                        {item.is_available ? "Tersedia" : "Penuh / Tutup"}
                      </button>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      {item.capacity && <p>👥 <strong>Kapasitas:</strong> {item.capacity}</p>}
                      {item.price_info && <p>💰 <strong>Tarif:</strong> {item.price_info}</p>}
                      {item.facilities && <p>✨ <strong>Fasilitas:</strong> {item.facilities}</p>}
                    </div>

                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                      {item.description || "Tidak ada deskripsi tambahan."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      🗑️ Hapus
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? "Edit Paket Sewa Tempat" : "Tambah Paket Sewa Tempat"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Cantumkan rincian ruang, kapasitas, fasilitas pendukung, dan kontak pemesanan
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Paket / Ruang *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Meeting Room VIP Lantai 2"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Kapasitas (Orang)
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="10 - 25 Orang"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Informasi Biaya / Tarif
                  </label>
                  <input
                    type="text"
                    value={priceInfo}
                    onChange={(e) => setPriceInfo(e.target.value)}
                    placeholder="Mulai Rp 50.000 / orang"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Fasilitas yang Didapat
                </label>
                <input
                  type="text"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  placeholder="Wi-Fi, Layar TV/Proyektor, AC, Sound System..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nomor WhatsApp Reservasi
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Ruang
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ketentuan, suasana ruang, atau syarat booking..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Foto Area (Opsional, Max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-full rounded-lg object-cover border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Tersedia untuk Pemesanan</span>
                </label>
              </div>

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
                  disabled={isSubmitting || !name.trim()}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
