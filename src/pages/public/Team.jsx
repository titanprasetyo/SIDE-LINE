import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  teamService,
  DEMO_TEAM_MEMBERS,
  DEFAULT_HEADER_SETTINGS,
} from "../../services/teamService";
import { cleanText, toInstagramLink } from "../../utils/text";

const STUDIO_GRADIENTS = [
  "linear-gradient(145deg, #22252a 0%, #000000 100%)", // Studio Dark Slate
  "linear-gradient(145deg, #1c1e22 0%, #000000 100%)", // Studio Neutral
  "linear-gradient(145deg, #18191c 0%, #000000 100%)", // Studio Charcoal
  "linear-gradient(145deg, #2a2c33 0%, #000000 100%)", // Studio Soft Graphite
];

const initialsOf = (name) =>
  (name || "SL")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerInfo, setHeaderInfo] = useState(() => teamService.getHeaderSettings());
  const [activeModalMember, setActiveModalMember] = useState(null);

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

    const handleHeaderUpdate = (e) => {
      if (e.detail) {
        setHeaderInfo(e.detail);
      } else {
        setHeaderInfo(teamService.getHeaderSettings());
      }
    };

    window.addEventListener("side_line_team_header_changed", handleHeaderUpdate);
    window.addEventListener("storage", handleHeaderUpdate);

    return () => {
      ignore = true;
      window.removeEventListener("side_line_team_header_changed", handleHeaderUpdate);
      window.removeEventListener("storage", handleHeaderUpdate);
    };
  }, []);

  const displayList = teams.length > 0 ? teams : DEMO_TEAM_MEMBERS;

  return (
    <div className="relative min-h-[85vh] bg-[#000000] text-white overflow-hidden pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 2xl:px-16 selection:bg-[#FF0000] selection:text-white">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_30%,rgba(255,0,0,0.12),transparent_75%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1600px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto px-2 sm:px-4">
          <h1 className="font-heading font-black italic tracking-wider text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase text-[#FF0000] drop-shadow-[0_2px_18px_rgba(255,0,0,0.55)]">
            {headerInfo.title || DEFAULT_HEADER_SETTINGS.title}
          </h1>

          <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm font-body italic text-white/90 leading-relaxed max-w-xl mx-auto">
            {headerInfo.subtitle || DEFAULT_HEADER_SETTINGS.subtitle}
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="mt-6 sm:mt-8 md:mt-10">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#FF0000]" />
              <p className="mt-4 text-xs font-heading uppercase tracking-widest text-white/70">
                Memuat Profil Tim...
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-7 lg:gap-8 max-w-7xl 2xl:max-w-[1600px] mx-auto px-1 sm:px-2">
              {displayList.map((member, idx) => {
                const name = cleanText(member.name);
                const role = cleanText(member.role);
                const gradientBg = STUDIO_GRADIENTS[idx % STUDIO_GRADIENTS.length];

                return (
                  <article
                    key={member.id || `demo-${idx}`}
                    onClick={() => setActiveModalMember(member)}
                    className="group relative flex flex-col items-center w-full max-w-[240px] sm:max-w-[250px] md:max-w-[260px] lg:max-w-[270px] cursor-pointer select-none"
                  >
                    {/* ── 1. Slanted Photo Box ── */}
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-xs shadow-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(255,0,0,0.35)] border border-white/10"
                      style={{
                        transform: "skewX(-12deg)",
                        background: gradientBg,
                      }}
                    >
                      {/* Top-Left Slanted Red Accent Bracket */}
                      <div className="absolute top-0 left-0 w-10 sm:w-12 h-[3px] bg-[#FF0000] z-20 pointer-events-none shadow-[0_0_10px_#FF0000]" />
                      <div className="absolute top-0 left-0 w-[4px] h-24 sm:h-28 bg-[#FF0000] z-20 pointer-events-none shadow-[0_0_12px_#FF0000]" />

                      {/* Unskewed Inner Photo Container */}
                      <div
                        className="w-full h-full"
                        style={{ transform: "skewX(12deg) scale(1.22)" }}
                      >
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/80 text-white/40">
                            <span className="font-heading font-black text-4xl sm:text-5xl tracking-widest text-white">
                              {initialsOf(name)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Subtle Bottom Shadow inside photo */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                      {/* Subtle Hover Action Hint */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF0000] text-[10px] font-heading font-bold uppercase tracking-wider text-white shadow-lg">
                          Lihat Detail ↗
                        </span>
                      </div>
                    </div>

                    {/* ── 2. Slanted Name & Role Badge ── */}
                    <div
                      className="mt-3.5 flex items-stretch w-full shadow-md transition-all duration-300 group-hover:shadow-[0_8px_25px_rgba(255,0,0,0.3)]"
                      style={{ transform: "skewX(-12deg)" }}
                    >
                      {/* Red Left Wing / Wedge */}
                      <div className="w-3 sm:w-3.5 bg-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.7)] shrink-0" />

                      {/* Badge Body */}
                      <div className="flex-1 bg-[#000000] px-3.5 sm:px-4 py-2 sm:py-2.5 border-t border-r border-b border-white/20 border-b-2 border-b-[#FF0000]">
                        <div style={{ transform: "skewX(12deg)" }}>
                          <h2 className="font-heading font-black uppercase tracking-wider text-white text-xs sm:text-sm md:text-base leading-tight truncate drop-shadow-sm">
                            {name}
                          </h2>
                          <p className="font-heading italic font-semibold text-[#FF0000] text-[10px] sm:text-xs mt-0.5 tracking-wide truncate">
                            {role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom Right Angled Graphic Emblem (sesuai referensi gambar) ── */}
        <div
          className="absolute -bottom-6 right-2 sm:right-6 lg:right-8 flex gap-2 pointer-events-none opacity-85"
          style={{ transform: "skewX(-16deg)" }}
          aria-hidden="true"
        >
          <div className="w-3.5 h-10 sm:w-5 sm:h-14 bg-[#FF0000]/40" />
          <div className="w-7 h-10 sm:w-10 sm:h-14 bg-[#FF0000]" />
        </div>
      </div>

      {/* ── Modal Detail Anggota Tim ── */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 md:p-6 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setActiveModalMember(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-[#000000] border border-white/20 p-5 sm:p-8 shadow-2xl text-white my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalMember(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer text-xs"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
              {/* Photo */}
              <div
                className="w-28 h-36 sm:w-32 sm:h-40 shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-white/10 relative shadow-xl"
                style={{ transform: "skewX(-6deg)" }}
              >
                <div style={{ transform: "skewX(6deg) scale(1.15)" }} className="w-full h-full">
                  {activeModalMember.photo_url ? (
                    <img
                      src={activeModalMember.photo_url}
                      alt={activeModalMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-heading font-black text-2xl sm:text-3xl text-white/30">
                      {initialsOf(activeModalMember.name)}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Details */}
              <div className="flex-1 text-center sm:text-left">
                <span className="inline-block text-[10px] font-heading font-bold uppercase tracking-widest text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/40 px-2.5 py-0.5 rounded">
                  {cleanText(activeModalMember.role)}
                </span>
                <h3 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight mt-1 text-white">
                  {cleanText(activeModalMember.name)}
                </h3>

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-white/80 font-body">
                  {cleanText(activeModalMember.bio) ||
                    "Anggota berdedikasi yang senantiasa menjaga kehangatan, cita rasa kopi, dan kenyamanan terbaik di SIDE LINE Coffee & Eatery."}
                </p>

                {/* Social / Actions */}
                <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 items-stretch sm:items-center justify-center sm:justify-start">
                  {toInstagramLink(activeModalMember.instagram) && (
                    <a
                      href={toInstagramLink(activeModalMember.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FF0000] px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#D60000] transition shadow-md"
                    >
                      <span>Instagram</span>
                      <span>↗</span>
                    </a>
                  )}

                  {onOpenProfile &&
                    (activeModalMember.role?.toLowerCase().includes("owner") ||
                      activeModalMember.role?.toLowerCase().includes("founder") ||
                      activeModalMember.role?.toLowerCase().includes("leader")) && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalMember(null);
                          onOpenProfile();
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-heading font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                      >
                        Baca Kisah Pendiri 📖
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
