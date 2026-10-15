import { useState, useEffect, useCallback } from "react";
import { eventService } from "../../services/eventService";
import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Load events
  const reloadEvents = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await eventService.getAll();
      setEvents(data || []);
    } catch (err) {
      setErrorMsg("Gagal memuat event: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await eventService.getAll();
        if (!ignore) {
          setEvents(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat event: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle pilih banner gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran banner maksimal 2 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDescription(evt.description || "");
    setStartDate(evt.start_date || "");
    setEndDate(evt.end_date || "");
    setIsActive(evt.is_active);
    setImageFile(null);
    setImagePreview(evt.image_url || "");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setImageFile(null);
    setImagePreview("");
  };

  // Simpan Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        title,
        description,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: isActive,
        image_url: editingEvent?.image_url,
      };

      if (editingEvent) {
        await eventService.update(
          editingEvent.id,
          payload,
          imageFile,
          editingEvent.image_url
        );
        setSuccessMsg(`Event "${title}" berhasil diperbarui!`);
      } else {
        await eventService.create(payload, imageFile);
        setSuccessMsg(`Event "${title}" berhasil ditambahkan!`);
      }

      handleCloseModal();
      await reloadEvents();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan event: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status aktif
  const handleToggleActive = async (evt) => {
    try {
      await eventService.toggleActive(evt.id, evt.is_active);
      setEvents((prev) =>
        prev.map((item) =>
          item.id === evt.id ? { ...item, is_active: !item.is_active } : item
        )
      );
    } catch (err) {
      setErrorMsg("Gagal mengubah status event: " + err.message);
    }
  };

  // Hapus event
  const handleDelete = async (evt) => {
    if (!window.confirm(`Hapus event "${evt.title}" secara permanen?`)) return;

    try {
      setErrorMsg("");
      await eventService.delete(evt.id, evt.image_url);
      setSuccessMsg(`Event "${evt.title}" berhasil dihapus.`);
      await reloadEvents();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus event: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Calendar className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Agenda & Event
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {events.length} Terdaftar
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Publikasikan workshop barista, temu komunitas, cupping session, dan perayaan spesial
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Event Baru</span>
        </button>
      </div>

      {/* Feedback Messages */}
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

      {/* Grid Cards Event */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-zinc-200/80 bg-white text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat agenda event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <Calendar className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Belum ada event terjadwal
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Buat agenda kegiatan atau acara menarik agar pengunjung mengetahui agenda terkini di SIDE LINE.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Event Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    {evt.image_url ? (
                      <img
                        src={evt.image_url}
                        alt={evt.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400 gap-1.5">
                        <ImageIcon className="h-8 w-8 stroke-[1.5] text-zinc-300" />
                        <span className="text-[11px] font-mono text-zinc-400">Tidak ada poster</span>
                      </div>
                    )}
                    {/* Active Status Badge on Image */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleActive(evt)}
                        title={evt.is_active ? "Klik untuk non-aktifkan" : "Klik untuk aktifkan"}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition shadow-xs cursor-pointer ${
                          evt.is_active
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            evt.is_active ? "bg-white animate-pulse" : "bg-zinc-400"
                          }`}
                        />
                        <span>{evt.is_active ? "Tayang" : "Draft"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-zinc-900 text-sm sm:text-base line-clamp-1 group-hover:text-zinc-950">
                      {evt.title}
                    </h3>

                    <p className="mt-2 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {evt.description || "Tidak ada rincian deskripsi tambahan."}
                    </p>

                    {/* Date info pill */}
                    <div className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 border border-zinc-200/60 font-mono text-[11px] text-zinc-600">
                      <CalendarDays className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">
                        {evt.start_date
                          ? new Date(evt.start_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Segera"}
                        {" → "}
                        {evt.end_date
                          ? new Date(evt.end_date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Selesai"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3">
                  <span className="text-[11px] font-mono text-zinc-400">
                    ID #{String(evt.id).slice(-4)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      title="Edit Event"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(evt)}
                      title="Hapus Event"
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

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div
            key={editingEvent ? `edit-${editingEvent.id}` : "add-new"}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingEvent ? "Edit Agenda Event" : "Tambah Agenda Event Baru"}
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
              Lengkapi judul event, tanggal pelaksanaan, banner visual, dan informasi detail acara.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Judul Event <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Latte Art Workshop & Cupping Session"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rincian acara, pemateri, kuota peserta, benefit atau instruksi registrasi..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Poster / Banner Visual (JPG / PNG, Maks 2MB)
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
                      alt="Banner Preview"
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
                  <span>Publikasikan langsung sebagai event aktif di website</span>
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
                  disabled={isSubmitting || !title.trim()}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingEvent ? "Simpan Perubahan" : "Terbitkan Event"}</span>
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
