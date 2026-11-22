import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import ProfileSidebar from "../components/public/ProfileSidebar";

export default function PublicLayout() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF5CF] text-[#141414] flex flex-col font-sans selection:bg-[#FF0000] selection:text-white transition-colors duration-200">
      {/* Editorial Navbar */}
      <Navbar onOpenProfile={() => setProfileOpen(true)} />

      {/* Main Public Page Content */}
      <main className="flex-1 w-full overflow-x-clip">
        <Outlet context={{ onOpenProfile: () => setProfileOpen(true) }} />
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Founder Profile Sidebar Drawer */}
      <ProfileSidebar
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}