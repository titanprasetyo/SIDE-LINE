import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Komponen */}
      <Sidebar />

      {/* Konten Halaman Admin */}
      <main className="ml-64 flex-1 min-h-screen p-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}