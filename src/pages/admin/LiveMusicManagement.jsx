import { useState, useEffect, useCallback } from "react";
import { liveMusicService } from "../../services/liveMusicService";
import {
  Music2,
  Mic2,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export default function LiveMusicManagement() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [performer, setPerformer] = useState("");
  const [dayTime, setDayTime] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const reloadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await liveMusicService.getAll();
      setSchedules(data || []);
    } catch (err) {
      setErrorMsg("Gagal memuat jadwal live music: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await liveMusicService.getAll();
        if (!ignore) {
          setSchedules(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat jadwal live music: " + (err.message || ""));
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
        alert("Ukuran poster maksimal 2 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle("");
    setPerformer("");
    setDayTime("");
    setDescription("");
    setIsActive(true);
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setPerformer(item.performer || "");
    setDayTime(item.day_time);
    setDescription(item.description || "");
    setIsActive(item.is_active);
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
    if (!title.trim() || !dayTime.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        title,
        performer,
        day_time: dayTime,
        description,
        is_active: isActive,
        image_url: editingItem?.image_url,
      };

      if (editingItem) {
        await liveMusicService.update(
          editingItem.id,
          payload,
          imageFile,
          editingItem.image_url
        );
        setSuccessMsg("Jadwal live music berhasil diperbarui!");
      } else {
        await liveMusicService.create(payload, imageFile);
        setSuccessMsg("Jadwal live music berhasil ditambahkan!");
      }

      handleCloseModal();
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan live music: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await liveMusicService.toggleActive(item.id, item.is_active);
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (err) {
      setErrorMsg("Gagal mengubah status: " + err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus jadwal live music "${item.title}"?`)) return;

    try {
      setErrorMsg("");
      await liveMusicService.delete(item.id, item.image_url);
      setSuccessMsg("Jadwal live music berhasil dihapus.");
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
              <Music2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Jadwal Live Music
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {schedules.length} Sesi
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola jadwal pertunjukan musik akustik, band pengisi, dan waktu tayang di cafe
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Jadwal Musik</span>
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

      {/* Grid Cards */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-zinc-200/80 bg-white text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat jadwal musik...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <Music2 className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Belum ada jadwal live music
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Tambahkan pertunjukan akustik mingguan untuk memperkaya suasana santai pengunjung.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Jadwal Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Poster Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400 gap-1.5">
                        <Music2 className="h-8 w-8 stroke-[1.5] text-zinc-300" />
                        <span className="text-[11px] font-mono text-zinc-400">Tanpa poster</span>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.is_active ? "Non-aktifkan sesi ini" : "Aktifkan sesi ini"}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition shadow-xs cursor-pointer ${
                          item.is_active
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.is_active ? "bg-white animate-pulse" : "bg-zinc-400"
                          }`}
                        />
                        <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-zinc-900 text-sm sm:text-base line-clamp-1 group-hover:text-zinc-950">
                      {item.title}
                    </h3>

                    {item.performer && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                        <Mic2 className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{item.performer}</span>
                      </div>
                    )}

                    {/* Schedule Time Pill */}
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 border border-zinc-200/60 font-mono text-[11px] text-zinc-700 font-medium">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{item.day_time}</span>
                    </div>

                    <p className="mt-2.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.description || "Tidak ada deskripsi tambahan untuk sesi ini."}
                    </p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3">
                  <span className="text-[11px] font-mono text-zinc-400">
                    ID #{String(item.id).slice(-4)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Jadwal"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Hapus Jadwal"
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
                  <Music2 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingItem ? "Edit Jadwal Musik" : "Tambah Jadwal Musik Baru"}
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
              Lengkapi tema musik, nama musisi/band, jadwal tampil, dan poster acara.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Tema Acara / Judul <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Acoustic Friday Vibes / Weekend Jazz Session"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Musisi / Penampil
                </label>
                <input
                  type="text"
                  value={performer}
                  onChange={(e) => setPerformer(e.target.value)}
                  placeholder="Misal: Luna Trio & Friends / The Coffee Vibes"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Jadwal Waktu & Hari <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dayTime}
                  onChange={(e) => setDayTime(e.target.value)}
                  placeholder="Misal: Setiap Jumat & Sabtu, 19:30 - 22:30 WIB"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Deskripsi / Info Khusus
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Genre musik, kolaborasi musisi lokal, atau dress code santai..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Poster Visual (JPG / PNG, Maks 2MB)
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
                      alt="Poster Preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span>Tayangkan jadwal di website utama</span>
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
                  disabled={isSubmitting || !title.trim() || !dayTime.trim()}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Terbitkan Jadwal"}</span>
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
