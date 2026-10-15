import { useState, useEffect, useCallback } from "react";
import {
  teamService,
  DEFAULT_HEADER_SETTINGS,
} from "../../services/teamService";
import {
  Users2,
  UserPlus,
  Sparkles,
  Pencil,
  Trash2,
  Settings2,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Hash,
  UploadCloud,
  Link as LinkIcon,
  User,
} from "lucide-react";

function InstagramIcon({ className = "h-3 w-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Section Header Settings (OUR TEAM & Subtitle)
  const [headerTitle, setHeaderTitle] = useState(DEFAULT_HEADER_SETTINGS.title);
  const [headerSubtitle, setHeaderSubtitle] = useState(DEFAULT_HEADER_SETTINGS.subtitle);
  const [isSavingHeader, setIsSavingHeader] = useState(false);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [photoMode, setPhotoMode] = useState("file"); // 'file' | 'url'

  const reloadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const data = await teamService.getAll();
      setTeams(data || []);
    } catch (err) {
      setErrorMsg("Gagal memuat tim: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await teamService.getAll();
        const settings = teamService.getHeaderSettings();
        if (!ignore) {
          setTeams(data || []);
          setHeaderTitle(settings.title);
          setHeaderSubtitle(settings.subtitle);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat tim: " + (err.message || ""));
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveHeader = (e) => {
    e.preventDefault();
    setIsSavingHeader(true);
    try {
      teamService.saveHeaderSettings({
        title: headerTitle,
        subtitle: headerSubtitle,
      });
      setSuccessMsg("Pengaturan judul & sub-judul Tim berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan header: " + err.message);
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2 MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl("");
    }
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    setImagePreview(url);
    setImageFile(null);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName("");
    setRole("");
    setBio("");
    setInstagram("@sideline.coffee");
    setOrderIndex(teams.length + 1);
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setPhotoMode("file");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role);
    setBio(item.bio || "");
    setInstagram(item.instagram || "");
    setOrderIndex(item.order_index || 0);
    setImageFile(null);
    setImageUrl(item.photo_url || "");
    setImagePreview(item.photo_url || "");
    setPhotoMode(item.photo_url?.startsWith("http") ? "url" : "file");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const photoToSave = imageFile
        ? null
        : imageUrl.trim() || editingItem?.photo_url || null;

      const payload = {
        name,
        role,
        bio,
        instagram,
        order_index: orderIndex,
        photo_url: photoToSave,
      };

      if (editingItem) {
        await teamService.update(
          editingItem.id,
          payload,
          imageFile,
          editingItem.photo_url
        );
        setSuccessMsg("Profil anggota tim berhasil diperbarui!");
      } else {
        await teamService.create(payload, imageFile);
        setSuccessMsg("Anggota tim baru berhasil ditambahkan!");
      }

      handleCloseModal();
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan tim: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus anggota tim "${item.name}"?`)) return;

    try {
      setErrorMsg("");
      await teamService.delete(item.id, item.photo_url);
      setSuccessMsg("Anggota tim berhasil dihapus.");
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menghapus: " + err.message);
    }
  };

  const handleSeedDemo = async () => {
    if (
      !window.confirm(
        "Muat 4 profil contoh (Aaron Loeb, Drew Feig, Sacha Dubois, Juliana Silva) dengan tampilan background miring?"
      )
    ) {
      return;
    }

    try {
      setIsSeeding(true);
      setErrorMsg("");
      await teamService.seedDemoTemplates();
      setSuccessMsg("Berhasil memuat 4 profil tim contoh!");
      await reloadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal memuat template: " + (err.message || ""));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Users2 className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Tim & Barista
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {teams.length} Anggota
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola profil pendiri, head barista, dan tim kreatif cafe dengan tampilan slanted card modern
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleSeedDemo}
            disabled={isSeeding}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 transition disabled:opacity-50 cursor-pointer"
            title="Muat 4 profil tim template referensi"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isSeeding ? "Memuat..." : "Muat Data Referensi"}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* ── Notification Messages ── */}
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

      {/* ── Pengaturan Header Tampilan Tim (OUR TEAM & Subtitle) ── */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Pengaturan Teks Header Halaman Tim
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Konfigurasi judul besar dan deskripsi pengantar pada halaman publik (/team).
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveHeader} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Judul Utama
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                placeholder="Misal: OUR TEAM / TIM KAMI"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Deskripsi / Sub-judul
              </label>
              <input
                type="text"
                value={headerSubtitle}
                onChange={(e) => setHeaderSubtitle(e.target.value)}
                placeholder="Deskripsi singkat pengantar tim..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingHeader}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingHeader ? "Menyimpan..." : "Simpan Pengaturan Header"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Content List ── */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-zinc-200/80 bg-white text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat profil tim...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="p-16 text-center rounded-xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
              <Users2 className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Belum ada profil tim tersimpan di database
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
              Klik tombol di bawah untuk menambahkan anggota pertama, atau muat 4 data referensi langsung.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <button
                onClick={handleSeedDemo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Muat 4 Data Referensi</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Tambah Anggota Manual</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {teams.map((item, idx) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Visual Preview Header */}
                <div className="h-52 w-full overflow-hidden bg-zinc-950 relative p-4 flex items-center justify-center">
                  {/* Miniature Slanted Card Preview */}
                  <div className="w-28 aspect-[4/5] relative" style={{ transform: "skewX(-10deg)" }}>
                    <div className="w-full h-full overflow-hidden rounded-xs bg-zinc-900 shadow-lg border-l-2 border-l-[#FF0000] border-t border-t-[#FF0000]">
                      <div className="w-full h-full" style={{ transform: "skewX(10deg) scale(1.2)" }}>
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <User className="h-8 w-8 stroke-[1.5]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Miniature Badge */}
                    <div className="mt-1.5 flex items-stretch">
                      <div className="w-2 bg-[#FF0000]" />
                      <div className="flex-1 bg-black px-2 py-0.5 border-t border-r border-b border-white/20 border-b-[#FF0000]">
                        <div style={{ transform: "skewX(10deg)" }}>
                          <p className="text-[9px] font-black uppercase text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[8px] italic text-[#FF0000] truncate">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="absolute top-2.5 right-2.5 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/10">
                    #{item.order_index ?? idx + 1}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm truncate group-hover:text-zinc-950">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#FF0000] mt-0.5">
                      {item.role}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.bio || "Anggota tim berdedikasi SIDE LINE."}
                    </p>
                    {item.instagram && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                        <InstagramIcon className="h-3 w-3 text-zinc-400" />
                        <span className="truncate">{item.instagram}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-zinc-100 pt-3">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Anggota"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Hapus Anggota"
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

      {/* ── Modal Input / Edit Anggota Tim ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Users2 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingItem ? "Edit Profil Anggota Tim" : "Tambah Anggota Tim Baru"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-4">
              Profil anggota otomatis ditampilkan dengan bingkai kartu miring (slanted card) di halaman Tim Kami.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* ── Left Col: Form Inputs ── */}
                <div className="sm:col-span-2 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Misal: AARON LOEB"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                        Jabatan / Posisi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Misal: Head Barista / Roaster"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                        Urutan Tampil
                      </label>
                      <input
                        type="number"
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Akun Instagram
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@sideline.coffee"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 font-mono placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                      Bio Singkat
                    </label>
                    <textarea
                      rows="2"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Dedikasi, moto, atau peran dalam meracik kopi..."
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                    />
                  </div>

                  {/* Foto Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                        Foto Profil
                      </label>
                      <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-0.5 text-[11px] font-medium">
                        <button
                          type="button"
                          onClick={() => setPhotoMode("file")}
                          className={`px-2 py-0.5 rounded transition ${
                            photoMode === "file"
                              ? "bg-white text-zinc-900 shadow-xs font-semibold"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoMode("url")}
                          className={`px-2 py-0.5 rounded transition ${
                            photoMode === "url"
                              ? "bg-white text-zinc-900 shadow-xs font-semibold"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          Link URL
                        </button>
                      </div>
                    </div>

                    {photoMode === "file" ? (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
                      />
                    ) : (
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://... atau /team/aaron-loeb.png"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                      />
                    )}
                  </div>
                </div>

                {/* ── Right Col: Live Preview of the Slanted Card ── */}
                <div className="sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF0000] mb-3">
                    Live Preview Kartu
                  </p>

                  <div className="w-full max-w-[150px]">
                    {/* Slanted Photo Box */}
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-xs shadow-xl border border-white/10"
                      style={{
                        transform: "skewX(-12deg)",
                        background: "linear-gradient(145deg, #18181b 0%, #000000 100%)",
                      }}
                    >
                      {/* Top-Left Red Accent */}
                      <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#FF0000] z-20" />
                      <div className="absolute top-0 left-0 w-[3px] h-16 bg-[#FF0000] z-20 shadow-[0_0_8px_#FF0000]" />

                      {/* Unskewed Photo */}
                      <div
                        className="w-full h-full"
                        style={{ transform: "skewX(12deg) scale(1.22)" }}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <User className="h-8 w-8 stroke-[1.5]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slanted Badge */}
                    <div
                      className="mt-2 flex items-stretch shadow-md"
                      style={{ transform: "skewX(-12deg)" }}
                    >
                      <div className="w-2 bg-[#FF0000] shrink-0" />
                      <div className="flex-1 bg-black px-2 py-1 border-t border-r border-b border-white/20 border-b-[#FF0000]">
                        <div style={{ transform: "skewX(12deg)" }}>
                          <p className="font-heading font-black uppercase tracking-wider text-white text-[10px] leading-tight truncate">
                            {name || "NAMA ANGGOTA"}
                          </p>
                          <p className="font-heading italic font-semibold text-[#FF0000] text-[8px] truncate">
                            {role || "Jabatan"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
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
                  disabled={isSubmitting || !name.trim() || !role.trim()}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Simpan Anggota"}</span>
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
