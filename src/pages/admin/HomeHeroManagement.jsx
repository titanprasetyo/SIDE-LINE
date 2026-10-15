import { useState, useEffect, useCallback } from "react";
import { homeBannerService } from "../../services/homeBannerService";
import defaultHeroPrimary from "../../assets/hero-default-primary.jpg";
import {
  LayoutTemplate,
  Flame,
  UploadCloud,
  Save,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ZoomIn,
  Sparkles,
  BookOpen,
  ArrowRightLeft,
  Check,
} from "lucide-react";

export default function HomeHeroManagement() {
  // Hero State
  const [heroBanner, setHeroBanner] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [isUpdatingHero, setIsUpdatingHero] = useState(false);

  // About Stories State
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State for About Story
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Form Fields for About Story
  const [formData, setFormData] = useState({
    photo_label: "BERANDA",
    badge: "ARSIP SUASANA",
    kicker: "TENTANG SIDE LINE",
    heading: "LEBIH DARI SEKADAR CAFE, SEBUAH RUANG JEDA BERMAKNA.",
    paragraph1:
      "SIDE LINE bermula dari sebuah gagasan sederhana: menciptakan tempat perlindungan dari kesibukan harian, di mana aroma seduhan kopi segar dan kehangatan interior menyatu dalam harmoni.",
    paragraph2:
      "Setiap sudut ditata dengan cermat agar Anda dapat menikmati waktu berkualitas—baik saat mengerjakan proyek penting, menikmati bacaan, maupun mengobrol hangat bersama teman terdekat.",
    highlight1_title: "SENI SANGRAI KOPI",
    highlight1_desc:
      "Biji kopi terkurasi melalui kurasi sangrai teliti untuk menonjolkan profil rasa otentik.",
    highlight2_title: "TATA RUANG ARSITEKTURAL",
    highlight2_desc:
      "Tata ruang minimalis beraksen kayu hangat untuk privasi maupun interaksi sosial santai.",
    order_index: 1,
    is_active: true,
  });
  const [storyImageFile, setStoryImageFile] = useState(null);
  const [storyImagePreview, setStoryImagePreview] = useState("");

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const [heroData, storiesData] = await Promise.all([
        homeBannerService.getHero(),
        homeBannerService.getAboutStories(false), // all including inactive
      ]);
      setHeroBanner(heroData);
      setStories(storiesData || []);
    } catch (err) {
      setErrorMsg("Gagal memuat data: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Hero File Select & Upload
  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5 MB!");
        return;
      }
      setHeroFile(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveHero = async () => {
    if (!heroFile) {
      alert("Pilih file foto baru terlebih dahulu.");
      return;
    }
    try {
      setIsUpdatingHero(true);
      setErrorMsg("");
      await homeBannerService.saveHero(heroFile);
      setHeroFile(null);
      setHeroPreview("");
      setSuccessMsg("Foto Hero Utama berhasil diperbarui!");
      await loadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan foto hero: " + err.message);
    } finally {
      setIsUpdatingHero(false);
    }
  };

  // Open Modal Tambah Story
  const handleOpenAddStory = () => {
    setEditingStory(null);
    setFormData({
      photo_label: `BERANDA${stories.length > 0 ? stories.length + 1 : ""}`,
      badge: "ARSIP SUASANA",
      kicker: "TENTANG SIDE LINE",
      heading: "LEBIH DARI SEKADAR CAFE, SEBUAH RUANG JEDA BERMAKNA.",
      paragraph1:
        "SIDE LINE bermula dari sebuah gagasan sederhana: menciptakan tempat perlindungan dari kesibukan harian, di mana aroma seduhan kopi segar dan kehangatan interior menyatu dalam harmoni.",
      paragraph2:
        "Setiap sudut ditata dengan cermat agar Anda dapat menikmati waktu berkualitas—baik saat mengerjakan proyek penting, menikmati bacaan, maupun mengobrol hangat bersama teman terdekat.",
      highlight1_title: "SENI SANGRAI KOPI",
      highlight1_desc:
        "Biji kopi terkurasi melalui kurasi sangrai teliti untuk menonjolkan profil rasa otentik.",
      highlight2_title: "TATA RUANG ARSITEKTURAL",
      highlight2_desc:
        "Tata ruang minimalis beraksen kayu hangat untuk privasi maupun interaksi sosial santai.",
      order_index: stories.length + 1 || 1,
      is_active: true,
    });
    setStoryImageFile(null);
    setStoryImagePreview("");
    setIsModalOpen(true);
  };

  // Open Modal Edit Story
  const handleOpenEditStory = (story) => {
    setEditingStory(story);
    setFormData({
      id: story.id,
      image_url: story.image_url,
      photo_label: story.photo_label || "HOMEPAGE",
      badge: story.badge || "AMBIENCE ARCHIVE",
      kicker: story.kicker || "ABOUT THE BRAND",
      heading: story.heading || "NOT JUST A CAFE, A THOUGHTFUL INTERLUDE.",
      paragraph1: story.paragraph1 || "",
      paragraph2: story.paragraph2 || "",
      highlight1_title: story.highlight1_title || "",
      highlight1_desc: story.highlight1_desc || "",
      highlight2_title: story.highlight2_title || "",
      highlight2_desc: story.highlight2_desc || "",
      order_index: story.order_index ?? 1,
      is_active: story.is_active ?? true,
    });
    setStoryImageFile(null);
    setStoryImagePreview(story.image_url || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
    setStoryImageFile(null);
    setStoryImagePreview("");
  };

  const handleStoryFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5 MB!");
        return;
      }
      setStoryImageFile(file);
      setStoryImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Story (Create / Update)
  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!editingStory && !storyImageFile) {
      setErrorMsg("Harap pilih foto untuk cerita About!");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      await homeBannerService.saveAboutStory(
        {
          ...formData,
          id: editingStory?.id,
          image_url: editingStory?.image_url,
        },
        storyImageFile
      );

      setSuccessMsg(
        editingStory
          ? "Cerita About berhasil diperbarui!"
          : "Cerita About baru berhasil ditambahkan!"
      );
      handleCloseModal();
      await loadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan cerita About: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStoryActive = async (story) => {
    try {
      await homeBannerService.toggleActive(story.id, story.is_active);
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, is_active: !s.is_active } : s))
      );
      setSuccessMsg(`Status tayang "${story.heading}" berhasil diubah!`);
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      setErrorMsg("Gagal mengubah status: " + err.message);
    }
  };

  const handleDeleteStory = async (story) => {
    if (window.confirm(`Hapus cerita About "${story.heading}" ini?`)) {
      try {
        await homeBannerService.deleteAboutStory(story.id, story.image_url);
        setStories((prev) => prev.filter((s) => s.id !== story.id));
        setSuccessMsg("Cerita About berhasil dihapus!");
        setTimeout(() => setSuccessMsg(""), 3500);
      } catch (err) {
        setErrorMsg("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <LayoutTemplate className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Hero & Cerita Beranda
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola foto hero visual utama paling atas dan narasi visual About dengan tata letak zigzag interaktif
          </p>
        </div>
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

      {/* =====================================================================
          BAGIAN 1: 1 FOTO HERO UTAMA (PALING ATAS)
      ===================================================================== */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-mono font-bold">
                01
              </span>
              <h2 className="text-base font-bold text-zinc-900">
                Foto Hero Utama (Paling Atas)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Foto portrait ini tampil pada frame visual utama tepat di samping headline beranda.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-mono font-semibold text-zinc-700 border border-zinc-200/80">
            <Flame className="h-3 w-3 text-[#FF0000]" />
            <span>Frame Tunggal</span>
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Preview Foto Hero Saat Ini */}
          <div className="md:col-span-5 flex justify-center py-2">
            <div className="relative w-full max-w-[240px]">
              <div className="relative aspect-[4/4.9] w-full overflow-hidden shadow-md rounded-lg bg-zinc-100 border border-zinc-200/80">
                <img
                  src={heroPreview || heroBanner?.image_url || defaultHeroPrimary}
                  alt="Current Hero"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pt-2 px-1 flex items-baseline justify-between text-[10px] font-mono uppercase text-zinc-500 font-bold">
                <span className="truncate">HERO UTAMA (BERANDA)</span>
                <span className="text-[#FF0000] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF0000] animate-pulse" />
                  AKTIF
                </span>
              </div>
            </div>
          </div>

          {/* Form Ganti Foto Hero */}
          <div className="md:col-span-7 space-y-4">
            <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
              <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Status Foto Hero Saat Ini:</span>
              </p>
              <p className="text-zinc-600">
                {heroBanner?.image_url ? (
                  <span className="text-emerald-700 font-medium">
                    Menggunakan foto kustom yang telah diunggah oleh admin.
                  </span>
                ) : (
                  <span className="text-zinc-500">
                    Saat ini menggunakan foto kurasi bawaan (default). Anda dapat menggantinya dengan foto suasana asli cafe Anda di bawah.
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Pilih File Foto Hero Baru
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroFileChange}
                className="w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 cursor-pointer"
              />
              <p className="mt-1.5 text-[11px] font-mono text-zinc-400">
                Rasio portrait disarankan 4:5 vertikal. Format JPG, PNG, WebP (maks 5MB).
              </p>
            </div>

            {heroFile && (
              <button
                type="button"
                onClick={handleSaveHero}
                disabled={isUpdatingHero}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer"
              >
                {isUpdatingHero ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Mengunggah Foto Hero...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan & Terapkan Foto Hero</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          BAGIAN 2: DAFTAR CERITA ABOUT (DINAMIS ZIGZAG KANAN-KIRI)
      ===================================================================== */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-mono font-bold">
                02
              </span>
              <h2 className="text-base font-bold text-zinc-900">
                Daftar Foto & Cerita About (Zigzag Kanan-Kiri)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Setiap cerita yang diinput otomatis berselang-seling: Foto #1 di kiri (teks kanan), Foto #2 di kanan (teks kiri), dan seterusnya.
            </p>
          </div>

          <button
            onClick={handleOpenAddStory}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Cerita About</span>
          </button>
        </div>

        {/* Tabel Data Cerita About */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat cerita About...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-200 rounded-xl">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-300 mb-2 stroke-[1.5]" />
            <p className="font-semibold text-zinc-800 text-sm">Belum ada cerita About kustom</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Halaman beranda saat ini menggunakan teks narasi default. Tambahkan cerita pertama untuk menonjolkan keunikan cafe Anda.
            </p>
            <button
              onClick={handleOpenAddStory}
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Cerita Pertama</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-zinc-700">
              <thead className="bg-zinc-50/75 border-b border-zinc-200/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                <tr>
                  <th className="px-4 py-3.5">Urutan & Posisi</th>
                  <th className="px-4 py-3.5">Foto Preview</th>
                  <th className="px-4 py-3.5">Judul & Kicker</th>
                  <th className="px-4 py-3.5">Cuplikan Cerita</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {stories.map((story, idx) => {
                  const isEven = idx % 2 === 0;

                  return (
                    <tr key={story.id} className="hover:bg-zinc-50/70 transition">
                      <td className="px-4 py-3.5 space-y-1">
                        <div className="font-bold font-mono text-zinc-900">
                          #{story.order_index ?? idx + 1}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                            isEven
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-sky-50 text-sky-800 border-sky-200"
                          }`}
                        >
                          <ArrowRightLeft className="h-2.5 w-2.5" />
                          <span>{isEven ? "KIRI (FOTO)" : "KANAN (FOTO)"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div
                          onClick={() => setLightboxPhoto(story.image_url)}
                          className="group relative h-14 w-20 rounded-md border border-zinc-200 overflow-hidden bg-zinc-100 cursor-pointer"
                          title="Klik untuk perbesar"
                        >
                          <img
                            src={story.image_url}
                            alt={story.heading}
                            className="h-full w-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                            <ZoomIn className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-zinc-400 truncate max-w-[80px]">
                          {story.photo_label}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 space-y-1 max-w-[220px]">
                        <span className="text-[10px] font-bold text-[#FF0000] uppercase tracking-wider block font-mono">
                          {story.kicker}
                        </span>
                        <div className="font-bold text-zinc-900 text-xs line-clamp-2">
                          {story.heading}
                        </div>
                        <span className="inline-block bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase text-zinc-600">
                          {story.badge}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[260px]">
                        <p className="text-zinc-600 line-clamp-2 text-xs leading-relaxed">
                          {story.paragraph1}
                        </p>
                        {story.highlight1_title && (
                          <div className="mt-1 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>{story.highlight1_title}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleStoryActive(story)}
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                            story.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              story.is_active ? "bg-emerald-600 animate-pulse" : "bg-zinc-400"
                            }`}
                          />
                          <span>{story.is_active ? "Tayang" : "Draft"}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditStory(story)}
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                          >
                            <Pencil className="h-3 w-3 text-zinc-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story)}
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3 text-rose-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL TAMBAH / EDIT CERITA ABOUT
      ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingStory ? "Ubah Cerita About" : "Tambah Cerita About Baru"}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Isi foto dan detail teks sesuai dengan bingkai visual di beranda.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                type="button"
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStory} className="mt-4 space-y-4">
              {/* 1. Upload Foto & Info Stamp */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800">
                  1. Foto Visual & Label Frame <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStoryFileChange}
                  className="w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 cursor-pointer"
                />

                {storyImagePreview && (
                  <div className="relative h-44 w-full rounded-lg border border-zinc-200 overflow-hidden bg-zinc-100">
                    <img
                      src={storyImagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-600 mb-1">
                      Label Foto Kiri (misal: BERANDA2)
                    </label>
                    <input
                      type="text"
                      value={formData.photo_label}
                      onChange={(e) =>
                        setFormData({ ...formData, photo_label: e.target.value })
                      }
                      placeholder="BERANDA"
                      className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-zinc-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-600 mb-1">
                      Badge Kanan (misal: ARSIP SUASANA)
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="ARSIP SUASANA"
                      className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-zinc-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Judul & Kicker */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Label Kicker / Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.kicker}
                    onChange={(e) => setFormData({ ...formData, kicker: e.target.value })}
                    placeholder="TENTANG SIDE LINE"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Judul Utama <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    placeholder="LEBIH DARI SEKADAR CAFE, SEBUAH RUANG JEDA BERMAKNA."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-zinc-900 uppercase"
                  />
                </div>
              </div>

              {/* 3. Paragraf Cerita */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Paragraf Pertama <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={formData.paragraph1}
                    onChange={(e) =>
                      setFormData({ ...formData, paragraph1: e.target.value })
                    }
                    placeholder="SIDE LINE bermula dari sebuah gagasan sederhana..."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Paragraf Kedua (Opsional)
                  </label>
                  <textarea
                    rows="2"
                    value={formData.paragraph2}
                    onChange={(e) =>
                      setFormData({ ...formData, paragraph2: e.target.value })
                    }
                    placeholder="Setiap sudut ditata dengan cermat agar Anda dapat menikmati waktu berkualitas..."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* 4. Highlight Cards (Opsional) */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800">
                  Highlight Poin Bawah (Opsional)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-600 font-mono">POIN 1</span>
                    <input
                      type="text"
                      value={formData.highlight1_title}
                      onChange={(e) =>
                        setFormData({ ...formData, highlight1_title: e.target.value })
                      }
                      placeholder="SENI SANGRAI KOPI"
                      className="w-full rounded border border-zinc-200 px-2.5 py-1 text-xs"
                    />
                    <textarea
                      rows="2"
                      value={formData.highlight1_desc}
                      onChange={(e) =>
                        setFormData({ ...formData, highlight1_desc: e.target.value })
                      }
                      placeholder="Biji kopi terkurasi melalui kurasi..."
                      className="w-full rounded border border-zinc-200 px-2.5 py-1 text-xs"
                    />
                  </div>

                  <div className="space-y-2 bg-white p-3 rounded-lg border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-600 font-mono">POIN 2</span>
                    <input
                      type="text"
                      value={formData.highlight2_title}
                      onChange={(e) =>
                        setFormData({ ...formData, highlight2_title: e.target.value })
                      }
                      placeholder="TATA RUANG ARSITEKTURAL"
                      className="w-full rounded border border-zinc-200 px-2.5 py-1 text-xs"
                    />
                    <textarea
                      rows="2"
                      value={formData.highlight2_desc}
                      onChange={(e) =>
                        setFormData({ ...formData, highlight2_desc: e.target.value })
                      }
                      placeholder="Tata ruang minimalis beraksen kayu..."
                      className="w-full rounded border border-zinc-200 px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Urutan & Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    Urutan Tampil (#1, #2...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({ ...formData, order_index: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-900 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_active_story"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <label
                    htmlFor="is_active_story"
                    className="text-xs font-medium text-zinc-700 cursor-pointer"
                  >
                    Tayangkan di Beranda
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingStory ? "Simpan Perubahan" : "Simpan Cerita About"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={lightboxPhoto}
              alt="Enlarged"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <p className="mt-2 text-center text-xs text-white/70">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}
    </div>
  );
}
