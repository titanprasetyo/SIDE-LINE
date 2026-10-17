import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, profile, isAdmin, loading } = useAuth();

  // Tampilkan loading screen jika status auth sedang loading atau user ada tapi profile masih dalam proses pemuatan
  if (loading || (user && profile === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0] text-stone-800 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900 mx-auto"></div>
          <p className="mt-3 text-xs font-medium text-stone-500">Memverifikasi otorisasi admin...</p>
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
