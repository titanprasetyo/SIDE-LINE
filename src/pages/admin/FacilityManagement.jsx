import { useState, useEffect, useCallback } from "react";
import { facilityService } from "../../services/facilityService";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";

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
      setFacilities(data || []);
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
          setFacilities(data || []);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Fasilitas Cafe
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {facilities.length} Fasilitas
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola fasilitas kenyamanan bagi pengunjung (Wi-Fi kencang, musholla, colokan listrik, parkir)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Fasilitas</span>
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
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat daftar fasilitas...</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <Sparkles className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Belum ada fasilitas terdaftar
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Tambahkan fasilitas penunjang untuk meyakinkan pengunjung berkunjung dan betah di cafe.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Fasilitas Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilities.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl border border-zinc-200/60 shadow-xs">
                    {item.icon || "✨"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-zinc-900 text-sm group-hover:text-zinc-950 truncate">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {item.description || "Fasilitas penunjang kenyamanan pelanggan di SIDE LINE."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-[11px] font-mono text-zinc-400">
                    ID #{String(item.id).slice(-4)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Fasilitas"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Hapus Fasilitas"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingItem ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}
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
              Tulis nama fasilitas dan pilih ikon penanda untuk kemudahan identifikasi pengunjung.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nama Fasilitas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Dedicated High-speed Wi-Fi 100Mbps"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Ikon Penanda
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-14 text-center text-xl rounded-lg border border-zinc-200 py-1.5 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                  <div className="flex-1 flex flex-wrap gap-1.5 items-center p-1.5 rounded-lg border border-zinc-200 bg-zinc-50">
                    {quickIcons.map((ic) => (
                      <button
                        type="button"
                        key={ic}
                        onClick={() => setIcon(ic)}
                        className="text-base p-1 hover:bg-white rounded transition cursor-pointer"
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan ketersediaan colokan di tiap meja atau kenyamanan ruang..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
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
                    <span>{editingItem ? "Simpan Perubahan" : "Simpan Fasilitas"}</span>
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
