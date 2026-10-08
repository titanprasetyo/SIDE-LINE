import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setErrorMsg("Harap masukkan email dan password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await login(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Email atau password tidak sesuai.");
        } else {
          setErrorMsg(error.message || "Gagal melakukan login.");
        }
        return;
      }

      if (data?.user) {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem saat login: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <span className="inline-block rounded-full bg-amber-100 p-3 text-2xl text-amber-600 mb-3">
            ☕
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            SIDE LINE Admin Login
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Masuk untuk mengelola menu, galeri, promo & profil café
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sideline.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-amber-600 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-5">
          <Link
            to="/"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            ← Kembali ke Website Publik
          </Link>
        </div>
      </div>
    </div>
  );
}