import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { cleanText } from "../../utils/text";

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
    <div className="space-y-12 sm:space-y-16 md:space-y-24 pb-16 sm:pb-24 pt-6 sm:pt-10 md:pt-14 px-4 sm:px-6 lg:px-12 2xl:px-16">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
        {/* Editorial Index Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141414] pb-3 text-[10px] sm:text-[11px] font-heading font-medium tracking-[0.2em] sm:tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">SPATIAL GALLERY</span>
            <span className="text-[#141414]/30">/</span>
            <span>VISUAL ARCHIVE</span>
          </div>
          <span className="text-[#FF0000] font-bold">{galleries.length} CAPTURES</span>
        </div>

        {/* Headline */}
        <div className="mt-8 sm:mt-10 md:mt-14 max-w-3xl space-y-2 sm:space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#FF0000]">
            Suasana & Sudut Ruang
          </span>
          <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            Atmospheric Visual Archive.
          </h1>
          <p className="font-body text-xs sm:text-sm md:text-base text-[#5C584E] pt-1 sm:pt-2">
            Potret sudut kenyamanan, tata cahaya, ruang seduh, dan interaksi hangat yang tercipta di SIDE LINE Cafe.
          </p>
        </div>

        {/* Asymmetric / Masonry-inspired Editorial Portfolio Grid */}
        <div className="mt-10 sm:mt-14 md:mt-16">
          {loading ? (
            <div className="py-20 sm:py-24 text-center">
              <span className="font-heading text-xs uppercase tracking-widest text-[#5C584E]">
                Menyiapkan arsip foto...
              </span>
            </div>
          ) : galleries.length === 0 ? (
            <div className="py-16 sm:py-24 text-center border border-dashed border-[#141414]/30 p-6 sm:p-12 rounded-2xl">
              <h3 className="font-heading text-base sm:text-lg font-bold uppercase text-[#141414]">
                Belum Ada Foto Terpublikasi
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#5C584E] mt-2">
                Foto suasana cafe akan segera diperbarui. Kunjungi cafe kami secara langsung untuk menikmati suasananya.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 sm:gap-6 items-start">
              {galleries.map((item, index) => {
                const isLarge = index % 5 === 0;
                const isMedium = index % 5 === 1 || index % 5 === 2;

                const colSpanClass = isLarge
                  ? "sm:col-span-2 md:col-span-8"
                  : isMedium
                  ? "sm:col-span-1 md:col-span-4"
                  : "sm:col-span-1 md:col-span-6";

                const aspectClass = isLarge
                  ? "aspect-[16/10]"
                  : isMedium
                  ? "aspect-[4/3] sm:aspect-[4/5]"
                  : "aspect-[4/3]";

                const photoTitle = cleanText(item.title);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPhoto(item)}
                    className={`${colSpanClass} border border-[#141414] p-2 bg-[#FFF5CF] cursor-pointer group transition-transform duration-300 hover:-translate-y-0.5 rounded-sm`}
                  >
                    <div
                      className={`relative ${aspectClass} overflow-hidden bg-[#F5E8BA]`}
                    >
                      <img
                        src={item.image_url}
                        alt={photoTitle || "Suasana SIDE LINE"}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                        loading="lazy"
                      />

                      {/* Micro Badge */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#141414] text-[#FFF5CF] px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-widest">
                        0{index + 1} · CAPTURE
                      </div>
                    </div>

                    {/* Editorial Caption Bar */}
                    <div className="mt-2.5 sm:mt-3 px-1 flex items-center justify-between text-[10px] sm:text-[11px] font-heading uppercase tracking-widest text-[#5C584E] border-t border-[#141414]/15 pt-2">
                      <span className="truncate max-w-[70%] font-semibold text-[#141414]">
                        {photoTitle || "SIDE LINE AMBIENCE"}
                      </span>
                      <span className="text-[#FF0000] text-[10px] font-bold group-hover:underline">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/85 p-3 sm:p-6 md:p-8 backdrop-blur-xs animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-[#FFF5CF] border-2 border-[#141414] p-3 sm:p-5 md:p-6 rounded-sm shadow-2xl"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#141414] pb-2.5 sm:pb-3 mb-3 sm:mb-4 text-xs font-heading font-bold uppercase tracking-wider text-[#141414]">
                <span className="truncate pr-4">{cleanText(selectedPhoto.title) || "SIDE LINE VISUAL ARCHIVE"}</span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  type="button"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-heading font-bold uppercase tracking-widest text-[#FF0000] hover:bg-[#FF0000]/10 rounded transition cursor-pointer"
                >
                  TUTUP ✕
                </button>
              </div>

              {/* Photo Display */}
              <div className="max-h-[68vh] sm:max-h-[75vh] overflow-hidden flex items-center justify-center bg-[#141414]">
                <img
                  src={selectedPhoto.image_url}
                  alt={cleanText(selectedPhoto.title) || "Foto"}
                  className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Caption Footer */}
              <div className="mt-3 sm:mt-4 pt-2 border-t border-[#141414]/20 flex items-center justify-between text-[9px] sm:text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                <span>SIDE LINE COFFEE • EATERY</span>
                <span className="text-[#FF0000] font-bold">ARCHIVE DOCUMENTATION</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}