import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { validatePasswordChange } from "../../utils/text";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  User,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ChangePassword() {
  const { user, profile, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Validasi form sisi klien
      validatePasswordChange({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setIsSubmitting(true);

      // 2. Eksekusi ubah kata sandi melalui Supabase Auth
      await changePassword(newPassword, currentPassword);

      // 3. Reset form dan tampilkan pesan sukses
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg(
        "Kata sandi administrator berhasil diperbarui! Silakan gunakan kata sandi baru untuk login sesi berikutnya."
      );
    } catch (err) {
      setErrorMsg(err.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header Halaman */}
      <div className="pb-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs">
            <Lock className="h-4.5 w-4.5 stroke-[2]" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Keamanan Akun & Ubah Password
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">
              Kelola kredensial kata sandi akun administrator SIDE LINE
            </p>
          </div>
        </div>
      </div>

      {/* Informasi Akun Saat Ini */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900">
                {user?.email || "admin@sideline.com"}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/60">
                {profile?.role === "admin" ? "Super Admin" : "Staff Verified"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              ID Akun: <span className="font-mono">{user?.id?.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200/60 self-start sm:self-auto">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
          <span>Idle Timeout: 15 Menit</span>
        </div>
      </div>

      {/* Feedback Alert: Sukses */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded cursor-pointer"
            aria-label="Tutup pesan sukses"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Feedback Alert: Error */}
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-600 hover:text-rose-800 p-0.5 rounded cursor-pointer"
            aria-label="Tutup pesan error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Ubah Password */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kata Sandi Saat Ini */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Kata Sandi Saat Ini <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi saat ini"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                aria-label={showCurrent ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Diperlukan untuk memverifikasi kepemilikan akun sebelum perubahan disimpan.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-100" />

          {/* Kata Sandi Baru */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                aria-label={showNew ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi Baru */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer transition"
                aria-label={showConfirm ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">
                Konfirmasi kata sandi belum cocok dengan kata sandi baru.
              </p>
            )}
          </div>

          {/* Kriteria Keamanan Sandi */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-200/70 p-3.5 text-xs space-y-1.5">
            <span className="font-semibold text-zinc-700 block">Kriteria Keamanan Sandi:</span>
            <ul className="space-y-1 text-zinc-500 text-[11px]">
              <li className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-600 font-medium" : ""}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>Panjang minimal 8 karakter</span>
              </li>
              <li className={`flex items-center gap-1.5 ${newPassword && confirmPassword && newPassword === confirmPassword ? "text-emerald-600 font-medium" : ""}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>Konfirmasi kata sandi harus persis sama</span>
              </li>
              <li className={`flex items-center gap-1.5 ${newPassword && currentPassword && newPassword !== currentPassword ? "text-emerald-600 font-medium" : ""}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>Berbeda dari kata sandi saat ini</span>
              </li>
            </ul>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
            >
              Reset Input
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan Sandi...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Perbarui Kata Sandi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Catatan Keamanan */}
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 text-xs text-zinc-600 flex items-start gap-2.5">
        <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-800">
            Standar Keamanan Sesi Administrator
          </p>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Setelah kata sandi diubah, seluruh sesi lama pada perangkat lain akan memerlukan
            autentikasi ulang. Sesi aktif Anda saat ini tetap dilindungi oleh pembatasan idle timeout 15 menit otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
