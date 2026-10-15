import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import PageHeader from "../../components/public/PageHeader";
import { cleanText } from "../../utils/text";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const loadFacilities = async () => {
      try {
        const { data, error } = await supabase
          .from("facilities")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && !ignore) {
          setFacilities(data || []);
        }
      } catch (err) {
        console.warn("Gagal memuat data fasilitas:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadFacilities();
    return () => {
      ignore = true;
    };
  }, []);

  const withImage = facilities.filter((f) => f.image_url);
  const withoutImage = facilities.filter((f) => !f.image_url);

  return (
    <div className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-8 sm:pt-10 md:pt-16 pb-16 sm:pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
        <PageHeader
          eyebrow="Fasilitas"
          title={
            <>
              Biar betah
              <br />
              lama-lama.
            </>
          }
          intro="Wi-Fi kencang, colokan di banyak meja, area indoor dan outdoor, sampai musala yang bersih. Hal-hal kecil yang bikin kamu nggak buru-buru pulang."
        />

        {loading ? (
          <p className="py-20 text-center text-xs sm:text-sm text-[#5C584E]">Memuat fasilitas…</p>
        ) : facilities.length === 0 ? (
          <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl bg-[#F5E8BA]/60 px-5 sm:px-6 py-10 sm:py-14 text-center text-xs sm:text-sm text-[#5C584E]">
            Daftar fasilitas sedang kami lengkapi.
          </div>
        ) : (
          <>
            {/* Fasilitas dengan foto */}
            {withImage.length > 0 && (
              <div className="mt-10 sm:mt-12 md:mt-16 grid gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {withImage.map((fac) => (
                  <article key={fac.id} className="group">
                    <img
                      src={fac.image_url}
                      alt={cleanText(fac.name)}
                      className="aspect-[4/3] w-full rounded-2xl object-cover bg-[#F5E8BA] shadow-xs group-hover:shadow-md transition-shadow"
                    />
                    <h2 className="mt-4 sm:mt-5 flex items-center gap-2 font-heading text-base sm:text-lg font-black uppercase tracking-tight text-[#141414]">
                      {fac.icon && <span className="text-xl" aria-hidden="true">{fac.icon}</span>}
                      {cleanText(fac.name)}
                    </h2>
                    {fac.description && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[#5C584E]">
                        {cleanText(fac.description)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Fasilitas tanpa foto: daftar ringkas */}
            {withoutImage.length > 0 && (
              <ul
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-10 ${
                  withImage.length > 0 ? "mt-12 sm:mt-16 border-t border-[#141414]/15" : "mt-4"
                }`}
              >
                {withoutImage.map((fac) => (
                  <li key={fac.id} className="flex gap-3.5 sm:gap-4 border-b border-[#141414]/15 py-5 sm:py-6">
                    <span
                      className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F5E8BA] text-lg sm:text-xl"
                      aria-hidden="true"
                    >
                      {fac.icon || "☕"}
                    </span>
                    <div>
                      <h2 className="font-heading text-sm sm:text-base font-bold text-[#141414]">
                        {cleanText(fac.name)}
                      </h2>
                      {fac.description && (
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#5C584E]">
                          {cleanText(fac.description)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Ajakan sewa ruang */}
        <div className="mt-16 sm:mt-20 md:mt-28 grid gap-6 sm:gap-8 rounded-2xl sm:rounded-3xl bg-[#141414] p-6 sm:p-8 md:p-12 text-[#FFF5CF] lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Butuh ruang buat meeting atau acara?
            </h2>
            <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-[#FFF5CF]/65">
              Kami punya paket sewa tempat untuk rapat, workshop, sampai kumpul komunitas. Lihat pilihannya atau langsung tanya ke kami.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 lg:justify-end">
            <Link
              to="/event"
              className="w-full sm:w-auto text-center rounded-xl sm:rounded-full bg-[#FF0000] px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#D60000] active:scale-[0.98] transition-all shadow-md"
            >
              Lihat paket ruang
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto text-center rounded-xl sm:rounded-full border border-[#FFF5CF]/30 px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold hover:border-[#FFF5CF] hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              Hubungi kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
