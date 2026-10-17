import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../services/supabase";
import { AuthContext } from "./authContextInstance";

export const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 Menit Idle Timeout
export const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 Menit Heartbeat Throttle

/**
 * Pure function untuk evaluasi role admin (digunakan juga dalam unit test)
 */
export function calculateIsAdmin(user, profile) {
  if (!user || !profile) return false;
  return profile.role === "admin";
}

/**
 * Pure function untuk memeriksa apakah idle timeout server/client telah terlewati
 */
export function isSessionTimedOut(lastActiveTimestamp, timeoutMs = IDLE_TIMEOUT_MS, currentTimestamp = Date.now()) {
  if (!lastActiveTimestamp) return false;
  return currentTimestamp - lastActiveTimestamp >= timeoutMs;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeoutNotice, setTimeoutNotice] = useState("");

  const lastActivityRef = useRef(Date.now());
  const lastHeartbeatRef = useRef(Date.now());

  // Hitung status admin secara ketat: wajib ada user DAN profil bertipe 'admin'
  const isAdmin = calculateIsAdmin(user, profile);

  // Ambil profil user dari database
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, last_active_at")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      } else {
        setProfile(null);
        return null;
      }
    } catch (err) {
      console.error("Gagal mengambil profil akun:", err);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handler saat idle timeout 15 menit terdeteksi
  const handleSessionTimeout = useCallback(async (customMessage) => {
    const notice =
      customMessage ||
      "Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 15 menit. Silakan login kembali untuk melanjutkan.";
    setTimeoutNotice(notice);

    try {
      // 1. Invalidasi timestamp sesi di PostgreSQL
      await supabase.rpc("terminate_admin_session").catch(() => {});
    } catch {
      // ignore
    }

    // 2. Akhiri sesi Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    // 3. Bersihkan state memori lokal
    setUser(null);
    setSession(null);
    setProfile(null);

    // 4. Bersihkan cache lokal yang sensitif
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("side_line_menu_promo_")) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
  }, []);

  // Heartbeat server-side ke Supabase RPC touch_admin_session
  const touchServerSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("touch_admin_session");
      if (error) {
        console.warn("Gagal memperbarui heartbeat sesi di server:", error.message);
      } else if (data && data.success === false) {
        // HANYA timeout jika data.error mengandung 'expired' DAN memang di sisi klien sudah idle > 15 menit
        const now = Date.now();
        if (data.error && data.error.includes("expired") && (now - lastActivityRef.current >= IDLE_TIMEOUT_MS)) {
          await handleSessionTimeout("Sesi administrator kedaluwarsa di database setelah 15 menit tanpa aktivitas.");
        }
      }
    } catch (err) {
      console.warn("Kesalahan heartbeat server-side:", err);
    }
  }, [handleSessionTimeout]);

  // 1. Listener status autentikasi awal & realtime
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!mounted) return;
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user) {
        fetchProfile(initSession.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Idle Timeout Manager: Mengawasi interaksi pengguna & perpanjangan heartbeat server
  useEffect(() => {
    if (!isAdmin) return;

    lastActivityRef.current = Date.now();
    lastHeartbeatRef.current = Date.now();

    // Inisialisasi awal timestamp server
    touchServerSession();

    // Pencatat interaksi pengguna (throttled)
    const handleUserInteraction = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      // Heartbeat server-side setiap 2 menit jika ada aktivitas
      if (now - lastHeartbeatRef.current >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatRef.current = now;
        touchServerSession();
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleUserInteraction, { passive: true }));

    // Timer interval pemeriksa batas idle 15 menit setiap 10 detik
    const idleCheckInterval = setInterval(() => {
      const now = Date.now();
      if (isSessionTimedOut(lastActivityRef.current, IDLE_TIMEOUT_MS, now)) {
        handleSessionTimeout();
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserInteraction));
      clearInterval(idleCheckInterval);
    };
  }, [isAdmin, touchServerSession, handleSessionTimeout]);

  // Fungsi Login
  const login = async (email, password) => {
    setTimeoutNotice("");
    setLoading(true);

    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (res.error) {
      setLoading(false);
      return res;
    }

    if (res.data?.user) {
      const loggedUser = res.data.user;
      const loggedSession = res.data.session;
      setUser(loggedUser);
      setSession(loggedSession);
      lastActivityRef.current = Date.now();
      lastHeartbeatRef.current = Date.now();

      // 1. Inisialisasi sesi server (panggil RPC atau update langsung)
      try {
        await supabase.rpc("init_admin_session");
      } catch {
        try {
          await supabase
            .from("profiles")
            .update({ last_active_at: new Date().toISOString() })
            .eq("id", loggedUser.id);
        } catch {
          // ignore
        }
      }

      // 2. Fetch profile secara tuntas
      const userProfile = await fetchProfile(loggedUser.id);

      // 3. Verifikasi role admin
      if (!userProfile || userProfile.role !== "admin") {
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
        const currentRole = userProfile?.role || "tidak terdaftar";
        throw new Error(
          `Akun (${loggedUser.email}) berhasil terautentikasi, tetapi role akun Anda saat ini '${currentRole}' (bukan 'admin'). Akses dashboard admin ditolak.`
        );
      }

      setProfile(userProfile);
      setLoading(false);
    }

    return res;
  };

  // Fungsi Logout Eksplisit
  const logout = async () => {
    setTimeoutNotice("");
    try {
      // Terminasi server-side timestamp di PostgreSQL
      await supabase.rpc("terminate_admin_session").catch(() => {});
    } catch {
      // ignore
    }

    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }

    // Bersihkan cache admin
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("side_line_menu_promo_")) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }

    return { error };
  };

  // Fungsi Ubah Password Administrator
  const changePassword = async (newPassword, currentPassword) => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Kata sandi baru minimal 8 karakter.");
    }

    // Jika kata sandi saat ini diisi, validasi terlebih dahulu dengan re-autentikasi
    if (currentPassword) {
      const currentUserEmail = user?.email || session?.user?.email;
      if (!currentUserEmail) {
        throw new Error("Sesi pengguna tidak valid.");
      }
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUserEmail,
        password: currentPassword,
      });
      if (verifyError) {
        throw new Error("Kata sandi saat ini tidak cocok. Silakan periksa kembali.");
      }
    }

    // Perbarui kata sandi di Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    // Perbarui server-side session timestamp
    touchServerSession();

    return data;
  };

  const clearNotice = () => setTimeoutNotice("");

  const value = {
    session,
    user,
    profile,
    isAdmin,
    loading,
    timeoutNotice,
    clearNotice,
    login,
    logout,
    changePassword,
    touchServerSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
