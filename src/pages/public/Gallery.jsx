import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("galleries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && !ignore) {
          setGalleries(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat galeri publik:", err);
        if (!ignore) setLoading(false);
      }
    };

    fetchGallery();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 pb-24 pt-8 md:pt-14 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Index Bar */}
        <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">SPATIAL GALLERY</span>
            <span className="text-[#141414]/30">/</span>
            <span>VISUAL ARCHIVE</span>
          </div>
          <span className="text-[#FF0000] font-bold">{galleries.length} CAPTURES</span>
        </div>

        {/* Headline */}
        <div className="mt-10 md:mt-14 max-w-3xl space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
            Suasana & Sudut Ruang
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            Atmospheric Visual Archive.
          </h1>
          <p className="font-body text-sm sm:text-base text-[#5C584E] pt-2">
            Potret sudut kenyamanan, tata cahaya, ruang seduh, dan interaksi hangat yang tercipta di SIDE LINE Café.
          </p>
        </div>

        {/* Asymmetric / Masonry-inspired Editorial Portfolio Grid */}
        <div className="mt-16">
          {loading ? (
            <div className="py-24 text-center">
              <span className="font-heading text-xs uppercase tracking-widest text-[#5C584E]">
                Menyiapkan arsip foto...
              </span>
            </div>
          ) : galleries.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[#141414]/30 p-12">
              <h3 className="font-heading text-lg font-bold uppercase text-[#141414]">
                Belum Ada Foto Terpublikasi
              </h3>
              <p className="font-body text-xs text-[#5C584E] mt-2">
                Foto suasana café akan segera diperbarui. Kunjungi café kami secara langsung untuk menikmati suasananya.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {galleries.map((item, index) => {
                // Editorial layout rhythm: alternate feature frames and standard frames
                const isLarge = index % 5 === 0;
                const isMedium = index % 5 === 1 || index % 5 === 2;

                const colSpanClass = isLarge
                  ? "md:col-span-8"
                  : isMedium
                  ? "md:col-span-4"
                  : "md:col-span-6";

                const aspectClass = isLarge
                  ? "aspect-[16/10]"
                  : isMedium
                  ? "aspect-[4/5]"
                  : "aspect-[4/3]";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPhoto(item)}
                    className={`${colSpanClass} border border-[#141414] p-2 bg-[#FFF5CF] cursor-pointer group transition-transform duration-300 hover:-translate-y-0.5`}
                  >
                    <div
                      className={`relative ${aspectClass} overflow-hidden bg-[#F5E8BA]`}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title || "Suasana SIDE LINE"}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                      />

                      {/* Micro Badge */}
                      <div className="absolute top-3 left-3 bg-[#141414] text-[#FFF5CF] px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-widest">
                        0{index + 1} // CAPTURE
                      </div>
                    </div>

                    {/* Editorial Caption Bar */}
                    <div className="mt-3 px-1 flex items-center justify-between text-[11px] font-heading uppercase tracking-widest text-[#5C584E] border-t border-[#141414]/15 pt-2">
                      <span className="truncate max-w-[70%] font-semibold text-[#141414]">
                        {item.title || "SIDE LINE AMBIENCE"}
                      </span>
                      <span className="text-[#FF0000] text-[10px] group-hover:underline">
                        VIEW ↗
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Minimalist Lightbox Modal */}
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/85 p-4 sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-[#FFF5CF] border-2 border-[#141414] p-4 sm:p-6"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#141414] pb-3 mb-4 text-xs font-heading font-bold uppercase tracking-wider text-[#141414]">
                <span>{selectedPhoto.title || "SIDE LINE VISUAL ARCHIVE"}</span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  type="button"
                  className="text-xs font-heading font-bold uppercase tracking-widest text-[#FF0000] hover:text-[#141414] transition cursor-pointer"
                >
                  [ CLOSE × ]
                </button>
              </div>

              {/* Photo Display */}
              <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-[#141414]">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title || "Foto"}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              {/* Caption Footer */}
              <div className="mt-4 pt-2 border-t border-[#141414]/20 flex items-center justify-between text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                <span>SIDE LINE COFFEE • EATERY</span>
                <span className="text-[#FF0000]">ARCHIVE DOCUMENTATION</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}