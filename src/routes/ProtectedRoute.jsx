import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, isAdmin, loading } = useAuth();

  // Tampilkan loading screen sementara saat sesi dicek
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-amber-500 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-400">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  // Jika belum login atau bukan admin, redirect ke login admin
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Jika lolos verifikasi, render halaman admin
  return <Outlet />;
}
