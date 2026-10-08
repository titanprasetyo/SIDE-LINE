import { useState, useEffect } from "react";
import { cafeService } from "../../services/cafeService";

export default function CafeInformation() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "SIDE LINE",
    tagline: "Coffee • Eatery • Space",
    about_text: "",
    address: "",
    google_maps_url: "",
    phone: "",
    instagram: "",
    opening_hours: "Setiap Hari: 09:00 - 22:00 WIB",
  });

  useEffect(() => {
    let ignore = false;
    const loadInfo = async () => {
      try {
        const data = await cafeService.get();
        if (!ignore && data) {
          setFormData({
            name: data.name || "SIDE LINE",
            tagline: data.tagline || "",
            about_text: data.about_text || "",
            address: data.address || "",
            google_maps_url: data.google_maps_url || "",
            phone: data.phone || "",
            instagram: data.instagram || "",
            opening_hours: data.opening_hours || "",
          });
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat informasi café: " + (err.message || ""));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    loadInfo();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await cafeService.update(formData);
      setSuccessMsg("Informasi café berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan informasi café: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
        <p className="mt-3 text-sm">Memuat informasi café...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Café Information
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola profil usaha, jam operasional, alamat, dan kontak yang tampil di seluruh website publik
        </p>
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

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Bagian 1: Identitas Café */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Identitas & Brand
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Nama Café *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="SIDE LINE"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Coffee • Eatery • Space"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Tentang SIDE LINE (About Story)
            </label>
            <textarea
              rows="3"
              name="about_text"
              value={formData.about_text}
              onChange={handleChange}
              placeholder="Ceritakan kisah, konsep, dan suasana café Anda..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
            />
          </div>
        </div>

        {/* Bagian 2: Kontak & Media Sosial */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Kontak & Sosial Media
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62 812-3456-7890"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@sideline.coffee"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>
          </div>
        </div>

        {/* Bagian 3: Lokasi & Jam Buka */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Lokasi & Jam Operasional
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Alamat Lengkap Café
              </label>
              <textarea
                rows="2"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jl. Raya Utama No. 123, Kelurahan, Kecamatan, Kota..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Link Google Maps (Share Link / Embed URL)
                </label>
                <input
                  type="text"
                  name="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Jam Buka Operasional
                </label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleChange}
                  placeholder="Setiap Hari: 09:00 - 22:00 WIB"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <span>Simpan Informasi Café</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}