import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import logoDefaultImg from "../../assets/logo.png";
import {
  Settings,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  RotateCcw,
  UploadCloud,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Lock,
} from "lucide-react";

function InstagramIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function CafeInformation() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "SIDE LINE",
    tagline: "Coffee • Eatery • Space",
    logo_url: "",
    about_text: "",
    address: "",
    google_maps_url: "",
    phone: "",
    instagram: "",
    opening_hours: "Setiap Hari: 09:00 - 22:00 WIB",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    let ignore = false;
    const loadInfo = async () => {
      try {
        const data = await cafeService.get();
        if (!ignore && data) {
          setFormData({
            name: data.name || "SIDE LINE",
            tagline: data.tagline || "",
            logo_url: data.logo_url || "",
            about_text: data.about_text || "",
            address: data.address || "",
            google_maps_url: data.google_maps_url || "",
            phone: data.phone || "",
            instagram: data.instagram || "",
            opening_hours: data.opening_hours || "",
          });
          setLogoPreview(data.logo_url || "");
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg("Gagal memuat informasi cafe: " + (err.message || ""));
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

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file logo maksimal 2 MB!");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleResetLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logo_url: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      const updated = await cafeService.update(formData, logoFile);
      if (updated?.logo_url) {
        setFormData((prev) => ({ ...prev, logo_url: updated.logo_url }));
        setLogoPreview(updated.logo_url);
      }
      setLogoFile(null);
      setSuccessMsg("Informasi cafe & logo berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg("Gagal menyimpan informasi cafe: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-zinc-400">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
        <p className="mt-3 text-xs sm:text-sm font-medium text-zinc-500">Memuat profil cafe...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Store className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Profil & Identitas Cafe
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
            Konfigurasi profil brand, logo navbar, kontak reservasi, alamat maps, dan jam operasional cafe
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

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bagian 1: Identitas Cafe */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-mono font-bold">
              01
            </span>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900">
              Identitas & Brand Utama
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Nama Cafe <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="SIDE LINE"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Tagline / Slogan
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Coffee • Eatery • Space"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>

          {/* Input Logo Header / Cafe */}
          <div className="mt-5 pt-4 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              Logo Header Navbar
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Upload logo brand cafe (PNG/SVG latar transparan sangat direkomendasikan, maksimal 2MB).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 cursor-pointer"
                />

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 font-mono">
                    Atau Masukkan URL Logo:
                  </label>
                  <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => {
                      handleChange(e);
                      setLogoPreview(e.target.value);
                    }}
                    placeholder="https://.../logo.png"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 font-mono outline-none focus:border-zinc-900 transition"
                  />
                </div>

                {(logoPreview || formData.logo_url) && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset ke Logo Standar</span>
                  </button>
                )}
              </div>

              {/* Box Preview Logo */}
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2">
                  Preview Tampilan di Navbar:
                </span>
                <div className="h-14 flex items-center justify-center p-2 rounded-lg bg-white border border-zinc-200/60 w-full max-w-[200px]">
                  <img
                    src={logoPreview || formData.logo_url || logoDefaultImg}
                    alt="Logo Preview"
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 mt-2">
                  {logoFile
                    ? "Foto baru siap disimpan"
                    : logoPreview || formData.logo_url
                    ? "Logo aktif saat ini"
                    : "Logo bawaan (default)"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Deskripsi Singkat Profil Cafe
            </label>
            <textarea
              rows="3"
              name="about_text"
              value={formData.about_text}
              onChange={handleChange}
              placeholder="Ceritakan kisah, filosofi seduhan, dan suasana cafe Anda..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>
        </div>

        {/* Bagian 2: Kontak & Media Sosial */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-mono font-bold">
              02
            </span>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900">
              Kontak & Saluran Media Sosial
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                <span>Nomor WhatsApp Reservasi</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62 812-3456-7890"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <InstagramIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>Akun Instagram Resmi</span>
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@sideline.coffee"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>
        </div>

        {/* Bagian 3: Lokasi & Jam Buka */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-mono font-bold">
              03
            </span>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900">
              Lokasi & Jam Operasional
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                <span>Alamat Lengkap Cafe</span>
              </label>
              <textarea
                rows="2"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Link Google Maps
                </label>
                <input
                  type="text"
                  name="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Jam Buka Operasional</span>
                </label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleChange}
                  placeholder="Setiap Hari: 09:00 - 22:00 WIB"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
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
            className="w-full sm:w-auto justify-center rounded-lg bg-zinc-950 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Informasi Cafe</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Akses Cepat Keamanan Akun & Ubah Password */}
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-xs sm:text-sm text-zinc-900 block">
              Keamanan Akun & Kata Sandi Administrator
            </span>
            <span className="text-[11px] text-zinc-500">
              Perbarui kata sandi login admin Anda untuk memastikan keamanan akses sistem cafe.
            </span>
          </div>
        </div>
        <Link
          to="/admin/security"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition shadow-2xs self-start sm:self-auto shrink-0"
        >
          <span>Ubah Kata Sandi →</span>
        </Link>
      </div>
    </div>
  );
}