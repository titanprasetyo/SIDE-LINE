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
  ShieldCheck,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, isAdmin, loading } = useAuth();
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
      setErrorMsg("Harap masukkan email dan kata sandi administrator.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await login(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Kredensial tidak valid. Periksa kembali email dan password.");
        } else {
          setErrorMsg(error.message || "Gagal melakukan autentikasi login.");
        }
        return;
      }

      if (data?.user) {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan sistem saat autentikasi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 py-12 selection:bg-[#FF0000] selection:text-white"
      style={{
        backgroundColor: "#090D16",
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(255, 0, 0, 0.09), transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02), transparent 50%)
        `,
      }}
    >
      {/* Background Decorative Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex items-center justify-center p-0.5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-zinc-950 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#FF0000]/25 to-transparent opacity-75" />
              <Coffee className="h-6 w-6 relative z-10 stroke-[2] text-zinc-100" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="font-heading font-black tracking-wider text-white text-xl">
              SIDE LINE
            </span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-widest text-[#FF0000] border border-white/5">
              ADMIN
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">
            Pusat Kendali & Tata Kelola Operasional Cafe
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="pb-4 border-b border-zinc-800/60 mb-5">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Masuk ke Konsol Manajemen
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Akses khusus staf terverifikasi dan administrator cafe.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 font-mono">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sideline.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 font-mono">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 transition cursor-pointer"
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
              className="w-full rounded-xl bg-white py-3 text-xs sm:text-sm font-semibold text-zinc-950 hover:bg-zinc-100 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <span>Otorisasi & Masuk Dashboard</span>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-6 pt-5 border-t border-zinc-800/60 flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Terproteksi Supabase RLS Session</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Website Publik SIDE LINE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}