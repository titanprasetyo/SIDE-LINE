import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { cafeService } from "../../services/cafeService";
import heroImg from "../../assets/hero.png";

export default function About() {
  const [cafeInfo, setCafeInfo] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [gallerySample, setGallerySample] = useState([]);

  const outletCtx = useOutletContext();
  const onOpenProfile = outletCtx?.onOpenProfile;

  useEffect(() => {
    let ignore = false;
    const fetchInfo = async () => {
      try {
        const [infoData, { data: facData }, { data: galData }] = await Promise.all([
          cafeService.get(),
          supabase.from("facilities").select("*").order("created_at", { ascending: true }),
          supabase.from("galleries").select("*").limit(2),
        ]);

        if (!ignore) {
          if (infoData) setCafeInfo(infoData);
          if (facData) setFacilities(facData);
          if (galData) setGallerySample(galData);
        }
      } catch (err) {
        console.warn("Gagal memuat info tentang kami:", err);
      }
    };
    fetchInfo();
    return () => {
      ignore = true;
    };
  }, []);

  const storyImage = gallerySample[0]?.image_url || heroImg;
  const secondaryImage = gallerySample[1]?.image_url || heroImg;

  return (
    <div className="space-y-24 md:space-y-36 pb-24 pt-8 md:pt-14 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Index Bar */}
        <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">ABOUT / ARCHIVE</span>
            <span className="text-[#141414]/30">/</span>
            <span>VOL. 01</span>
          </div>
          <span className="text-[#FF0000] font-bold">BRAND MANIFESTO</span>
        </div>

        {/* Large Editorial Headline */}
        <div className="mt-10 md:mt-14 max-w-4xl space-y-4">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
            Kisah & Karakter
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            Where Coffee Meets <br />
            <span className="text-[#FF0000] italic font-light">Architectural</span>{" "}
            Calm.
          </h1>
          <p className="font-heading text-sm sm:text-base font-semibold uppercase tracking-widest text-[#5C584E] pt-2">
            {cafeInfo?.tagline || "Coffee • Eatery • Space"}
          </p>
        </div>

        {/* Asymmetric Editorial Spread */}
        <div className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Visual Image (Large frame) */}
          <div className="lg:col-span-7">
            <div className="border border-[#141414] p-2 bg-[#FFF5CF]">
              <div className="aspect-[16/10] overflow-hidden bg-[#F5E8BA]">
                <img
                  src={storyImage}
                  alt="SIDE LINE Ambience"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                <span>ARCHIVE 01: THE SPACE</span>
                <span className="text-[#FF0000]">SIDE LINE INTERIOR</span>
              </div>
            </div>

            {/* Inset Quote */}
            <div className="mt-8 border-l-2 border-[#FF0000] pl-6 py-2">
              <p className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wide text-[#141414] leading-snug">
                “Kami percaya secangkir kopi terbaik dinikmati dalam ruang yang memberi keleluasaan berpikir.”
              </p>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4 font-body text-sm sm:text-base text-[#5C584E] leading-relaxed">
              <p>
                {cafeInfo?.about_text ||
                  "SIDE LINE didirikan dengan tekad untuk menghadirkan pengalaman kopi yang lebih dari sekadar rutinitas kafein harian. Ini adalah ruang jeda yang dibangun untuk memfasilitasi percakapan mendalam, kreasi mandiri, dan istirahat yang berkualitas."}
              </p>
              <p>
                Setiap biji kopi yang kami seduh dipilih melalui kurasi ketat untuk menonjolkan profil rasa alami terbaiknya. Bersanding dengan deretan menu makanan yang disajikan segar, kami memastikan setiap kunjungan Anda menjadi momen yang berkesan.
              </p>
            </div>

            {/* Secondary Inset Visual */}
            <div className="border border-[#141414] p-1.5 bg-[#FFF5CF] max-w-sm">
              <div className="aspect-[16/9] overflow-hidden bg-[#F5E8BA]">
                <img
                  src={secondaryImage}
                  alt="Detail suasana"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pt-2 px-1 text-[9px] font-heading uppercase tracking-widest text-[#5C584E] flex justify-between">
                <span>[ DETAIL PERSPECTIVE ]</span>
                <span className="text-[#FF0000]">SIDE LINE ARCHIVE</span>
              </div>
            </div>

            {/* Founder Note Link */}
            <div className="pt-4 border-t border-[#141414]/15 space-y-3">
              <p className="font-heading text-[11px] uppercase tracking-widest text-[#5C584E]">
                CREATIVE DIRECTION
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/team"
                  className="font-heading text-xs font-bold uppercase tracking-widest text-[#141414] hover:text-[#FF0000] transition underline underline-offset-4"
                >
                  Meet The Team & Founder →
                </Link>
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    type="button"
                    className="font-heading text-xs font-bold uppercase tracking-widest text-[#FF0000] hover:text-[#141414] transition cursor-pointer"
                  >
                    [ OPEN CURATOR PROFILE ]
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Brand Commitments: Architectural Grid */}
        <div className="mt-24 md:mt-32 border-t border-[#141414] pt-14">
          <div className="mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
              Core Principles
            </span>
            <h2 className="font-heading text-3xl font-black text-[#141414] uppercase tracking-tight">
              Tiga Nilai Fondasi SIDE LINE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#141414] p-6 space-y-3 bg-[#FFF5CF]">
              <span className="font-heading text-xs font-bold text-[#FF0000] block">
                01 // FLAVOR DISCIPLINE
              </span>
              <h3 className="font-heading text-lg font-bold text-[#141414] uppercase">
                Kopi Berkualitas
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                Biji kopi terkurasi dari proses roasting terstandar diekstraksi dengan presisi oleh barista berpengalaman kami untuk menjaga keaslian cita rasa.
              </p>
            </div>

            <div className="border border-[#141414] p-6 space-y-3 bg-[#FFF5CF]">
              <span className="font-heading text-xs font-bold text-[#FF0000] block">
                02 // SPATIAL HARMONY
              </span>
              <h3 className="font-heading text-lg font-bold text-[#141414] uppercase">
                Ruang & Arsitektur
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                Rancangan interior minimalis, pencahayaan alami yang lembut, serta susunan tempat duduk yang memberi kenyamanan maksimal bagi pekerja maupun sahabat.
              </p>
            </div>

            <div className="border border-[#141414] p-6 space-y-3 bg-[#FFF5CF]">
              <span className="font-heading text-xs font-bold text-[#FF0000] block">
                03 // GENUINE HOSPITALITY
              </span>
              <h3 className="font-heading text-lg font-bold text-[#141414] uppercase">
                Pelayanan Hangat
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                Setiap tegukan dan obrolan didampingi keramahan tulus, menjadikan SIDE LINE rumah kedua untuk waktu rehat Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Facilities Section */}
        {facilities.length > 0 && (
          <div className="mt-24 md:mt-32 border-t border-[#141414] pt-14">
            <div className="mb-10">
              <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
                Fasilitas Penunjang
              </span>
              <h2 className="font-heading text-3xl font-black text-[#141414] uppercase tracking-tight">
                Sarana Kenyamanan Lengkap
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((fac, i) => (
                <div
                  key={fac.id}
                  className="border border-[#141414] p-5 space-y-2 bg-[#FFF5CF]"
                >
                  <div className="flex items-center justify-between text-[10px] font-heading font-bold uppercase tracking-widest text-[#5C584E]">
                    <span>REF. 0{i + 1}</span>
                    <span className="text-[#FF0000]">{fac.icon || "•"}</span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#141414] uppercase">
                    {fac.name}
                  </h3>
                  <p className="font-body text-xs text-[#5C584E] leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA to Menu */}
        <div className="mt-20 border-t border-[#141414] pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-heading text-base font-bold uppercase tracking-wide text-[#141414]">
            Ingin mencicipi cita rasa racikan kami?
          </p>
          <Link
            to="/menu"
            className="bg-[#FF0000] px-8 py-3.5 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
          >
            Lihat Daftar Menu Lengkap →
          </Link>
        </div>
      </div>
    </div>
  );
}