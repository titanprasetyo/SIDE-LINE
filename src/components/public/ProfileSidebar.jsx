import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

/**
 * Editorial Profile & Founder Sidebar
 * Designed specifically to house the owner's personal portrait once uploaded.
 * Strict editorial style: 3:4 portrait crop, architectural hairlines,
 * warm #FFF5CF canvas, clean Montserrat typography, and #FF0000 micro-accents.
 */
export default function ProfileSidebar({ isOpen, onClose }) {
  const [founderData, setFounderData] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadFounder = async () => {
      try {
        // Fetch founder profile from teams table (owner / founder role)
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("order_index", { ascending: true })
          .limit(1)
          .single();

        if (!error && !ignore && data) {
          setFounderData(data);
        }
      } catch (err) {
        console.warn("Could not load founder profile:", err);
      }
    };

    if (isOpen) {
      loadFounder();
    }

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay: pure minimal tint without heavy blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#141414]/50 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Editorial Drawer Panel */}
      <aside
        className="relative z-10 w-full max-w-md bg-[#FFF5CF] border-l border-[#141414] shadow-2xl flex flex-col h-full overflow-y-auto"
        role="dialog"
        aria-label="Founder Profile"
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-[#FFF5CF] border-b border-[#E8DDAE]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#141414]">
              Profile & Curator
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="group flex items-center gap-1.5 text-xs font-heading font-semibold uppercase tracking-wider text-[#141414] hover:text-[#FF0000] transition cursor-pointer"
          >
            <span>Close</span>
            <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">
              ✕
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8 flex-1">
          {/* Editorial Portrait Frame */}
          <div>
            <div className="relative aspect-[3/4] w-full bg-[#F5E8BA] border border-[#141414] overflow-hidden flex flex-col items-center justify-center">
              {founderData?.photo_url ? (
                <img
                  src={founderData.photo_url}
                  alt={founderData.name || "Founder SIDE LINE"}
                  className="h-full w-full object-cover grayscale hover:grayscale-0 transition duration-500"
                />
              ) : (
                /* Editorial frame slot awaiting user photo */
                <div className="p-8 text-center flex flex-col items-center justify-between h-full w-full border border-dashed border-[#141414]/30 m-2">
                  <div className="w-full flex justify-between items-center text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                    <span>[ ARCHIVE 01 ]</span>
                    <span className="text-[#FF0000]">PORTRAIT FRAME</span>
                  </div>

                  <div className="my-auto space-y-3">
                    <div className="inline-block border border-[#141414] px-3 py-1 font-heading text-[11px] font-bold tracking-widest text-[#141414]">
                      FOTO FOUNDER / OWNER
                    </div>
                    <p className="text-xs text-[#5C584E] max-w-xs leading-relaxed font-body">
                      Slot foto visual portrait ini disiapkan khusus dan akan otomatis muncul begitu foto Anda diunggah.
                    </p>
                  </div>

                  <div className="text-[10px] font-heading tracking-widest uppercase text-[#5C584E]">
                    3:4 EDITORIAL RATIO • SIDE LINE
                  </div>
                </div>
              )}
            </div>

            {/* Photo Caption */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-heading tracking-widest uppercase text-[#5C584E] border-b border-[#E8DDAE] pb-2">
              <span>{founderData?.role || "FOUNDER & CURATOR"}</span>
              <span className="text-[#FF0000]">EST. 2024</span>
            </div>
          </div>

          {/* Biography & Vision */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-heading uppercase tracking-[0.2em] text-[#FF0000] font-bold block mb-1">
                The Persona
              </span>
              <h2 className="font-heading text-2xl font-black text-[#141414] tracking-tight">
                {founderData?.name || "Founder SIDE LINE"}
              </h2>
            </div>

            <p className="text-sm text-[#5C584E] leading-relaxed font-body">
              {founderData?.bio ||
                "Mendedikasikan ketelitian rasa, kurasi biji kopi pilihan, serta rancang bangun ruang yang tenang untuk setiap insan yang bertandang ke SIDE LINE."}
            </p>

            {/* Editorial manifesto quote */}
            <blockquote className="border-l-2 border-[#FF0000] pl-4 py-1 my-4">
              <p className="font-heading text-xs uppercase tracking-wider font-semibold text-[#141414] leading-relaxed italic">
                “Sebuah cangkir kopi bukan sekadar sajian, melainkan ruang jeda dan titik temu percakapan bermakna.”
              </p>
            </blockquote>
          </div>

          {/* Café Philosophy Specs */}
          <div className="border border-[#141414] p-5 space-y-3 bg-[#FFF5CF]">
            <span className="text-[10px] font-heading uppercase tracking-[0.2em] text-[#141414] font-bold block border-b border-[#E8DDAE] pb-1.5">
              Brand Pillars
            </span>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#5C584E] font-heading">
                  Roast Philosophy
                </p>
                <p className="font-heading font-bold text-[#141414] mt-0.5">
                  Small-batch Precision
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#5C584E] font-heading">
                  Architecture
                </p>
                <p className="font-heading font-bold text-[#141414] mt-0.5">
                  Warm Minimalism
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#5C584E] font-heading">
                  Atmosphere
                </p>
                <p className="font-heading font-bold text-[#141414] mt-0.5">
                  Unrushed & Focused
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#5C584E] font-heading">
                  Community
                </p>
                <p className="font-heading font-bold text-[#141414] mt-0.5">
                  Open Collaborative
                </p>
              </div>
            </div>
          </div>

          {/* Direct Channels */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-heading uppercase tracking-[0.2em] text-[#5C584E] block">
              Direct Inquiries
            </span>

            <div className="flex flex-col gap-2">
              {founderData?.instagram && (
                <a
                  href={`https://instagram.com/${founderData.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-[#141414] px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition"
                >
                  <span>Instagram</span>
                  <span>{founderData.instagram} ↗</span>
                </a>
              )}

              <a
                href="/contact"
                onClick={onClose}
                className="flex items-center justify-between bg-[#FF0000] px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-white hover:bg-[#D60000] transition"
              >
                <span>Visit & Connect</span>
                <span>Get Directions ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-6 border-t border-[#E8DDAE] text-[10px] font-heading tracking-widest uppercase text-[#5C584E] flex items-center justify-between">
          <span>SIDE LINE COFFEE • EATERY</span>
          <span>EDITORIAL ARCHIVE</span>
        </div>
      </aside>
    </div>
  );
}
