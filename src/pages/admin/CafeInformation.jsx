import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cafeService } from "../../services/cafeService";
import logoDefaultImg from "../../assets/logo.png";
import {
  SlidersHorizontal as Settings,
  Storefront as Store,
  CheckCircle as CheckCircle2,
  WarningCircle as AlertCircle,
  X,
  FloppyDisk as Save,
  ArrowCounterClockwise as RotateCcw,
  CloudArrowUp as UploadCloud,
  MapPin,
  Phone,
  Clock,
  Sparkle as Sparkles,
  Images as ImageIcon,
  LockKey as Lock,
} from "@phosphor-icons/react";

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
      <div className="flex flex-col items-center justify-center p-16 text-[#6B635B]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E6DFD5] border-t-zinc-900" />
        <p className="mt-3 text-[13.5px] sm:text-sm font-medium text-[#575049]">Memuat profil cafe...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#6E4730] border border-[#E8DFD2]">
            <Store className="h-5 w-5" weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
              Profil &amp; Identitas Cafe
            </h1>
            <p className="mt-1 text-[13.5px] sm:text-sm text-[#575049]">
              Konfigurasi profil brand, logo navbar, kontak reservasi, alamat maps, dan jam operasional cafe
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-[13.5px] sm:text-sm text-emerald-800 flex items-center justify-between gap-3 shadow-xs">
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
        <div className="rounded-xl bg-rose-50/90 border border-rose-200/80 p-3.5 text-[13.5px] sm:text-sm text-rose-800 flex items-center justify-between gap-3 shadow-xs">
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
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#EFE9E0] pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1C1917] text-white text-[13.5px] font-bold">
              01
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#1C1917]">
              Identitas & Brand Utama
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                Nama Cafe <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="SIDE LINE"
                className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div>
              <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                Tagline / Slogan
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Coffee • Eatery • Space"
                className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>

          {/* Input Logo Header / Cafe */}
          <div className="mt-5 pt-4 border-t border-[#EFE9E0]">
            <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1">
              Logo Header Navbar
            </label>
            <p className="text-[13.5px] text-[#575049] mb-3">
              Upload logo brand cafe (PNG/SVG latar transparan sangat direkomendasikan, maksimal 2MB).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="w-full text-[13.5px] text-[#575049] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1C1917] file:px-3 file:py-1.5 file:text-[13.5px] file:font-semibold file:text-white hover:file:bg-zinc-800 cursor-pointer"
                />

                <div className="mt-3">
                  <label className="block text-[12.5px] font-semibold text-[#575049] mb-1 ">
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
                    className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3 py-1.5 text-[13.5px] text-[#1C1917] outline-none focus:border-zinc-900 transition"
                  />
                </div>

                {(logoPreview || formData.logo_url) && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="mt-2.5 inline-flex items-center gap-1 text-[13.5px] font-medium text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset ke Logo Standar</span>
                  </button>
                )}
              </div>

              {/* Box Preview Logo */}
              <div className="rounded-xl border border-[#E6DFD5] bg-[#FAF7F2]/80 p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[13.5px] font-semibold text-[#575049] mb-2">
                  Preview Tampilan di Navbar:
                </span>
                <div className="h-14 flex items-center justify-center p-2 rounded-lg bg-white border border-[#E6DFD5] w-full max-w-[200px]">
                  <img
                    src={logoPreview || formData.logo_url || logoDefaultImg}
                    alt="Logo Preview"
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
                <span className="text-[13.5px] text-[#6B635B] mt-2">
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
            <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
              Deskripsi Singkat Profil Cafe
            </label>
            <textarea
              rows="3"
              name="about_text"
              value={formData.about_text}
              onChange={handleChange}
              placeholder="Ceritakan kisah, filosofi seduhan, dan suasana cafe Anda..."
              className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>
        </div>

        {/* Bagian 2: Kontak & Media Sosial */}
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#EFE9E0] pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1C1917] text-white text-[13.5px] font-bold">
              02
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#1C1917]">
              Kontak & Saluran Media Sosial
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#6B635B]" />
                <span>Nomor WhatsApp Reservasi</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62 812-3456-7890"
                className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div>
              <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5 flex items-center gap-1.5">
                <InstagramIcon className="h-3.5 w-3.5 text-[#6B635B]" />
                <span>Akun Instagram Resmi</span>
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@sideline.coffee"
                className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>
        </div>

        {/* Bagian 3: Lokasi & Jam Buka */}
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#EFE9E0] pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1C1917] text-white text-[13.5px] font-bold">
              03
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#1C1917]">
              Lokasi & Jam Operasional
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#6B635B]" />
                <span>Alamat Lengkap Cafe</span>
              </label>
              <textarea
                rows="2"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan"
                className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5">
                  Link Google Maps
                </label>
                <input
                  type="text"
                  name="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#44403C] mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#6B635B]" />
                  <span>Jam Buka Operasional</span>
                </label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleChange}
                  placeholder="Setiap Hari: 09:00 - 22:00 WIB"
                  className="w-full rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] sm:text-sm text-[#1C1917] outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
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
            className="w-full sm:w-auto justify-center rounded-lg bg-[#1C1917] px-6 py-2.5 text-[13.5px] sm:text-sm font-semibold text-white shadow-xs hover:bg-[#292524] active:scale-[0.99] disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
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
      <div className="rounded-xl border border-[#E6DFD5] bg-[#FAF7F2] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E6DFD5] text-[#44403C] shadow-2xs">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-[13.5px] sm:text-sm text-[#1C1917] block">
              Keamanan Akun & Kata Sandi Administrator
            </span>
            <span className="text-[12.5px] text-[#575049]">
              Perbarui kata sandi login admin Anda untuk memastikan keamanan akses sistem cafe.
            </span>
          </div>
        </div>
        <Link
          to="/admin/security"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E6DFD5] bg-white px-3.5 py-2 text-[13.5px] font-semibold text-[#292524] hover:bg-[#FAF7F2] hover:border-[#D6CEC2] transition shadow-2xs self-start sm:self-auto shrink-0"
        >
          <span>Ubah Kata Sandi →</span>
        </Link>
      </div>
    </div>
  );
}