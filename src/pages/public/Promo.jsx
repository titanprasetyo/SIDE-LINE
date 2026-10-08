import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function Promo() {
  const [promos, setPromos] = useState([]);
  const [liveMusics, setLiveMusics] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchEventData = async () => {
      try {
        const [
          { data: promoData },
          { data: musicData },
          { data: spaceData },
        ] = await Promise.all([
          supabase
            .from("promos")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("live_music_schedules")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("space_bookings")
            .select("*")
            .eq("is_available", true)
            .order("created_at", { ascending: false }),
        ]);

        if (!ignore) {
          setPromos(promoData || []);
          setLiveMusics(musicData || []);
          setSpaces(spaceData || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat event & promo:", err);
        if (!ignore) setLoading(false);
      }
    };

    fetchEventData();
    return () => {
      ignore = true;
    };
  }, []);

  const getBookingWALink = (phone, spaceName) => {
    const cleanNumber = (phone || "6281234567890").replace(/[^0-9]/g, "");
    const formatted = cleanNumber.startsWith("0") ? "62" + cleanNumber.slice(1) : cleanNumber;
    const text = encodeURIComponent(
      `Halo SIDE LINE, saya ingin bertanya dan booking tempat untuk paket: *${spaceName}*. Mohon info ketersediaan tanggal dan jadwalnya.`
    );
    return `https://wa.me/${formatted}?text=${text}`;
  };

  return (
    <div className="space-y-24 md:space-y-36 pb-24 pt-8 md:pt-14 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Index Bar */}
        <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">PROGRAMMES & SPACE</span>
            <span className="text-[#141414]/30">/</span>
            <span>EDITION 2024</span>
          </div>
          <span className="text-[#FF0000] font-bold">PROMO • MUSIC • BOOKING</span>
        </div>

        {/* Headline */}
        <div className="mt-10 md:mt-14 max-w-3xl space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
            Penawaran & Kegiatan
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            Campaigns, Live Sessions & Venue Booking.
          </h1>
          <p className="font-body text-sm sm:text-base text-[#5C584E] pt-2">
            Ikuti berbagai penawaran menu istimewa, nikmati iringan musik akustik akhir pekan, dan reservasi ruang kerja maupun acara privat Anda di SIDE LINE.
          </p>
        </div>

        {/* =========================================================================
            1. PROMO SECTION: EDITORIAL POSTER STYLE
        ========================================================================= */}
        <section className="mt-16">
          <div className="border-b border-[#141414] pb-4 mb-8 flex items-baseline justify-between">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
              01 // Special Offers & Campaigns
            </h2>
            <span className="text-xs font-heading uppercase tracking-widest text-[#5C584E]">
              {promos.length} ACTIVE CAMPAIGNS
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center font-heading text-xs uppercase tracking-widest text-[#5C584E]">
              Memuat data promo...
            </div>
          ) : promos.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#141414]/30 p-8">
              <p className="font-heading text-sm uppercase tracking-wider text-[#141414]">
                Belum ada promo aktif saat ini.
              </p>
              <p className="font-body text-xs text-[#5C584E] mt-1">
                Ikuti terus informasi promo terbaru di café kami atau media sosial.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {promos.map((promo, idx) => (
                <div
                  key={promo.id}
                  className="border border-[#141414] p-6 sm:p-10 bg-[#FFF5CF]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Visual poster */}
                    {promo.image_url && (
                      <div className="lg:col-span-5 border border-[#141414] p-2 bg-[#FFF5CF]">
                        <div className="aspect-[4/3] overflow-hidden bg-[#F5E8BA]">
                          <img
                            src={promo.image_url}
                            alt={promo.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className={promo.image_url ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#FF0000] text-white text-[9px] font-heading font-bold uppercase tracking-widest px-2 py-0.5">
                          OFFER 0{idx + 1}
                        </span>
                        {(promo.start_date || promo.end_date) && (
                          <span className="text-[11px] font-heading uppercase tracking-widest text-[#5C584E]">
                            PERIOD:{" "}
                            {promo.start_date ? new Date(promo.start_date).toLocaleDateString("id-ID") : "Now"}{" "}
                            —{" "}
                            {promo.end_date ? new Date(promo.end_date).toLocaleDateString("id-ID") : "End"}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
                        {promo.title}
                      </h3>

                      <p className="font-body text-sm text-[#5C584E] leading-relaxed whitespace-pre-line">
                        {promo.description}
                      </p>

                      <div className="pt-4 border-t border-[#141414]/15 flex items-center gap-4">
                        <Link
                          to="/contact"
                          className="bg-[#FF0000] px-6 py-3 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
                        >
                          Klaim di Kasir SIDE LINE →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            2. LIVE MUSIC ROSTER: EDITORIAL GIG FLYER
        ========================================================================= */}
        <section className="mt-24 md:mt-32">
          <div className="border-b border-[#141414] pb-4 mb-8 flex items-baseline justify-between">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
                02 // Live Music & Acoustic Sessions
              </h2>
              <p className="font-body text-xs text-[#5C584E] mt-1">
                Lantunan musik langsung untuk menemani waktu santai akhir pekan Anda.
              </p>
            </div>
            <span className="text-xs font-heading uppercase tracking-widest text-[#FF0000] font-bold">
              FREE ADMISSION
            </span>
          </div>

          {liveMusics.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#141414]/30 p-8">
              <p className="font-heading text-sm uppercase tracking-wider text-[#141414]">
                Jadwal musik berikutnya segera diumumkan.
              </p>
              <p className="font-body text-xs text-[#5C584E] mt-1">
                Pantau jadwal berkala untuk penampilan musisi lokal favorit Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {liveMusics.map((item, idx) => (
                <div
                  key={item.id}
                  className="border border-[#141414] p-6 sm:p-8 bg-[#FFF5CF] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#141414] pb-2 text-[10px] font-heading font-bold uppercase tracking-widest">
                    <span className="text-[#FF0000]">SESSION // 0{idx + 1}</span>
                    <span className="bg-[#141414] text-[#FFF5CF] px-2 py-0.5">
                      {item.day_time}
                    </span>
                  </div>

                  {item.image_url && (
                    <div className="aspect-[16/9] overflow-hidden border border-[#141414] bg-[#F5E8BA]">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase text-[#141414]">
                      {item.title}
                    </h3>
                    {item.performer && (
                      <p className="font-heading text-xs uppercase tracking-wider text-[#FF0000] font-semibold mt-1">
                        Musisi: {item.performer}
                      </p>
                    )}
                    <p className="font-body text-xs text-[#5C584E] leading-relaxed mt-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#141414]/15 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                      Open to all visitors
                    </span>
                    <Link
                      to="/contact"
                      className="font-heading text-xs font-bold uppercase tracking-wider text-[#141414] hover:text-[#FF0000] underline"
                    >
                      Reservasi Meja →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            3. VENUE & SPACE BOOKING: ARCHITECTURAL SPECIFICATION
        ========================================================================= */}
        <section className="mt-24 md:mt-32">
          <div className="border-b border-[#141414] pb-4 mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
              03 // Venue & Meeting Space Booking
            </h2>
            <p className="font-body text-xs text-[#5C584E] mt-1">
              Ruang privat untuk rapat kantor, workshop, diskusi komunitas, maupun gathering keluarga di SIDE LINE.
            </p>
          </div>

          {spaces.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#141414]/30 p-8">
              <p className="font-heading text-sm uppercase tracking-wider text-[#141414]">
                Pilihan paket ruangan sedang diperbarui.
              </p>
              <p className="font-body text-xs text-[#5C584E] mt-1">
                Hubungi kami via WhatsApp untuk reservasi atau pertanyaan ketersediaan area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {spaces.map((space, idx) => (
                <div
                  key={space.id}
                  className="border border-[#141414] p-6 sm:p-8 bg-[#FFF5CF] flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Space Image */}
                    {space.image_url && (
                      <div className="aspect-[16/9] border border-[#141414] overflow-hidden bg-[#F5E8BA]">
                        <img
                          src={space.image_url}
                          alt={space.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 border-b border-[#141414] pb-2">
                      <div>
                        <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#FF0000]">
                          PACKAGE 0{idx + 1}
                        </span>
                        <h3 className="font-heading text-xl font-bold uppercase text-[#141414]">
                          {space.name}
                        </h3>
                      </div>

                      {space.capacity && (
                        <span className="border border-[#141414] px-2.5 py-1 text-xs font-heading font-bold uppercase tracking-wider text-[#141414]">
                          Kapasitas: {space.capacity}
                        </span>
                      )}
                    </div>

                    {space.price_info && (
                      <div className="text-sm font-heading font-black text-[#FF0000] uppercase tracking-wider">
                        Tarif: {space.price_info}
                      </div>
                    )}

                    <p className="font-body text-xs sm:text-sm text-[#5C584E] leading-relaxed">
                      {space.description}
                    </p>

                    {space.facilities && (
                      <div className="border-t border-[#141414]/15 pt-3">
                        <span className="text-[10px] font-heading uppercase tracking-widest text-[#141414] font-bold block mb-1">
                          FASILITAS RUANGAN:
                        </span>
                        <p className="font-body text-xs text-[#5C584E]">
                          {space.facilities}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Booking CTA Button */}
                  <div className="mt-8 pt-4 border-t border-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                      KONTAK: {space.contact_phone || "+62 812-3456-7890"}
                    </span>

                    <a
                      href={getBookingWALink(space.contact_phone, space.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto bg-[#FF0000] px-6 py-3 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition text-center"
                    >
                      Reservasi via WhatsApp ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}