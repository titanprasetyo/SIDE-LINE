import { useState, useEffect, useCallback } from "react";
import { facilityService } from "../../services/facilityService";

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [description, setDescription] = useState("");

  const reloadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await facilityService.getAll();
      setFacilities(data);
    } catch (err) {
      setErrorMsg("Gagal memuat fasilitas: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await facilityService.getAll();
        if (!ignore) {
          setFacilities(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat fasilitas: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName("");
    setIcon("✨");
    setDescription("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setIcon(item.icon || "✨");
    setDescription(item.description || "");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        name,
        icon,
        description,
      };

      if (editingItem) {
        await facilityService.update(editingItem.id, payload);
        setSuccessMsg("Fasilitas berhasil diperbarui!");
      } else {
        await facilityService.create(payload);
        setSuccessMsg("Fasilitas baru berhasil ditambahkan!");
      }

      handleCloseModal();
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan fasilitas: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus fasilitas "${item.name}"?`)) return;

    try {
      setErrorMsg("");
      await facilityService.delete(item.id);
      setSuccessMsg("Fasilitas berhasil dihapus.");
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus: " + err.message);
    }
  };

  const quickIcons = ["🚻", "🎲", "📶", "🔌", "🕌", "🌿", "🅿️", "🎮", "❄️", "☕", "👶", "🚬"];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fasilitas Café
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola fasilitas kenyamanan bagi pengunjung (toilet, games, Wi-Fi, musholla, dll)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition"
        >
          <span>✨</span>
          <span>Tambah Fasilitas</span>
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
            <p className="mt-3 text-sm">Memuat daftar fasilitas...</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-slate-200 bg-white">
            <span className="text-5xl">✨</span>
            <p className="mt-4 text-base font-semibold text-slate-700">
              Belum ada fasilitas terdaftar
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan fasilitas penunjang untuk meyakinkan pengunjung datang ke café Anda.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Tambah Fasilitas Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilities.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl border border-amber-100">
                    {item.icon || "✨"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {item.description || "Fasilitas penunjang kenyamanan di SIDE LINE."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
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
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Masukkan nama fasilitas dan pilih ikon yang menggambarkan
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Fasilitas *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Toilet Bersih & Wangi"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Ikon / Emoji
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-16 text-center text-xl rounded-lg border border-slate-300 py-1.5 outline-none focus:border-amber-500"
                  />
                  <div className="flex-1 flex flex-wrap gap-1.5 items-center p-1.5 rounded-lg border border-slate-200 bg-slate-50">
                    {quickIcons.map((ic) => (
                      <button
                        type="button"
                        key={ic}
                        onClick={() => setIcon(ic)}
                        className="text-lg p-1 hover:bg-white rounded transition"
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan kenyamanan atau detail fasilitas..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
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
                  {isSubmitting ? "Menyimpan..." : "Simpan Fasilitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
