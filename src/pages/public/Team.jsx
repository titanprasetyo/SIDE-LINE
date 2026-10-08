import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { teamService } from "../../services/teamService";

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const outletCtx = useOutletContext();
  const onOpenProfile = outletCtx?.onOpenProfile;

  useEffect(() => {
    let ignore = false;
    const fetchTeams = async () => {
      try {
        const data = await teamService.getAll();
        if (!ignore) {
          setTeams(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat tim:", err);
        if (!ignore) setLoading(false);
      }
    };

    fetchTeams();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-24 md:space-y-36 pb-24 pt-8 md:pt-14 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Index Bar */}
        <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">PEOPLE & FOUNDERS</span>
            <span className="text-[#141414]/30">/</span>
            <span>TEAM ARCHIVE</span>
          </div>
          <span className="text-[#FF0000] font-bold">{teams.length} PROFILES</span>
        </div>

        {/* Headline */}
        <div className="mt-10 md:mt-14 max-w-3xl space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
            Orang di Balik Layar
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            The People Behind SIDE LINE.
          </h1>
          <p className="font-body text-sm sm:text-base text-[#5C584E] pt-2">
            Mengenal lebih dekat para kurator rasa, barista, dan pendiri yang mendedikasikan ketelitian untuk setiap cangkir dan sudut ruang di café kami.
          </p>
        </div>

        {/* Team Grid: Editorial 3:4 Portrait Frames */}
        <div className="mt-16">
          {loading ? (
            <div className="py-24 text-center font-heading text-xs uppercase tracking-widest text-[#5C584E]">
              Memuat profil tim...
            </div>
          ) : teams.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[#141414]/30 p-12 max-w-lg mx-auto">
              <h3 className="font-heading text-lg font-bold uppercase text-[#141414]">
                Profil Tim Sedang Disiapkan
              </h3>
              <p className="font-body text-xs text-[#5C584E] mt-2">
                Informasi profil founder dan barista akan segera tampil di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {teams.map((member, idx) => (
                <div
                  key={member.id}
                  className="border border-[#141414] p-3 bg-[#FFF5CF] flex flex-col justify-between group"
                >
                  <div>
                    {/* Editorial Portrait Frame (3:4 aspect ratio, never circular avatar) */}
                    <div className="relative aspect-[3/4] w-full border border-[#141414] overflow-hidden bg-[#F5E8BA] flex flex-col items-center justify-center">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                        />
                      ) : (
                        <div className="p-6 text-center flex flex-col items-center justify-between h-full w-full border border-dashed border-[#141414]/30 m-2">
                          <div className="w-full flex justify-between text-[9px] font-heading uppercase tracking-widest text-[#5C584E]">
                            <span>REF. 0{idx + 1}</span>
                            <span className="text-[#FF0000]">PORTRAIT</span>
                          </div>
                          <div className="my-auto space-y-1">
                            <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#141414]">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-[#5C584E] font-heading uppercase">
                              [ FOTO SIAP DISALIN ]
                            </p>
                          </div>
                          <span className="text-[9px] font-heading uppercase tracking-widest text-[#5C584E]">
                            SIDE LINE
                          </span>
                        </div>
                      )}

                      {/* Index tag */}
                      <div className="absolute top-2 left-2 bg-[#141414] text-[#FFF5CF] px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-widest">
                        0{idx + 1}
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="mt-4 px-1 space-y-2">
                      <div className="flex items-baseline justify-between border-b border-[#141414]/15 pb-2">
                        <h2 className="font-heading font-black text-lg text-[#141414] uppercase">
                          {member.name}
                        </h2>
                      </div>

                      <p className="text-[11px] font-heading uppercase tracking-widest text-[#FF0000] font-bold">
                        {member.role}
                      </p>

                      <p className="font-body text-xs text-[#5C584E] leading-relaxed pt-1">
                        {member.bio ||
                          "Berdedikasi memberikan pengalaman rasa dan kehangatan ruang terbaik bagi setiap pengunjung SIDE LINE."}
                      </p>
                    </div>
                  </div>

                  {/* Footer social / link */}
                  <div className="mt-6 pt-3 px-1 border-t border-[#141414]/15 flex items-center justify-between text-xs">
                    {member.instagram ? (
                      <a
                        href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-heading text-[11px] uppercase tracking-wider text-[#141414] hover:text-[#FF0000] font-semibold"
                      >
                        {member.instagram} ↗
                      </a>
                    ) : (
                      <span className="text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                        SIDE LINE TEAM
                      </span>
                    )}

                    {onOpenProfile && idx === 0 && (
                      <button
                        onClick={onOpenProfile}
                        type="button"
                        className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#FF0000] hover:underline cursor-pointer"
                      >
                        VIEW PROFILE DRAWER →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
