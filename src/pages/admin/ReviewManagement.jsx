import { useState, useEffect, useCallback, useMemo } from "react";
import { reviewService } from "../../services/reviewService";
import {
  Star,
  MessageSquareQuote,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Calendar,
  TrendingUp,
  User,
  Quote,
} from "lucide-react";

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    tag: "Pecinta Kopi",
    comment: "",
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await reviewService.getAll();
      setReviews(data || []);
    } catch (err) {
      setErrorMsg("Gagal memuat daftar ulasan: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  // Buka Modal Tambah
  const handleOpenModal = () => {
    setFormData({
      name: "",
      rating: 5,
      tag: "Pecinta Kopi",
      comment: "",
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  // Simpan Ulasan Baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      setErrorMsg("Nama dan isi ulasan wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await reviewService.create(formData);
      setSuccessMsg("Ulasan pelanggan berhasil ditambahkan!");
      setIsModalOpen(false);
      await fetchReviews();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan ulasan: " + (err.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Ulasan
  const handleDelete = async (id, name) => {
    if (window.confirm(`Hapus ulasan dari "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      try {
        await reviewService.delete(id);
        setSuccessMsg(`Ulasan dari "${name}" berhasil dihapus.`);
        await fetchReviews();
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        setErrorMsg("Gagal menghapus ulasan: " + (err.message || ""));
      }
    }
  };

  // Filter ulasan
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tag?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRating =
        filterRating === "all" || String(r.rating) === String(filterRating);

      return matchSearch && matchRating;
    });
  }, [reviews, searchQuery, filterRating]);

  // Statistik
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, avg: "0.0", fiveStar: 0 };
    const sum = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    const avg = (sum / total).toFixed(1);
    const fiveStar = reviews.filter((r) => Number(r.rating) === 5).length;
    return { total, avg, fiveStar };
  }, [reviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Star className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Ulasan & Testimoni
            </h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 border border-zinc-200/80">
              {reviews.length} Ulasan
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Kelola ulasan pengunjung, penilaian rating bintang, dan feedback kepuasan pelanggan cafe
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Ulasan Baru</span>
        </button>
      </div>

      {/* Alert Messages */}
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

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              TOTAL ULASAN
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
              <MessageSquareQuote className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {stats.total}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">Tercatat di sistem</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              RATA-RATA RATING
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
              {stats.avg}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 5.0</span>
          </div>
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${
                  s <= Math.round(Number(stats.avg))
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              BINTANG 5 SEMPURNA
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {stats.fiveStar}{" "}
            <span className="text-xs font-normal text-zinc-500 font-mono">
              ({stats.total > 0 ? Math.round((stats.fiveStar / stats.total) * 100) : 0}%)
            </span>
          </p>
          <p className="mt-0.5 text-xs text-emerald-600 font-medium">Tingkat kepuasan tinggi</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, komentar, atau kategori tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 shrink-0">Filter:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-900 transition cursor-pointer"
          >
            <option value="all">Semua Penilaian</option>
            <option value="5">★ 5 Bintang Saja</option>
            <option value="4">★ 4 Bintang Saja</option>
            <option value="3">★ 3 Bintang Saja</option>
            <option value="2">★ 2 Bintang Saja</option>
            <option value="1">★ 1 Bintang Saja</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / List */}
      <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-zinc-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat data ulasan...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <MessageSquareQuote className="mx-auto h-8 w-8 text-zinc-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-zinc-800">Tidak ada ulasan yang sesuai</p>
            <p className="text-xs text-zinc-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter rating.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200/80 font-mono">
                <tr>
                  <th className="px-5 py-3.5">Pelanggan</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Kategori / Tag</th>
                  <th className="px-5 py-3.5">Kutipan Ulasan</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReviews.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white text-[11px] font-bold">
                          {item.name ? item.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <span className="font-semibold text-zinc-900 text-sm">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= item.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-xs font-mono font-semibold text-zinc-700">
                          {item.rating}.0
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 border border-zinc-200/60">
                        {item.tag || "Pengunjung"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed text-xs">
                        "{item.comment}"
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 whitespace-nowrap text-xs font-mono">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        title="Hapus Ulasan"
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Ulasan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Star className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-zinc-900">Tambah Ulasan Baru</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nama Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Rating Bintang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition cursor-pointer"
                  >
                    <option value={5}>★ ★ ★ ★ ★ (5 Bintang)</option>
                    <option value={4}>★ ★ ★ ★ ☆ (4 Bintang)</option>
                    <option value={3}>★ ★ ★ ☆ ☆ (3 Bintang)</option>
                    <option value={2}>★ ★ ☆ ☆ ☆ (2 Bintang)</option>
                    <option value={1}>★ ☆ ☆ ☆ ☆ (1 Bintang)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Kategori / Tag
                  </label>
                  <select
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition cursor-pointer"
                  >
                    <option value="Pecinta Kopi">Pecinta Kopi</option>
                    <option value="Work From Cafe">Work From Cafe</option>
                    <option value="Nongkrong Santai">Nongkrong Santai</option>
                    <option value="Dine-in">Dine-in</option>
                    <option value="Pelanggan Setia">Pelanggan Setia</option>
                    <option value="Pengunjung">Pengunjung</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Isi Ulasan / Testimoni <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Tulis ulasan pelanggan tentang kopi, cita rasa, pelayanan, atau kenyamanan suasananya..."
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
