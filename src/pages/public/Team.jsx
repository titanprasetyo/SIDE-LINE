import { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  teamService,
  DEMO_TEAM_MEMBERS,
} from "../../services/teamService";
import { cleanText, toInstagramLink } from "../../utils/text";

const initialsOf = (name) =>
  (name || "SL")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function InstagramIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalMember, setActiveModalMember] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const outletCtx = useOutletContext();
  const onOpenProfile = outletCtx?.onOpenProfile;

  // Fetch team members from DB
  useEffect(() => {
    let ignore = false;
    const fetchTeams = async () => {
      try {
        const data = await teamService.getAll();
        if (!ignore) {
          if (data && data.length > 0) {
            setTeams(data);
          } else {
            // Jika database kosong, tampilkan data referensi demo
            setTeams(DEMO_TEAM_MEMBERS);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat tim:", err);
        if (!ignore) {
          setTeams(DEMO_TEAM_MEMBERS);
          setLoading(false);
        }
      }
    };

    fetchTeams();

    return () => {
      ignore = true;
    };
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    if (!activeModalMember) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveModalMember(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalMember]);

  const displayList = useMemo(
    () => (teams.length > 0 ? teams : DEMO_TEAM_MEMBERS),
    [teams]
  );

  const gridColumnsClass =
    displayList.length === 1
      ? "grid-cols-1 max-w-[290px] mx-auto"
      : displayList.length === 2
      ? "grid-cols-1 xs:grid-cols-2 max-w-2xl mx-auto"
      : displayList.length === 3
      ? "grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
      : displayList.length === 5
      ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  const markImageFailed = (key) => {
    setFailedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  return (
    <div className="bg-[#FFF5CF] text-[#141414] px-4 sm:px-6 lg:px-12 2xl:px-16 pt-5 sm:pt-6 md:pt-7 pb-14 sm:pb-16 md:pb-20 selection:bg-[#FF0000] selection:text-white">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
        {/* ── Minimalist Top Utility Bar (No Bulky Header — Cards Immediately Visible in 1 Screen) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141414]/15 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="sr-only">Tim Kami — SIDE LINE Coffee &amp; Eatery</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-4 py-1.5 text-[11px] font-heading font-bold uppercase tracking-widest text-[#FFF5CF] shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E5251F]" />
              <span>Semua Tim</span>
              <span className="rounded-full bg-[#E5251F] px-2 py-0.5 text-[10px] font-black text-white leading-none">
                {loading ? "..." : displayList.length}
              </span>
            </div>
            <span className="hidden sm:inline-block font-body text-xs text-[#5C584E]">
              Klik kartu untuk melihat profil lengkap
            </span>
          </div>

          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#141414]/20 bg-[#FFFAE5] px-4 py-1.5 text-[11px] font-heading font-bold uppercase tracking-wider text-[#141414] hover:border-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition-all cursor-pointer shrink-0"
            >
              <span>Profil Pendiri</span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {/* ── Aesthetic Full-Portrait Editorial Cards Grid (1 Full Screen) ── */}
        <section className="mt-5 sm:mt-6" aria-label="Daftar Anggota Tim">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#141414]/15 border-t-[#E5251F]" />
              <p className="mt-3 text-xs font-heading uppercase tracking-widest text-[#5C584E]">
                Memuat Profil Tim…
              </p>
            </div>
          ) : (
            <div className={`grid gap-5 sm:gap-6 ${gridColumnsClass}`}>
              {displayList.map((member, idx) => {
                const name = cleanText(member.name);
                const role = cleanText(member.role);
                const instagram = cleanText(member.instagram);
                const memberKey = member.id || `demo-${idx}-${name}`;
                const hasValidPhoto =
                  Boolean(member.photo_url) && !failedImages[memberKey];

                return (
                  <article
                    key={memberKey}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveModalMember(member)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveModalMember(member);
                      }
                    }}
                    className="group relative flex flex-col rounded-[22px] border border-[#141414]/15 bg-[#FFFAE5] p-2 shadow-[0_6px_24px_-6px_rgba(20,20,20,0.08)] hover:-translate-y-2 hover:border-[#141414]/35 hover:shadow-[0_22px_45px_-12px_rgba(20,20,20,0.18)] transition-all duration-500 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5251F]"
                  >
                    {/* Full Vertical Portrait Frame (aspect-[4/5]) */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[15px] bg-[#F5E8BA] ring-1 ring-[#141414]/8">
                      {hasValidPhoto ? (
                        <img
                          src={member.photo_url}
                          alt={
                            role
                              ? `${name}, ${role} di SIDE LINE Coffee & Eatery`
                              : `${name} — Tim SIDE LINE Coffee & Eatery`
                          }
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                          onError={() => markImageFailed(memberKey)}
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F5E8BA] via-[#FFF5CF] to-[#E8DDAE] p-6">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#141414]/20 bg-[#FFFAE5] font-heading text-2xl sm:text-3xl font-black tracking-wider text-[#141414] shadow-sm">
                            {initialsOf(name)}
                          </div>
                        </div>
                      )}

                      {/* Cinematic Soft Bottom Scrim (Only Lower Edge, Subject Stays Bright & Full) */}
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#141414]/90 via-[#141414]/35 to-transparent"
                        aria-hidden="true"
                      />

                      {/* Top Bar: Index Pill & Floating Corner Arrow */}
                      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                        <span className="rounded-full border border-white/15 bg-[#141414]/65 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-heading font-bold tracking-[0.18em] text-[#FFF5CF]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141414]/10 bg-[#FFF5CF]/90 backdrop-blur-md text-xs font-bold text-[#141414] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[#E5251F] group-hover:bg-[#E5251F] group-hover:text-white"
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </div>

                      {/* Bottom Editorial Overlay: Role Badge + Member Name */}
                      <div className="absolute inset-x-3.5 bottom-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5251F] px-2.5 py-0.5 text-[9.5px] font-heading font-extrabold uppercase tracking-[0.14em] text-white shadow-sm">
                          <span className="h-1 w-1 rounded-full bg-white/90" />
                          <span className="truncate max-w-[150px]">
                            {role || "Side Line Crew"}
                          </span>
                        </span>

                        <h2 className="mt-1.5 font-heading text-base sm:text-[17px] font-black uppercase tracking-tight text-[#FFF5CF] leading-tight truncate drop-shadow-xs">
                          {name}
                        </h2>

                        {/* Subtle Expanding Signature Red Bar */}
                        <div
                          className="mt-1.5 h-[2px] w-6 rounded-full bg-[#E5251F] transition-all duration-300 group-hover:w-12"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Slim Museum/Polaroid Caption Footer */}
                    <div className="flex items-center justify-between gap-2 px-2 pt-2.5 pb-1">
                      {instagram ? (
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#5C584E]">
                          <InstagramIcon className="h-3.5 w-3.5 shrink-0 text-[#141414]/65" />
                          <span className="truncate">{instagram}</span>
                        </span>
                      ) : (
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-[#858074]">
                          Side Line Crew
                        </span>
                      )}

                      <span className="shrink-0 font-heading text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#141414] group-hover:text-[#E5251F] transition-colors">
                        Profil →
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Warm Editorial Bottom CTA (Consistently on Cream Palette) ── */}
        <section className="mt-12 sm:mt-16 md:mt-20 rounded-2xl sm:rounded-3xl border border-[#141414]/15 bg-[#F5E8BA]/65 p-6 sm:p-8 md:p-10">
          <div className="grid gap-5 sm:gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#E5251F]">
                Sapa Tim Kami Secara Langsung
              </span>
              <h2 className="mt-1.5 font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[#141414] leading-tight">
                Mampir dan rasakan langsung racikan tim kami.
              </h2>
              <p className="mt-2 max-w-2xl font-body text-xs sm:text-sm leading-relaxed text-[#5C584E]">
                Mau rekomendasi seduhan kopi sesuai selera, tanya menu favorit,
                atau ngobrol soal kolaborasi komunitas? Barista dan tim kami
                siap menyambut kamu setiap hari di SIDE LINE.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 lg:justify-end">
              <Link
                to="/menu"
                className="w-full sm:w-auto text-center rounded-full bg-[#E5251F] px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#C91E19] active:scale-[0.98] transition-all shadow-sm"
              >
                Lihat Menu Kami →
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto text-center rounded-full border border-[#141414] bg-white/80 px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] active:scale-[0.98] transition-all"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Modal Detail Anggota Tim (Editorial Cream Style) ── */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/75 p-3 sm:p-4 md:p-6 backdrop-blur-xs overflow-y-auto"
          onClick={() => setActiveModalMember(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detail profil ${cleanText(activeModalMember.name)}`}
        >
          <div
            className="relative my-auto w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 border-[#141414] bg-[#FFF5CF] p-5 sm:p-7 md:p-8 text-[#141414] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalMember(null)}
              aria-label="Tutup detail profil"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#141414]/20 bg-white/80 text-xs font-bold text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-center sm:items-start">
              {/* Upright Portrait */}
              <div className="w-32 h-40 sm:w-40 sm:h-52 shrink-0 overflow-hidden rounded-2xl border border-[#141414]/15 bg-[#F5E8BA] shadow-sm">
                {activeModalMember.photo_url &&
                !failedImages[
                  activeModalMember.id ||
                    `modal-${cleanText(activeModalMember.name)}`
                ] ? (
                  <img
                    src={activeModalMember.photo_url}
                    alt={
                      activeModalMember.role
                        ? `${cleanText(activeModalMember.name)}, ${cleanText(activeModalMember.role)} di SIDE LINE Coffee & Eatery`
                        : `${cleanText(activeModalMember.name)} — Tim SIDE LINE Coffee & Eatery`
                    }
                    className="h-full w-full object-cover object-top"
                    onError={() =>
                      markImageFailed(
                        activeModalMember.id ||
                          `modal-${cleanText(activeModalMember.name)}`
                      )
                    }
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-heading text-3xl font-black text-[#141414]/45">
                    {initialsOf(activeModalMember.name)}
                  </div>
                )}
              </div>

              {/* Bio & Details */}
              <div className="flex-1 text-center sm:text-left sm:pr-6">
                <span className="inline-flex items-center rounded-full border border-[#E5251F]/25 bg-[#E5251F]/10 px-3 py-1 text-[10px] sm:text-[11px] font-heading font-bold uppercase tracking-widest text-[#E5251F]">
                  {cleanText(activeModalMember.role) || "Side Line Crew"}
                </span>

                <h3 className="mt-2 font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[#141414] leading-tight">
                  {cleanText(activeModalMember.name)}
                </h3>

                <p className="mt-3 font-body text-xs sm:text-sm leading-relaxed text-[#5C584E]">
                  {cleanText(activeModalMember.bio) ||
                    "Anggota berdedikasi yang senantiasa menjaga kehangatan, cita rasa kopi, dan kenyamanan terbaik di SIDE LINE Coffee & Eatery."}
                </p>

                {/* Social / Actions */}
                <div className="mt-5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center sm:justify-start gap-2.5">
                  {toInstagramLink(activeModalMember.instagram) && (
                    <a
                      href={toInstagramLink(activeModalMember.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E5251F] px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#C91E19] transition shadow-sm"
                    >
                      <InstagramIcon className="h-3.5 w-3.5" />
                      <span>Instagram</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}

                  {onOpenProfile &&
                    (activeModalMember.role?.toLowerCase().includes("owner") ||
                      activeModalMember.role?.toLowerCase().includes("founder") ||
                      activeModalMember.role
                        ?.toLowerCase()
                        .includes("leader")) && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalMember(null);
                          onOpenProfile();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#141414] bg-white px-5 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition cursor-pointer"
                      >
                        <span>Baca Kisah Pendiri</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
