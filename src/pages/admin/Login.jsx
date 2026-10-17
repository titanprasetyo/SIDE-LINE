import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Coffee,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, isAdmin, loading, timeoutNotice } = useAuth();
  const navigate = useNavigate();

  // Jika sudah login dan berstatus admin, langsung arahkan ke Dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Harap masukkan email dan kata sandi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await login(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Kredensial tidak valid. Periksa kembali email dan kata sandi Anda.");
        } else {
          setErrorMsg(error.message || "Gagal melakukan autentikasi login.");
        }
        return;
      }

      if (data?.user) {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan saat autentikasi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col justify-center items-center px-4 py-12 selection:bg-[#FF0000] selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Soft Glow Subtle Touch */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 25%, rgba(220, 195, 140, 0.25), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-[390px]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-stone-200/80 shadow-xs mb-3 text-amber-900">
            <Coffee className="h-6 w-6 stroke-[1.75]" />
          </div>

          <h1 className="font-['Montserrat',sans-serif] text-xl font-bold tracking-tight text-stone-900">
            SIDE LINE
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Coffee • Eatery • Space
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-5 pb-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">
              Masuk Dashboard Admin
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Gunakan email & kata sandi staf yang terdaftar.
            </p>
          </div>

          {/* Notifikasi Idle Timeout */}
          {timeoutNotice && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-800 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{timeoutNotice}</span>
            </div>
          )}

          {/* Notifikasi Error */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sideline.com"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 transition cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-stone-900 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Sesi Aman • Idle Timeout 15 Menit</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke website SIDE LINE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}