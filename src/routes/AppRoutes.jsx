import { Routes, Route, Navigate, Link } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/public/Home";
import Facilities from "../pages/public/Facilities";
import Menu from "../pages/public/Menu";
import Gallery from "../pages/public/Gallery";
import Event from "../pages/public/Event";
import Team from "../pages/public/Team";
import Contact from "../pages/public/Contact";

import Login from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import MenuManagement from "../pages/admin/MenuManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import GalleryManagement from "../pages/admin/GalleryManagement";
import EventManagement from "../pages/admin/EventManagement";
import LiveMusicManagement from "../pages/admin/LiveMusicManagement";
import SpaceBookingManagement from "../pages/admin/SpaceBookingManagement";
import TeamManagement from "../pages/admin/TeamManagement";
import FacilityManagement from "../pages/admin/FacilityManagement";
import CafeInformation from "../pages/admin/CafeInformation";
import HomeHeroManagement from "../pages/admin/HomeHeroManagement";
import ReviewManagement from "../pages/admin/ReviewManagement";
import ChangePassword from "../pages/admin/ChangePassword";

function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center py-20 bg-[#FFF5CF]">
      <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
        404 ERROR
      </span>
      <h1 className="mt-2 text-6xl sm:text-8xl font-black text-[#141414] font-heading uppercase tracking-tight">
        404
      </h1>
      <p className="mt-3 text-base sm:text-lg font-heading font-bold uppercase text-[#141414]">
        Halaman Tidak Ditemukan
      </p>
      <p className="mt-1 text-xs sm:text-sm font-body text-[#5C584E] max-w-md">
        Halaman yang Anda tuju mungkin telah berpindah alamat atau belum tersedia di arsip kami.
      </p>
      <Link
        to="/"
        className="mt-6 border border-[#141414] bg-[#FF0000] px-8 py-3 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
      >
        Kembali ke Beranda →
      </Link>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/fasilitas" element={<Navigate to="/facilities" replace />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/event" element={<Event />} />
        <Route path="/events" element={<Navigate to="/event" replace />} />
        <Route path="/promo" element={<Navigate to="/event" replace />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ADMIN AUTH */}
      <Route path="/admin/login" element={<Login />} />

      {/* PROTECTED ADMIN ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="home-hero" element={<HomeHeroManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="promo" element={<Navigate to="/admin/events" replace />} />
          <Route path="live-music" element={<LiveMusicManagement />} />
          <Route path="space-booking" element={<SpaceBookingManagement />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="facilities" element={<FacilityManagement />} />
          <Route path="settings" element={<CafeInformation />} />
          <Route path="security" element={<ChangePassword />} />
          <Route path="change-password" element={<Navigate to="/admin/security" replace />} />
        </Route>
      </Route>

      {/* 404 FALLBACK */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}