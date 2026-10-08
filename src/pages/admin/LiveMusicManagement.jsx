import { useState, useEffect, useCallback } from "react";
import { liveMusicService } from "../../services/liveMusicService";

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
      setSchedules(data);
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
          setSchedules(data);
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
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Live Music Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola jadwal pertunjukan musik langsung, nama musisi/band, dan poster acara
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition"
        >
          <span>🎵</span>
          <span>Tambah Jadwal Live Music</span>
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
            <p className="mt-3 text-sm">Memuat jadwal live music...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-slate-200 bg-white">
            <span className="text-5xl">🎸</span>
            <p className="mt-4 text-base font-semibold text-slate-700">
              Belum ada jadwal live music
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan jadwal akustik atau live music untuk ditampilkan di website.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              Tambah Jadwal Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {item.image_url ? (
                  <div className="h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-amber-50 text-3xl text-amber-600">
                    🎤
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition ${
                          item.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.is_active ? "bg-emerald-600" : "bg-slate-400"
                          }`}
                        />
                        {item.is_active ? "Aktif" : "Non-Aktif"}
                      </button>
                    </div>

                    {item.performer && (
                      <p className="mt-1 text-xs font-semibold text-amber-600">
                        Performer: {item.performer}
                      </p>
                    )}

                    <p className="mt-2 text-xs font-mono font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      ⏰ {item.day_time}
                    </p>

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
              {editingItem ? "Edit Jadwal Live Music" : "Tambah Jadwal Live Music"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Lengkapi tema acara, pengisi acara, dan waktu pertunjukan
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Sesi / Acara *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Acoustic Sunset Friday"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Musisi / Bintang Tamu
                  </label>
                  <input
                    type="text"
                    value={performer}
                    onChange={(e) => setPerformer(e.target.value)}
                    placeholder="Misal: Daffa & Friends"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Hari & Waktu *
                  </label>
                  <input
                    type="text"
                    required
                    value={dayTime}
                    onChange={(e) => setDayTime(e.target.value)}
                    placeholder="Setiap Jumat | 19:30 WIB"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                  />
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
                  placeholder="Genre musik atau keseruan acara..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Poster / Foto Event (JPG/PNG, Max 2MB)
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
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Tampilkan Sebagai Jadwal Aktif</span>
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
                  disabled={isSubmitting || !title.trim() || !dayTime.trim()}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
