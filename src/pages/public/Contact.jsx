import { useState, useEffect } from "react";
import { cafeService } from "../../services/cafeService";

export default function Contact() {
  const [cafeInfo, setCafeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchInfo = async () => {
      try {
        const data = await cafeService.get();
        if (!ignore && data) {
          setCafeInfo(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Gagal memuat kontak:", err);
        if (!ignore) setLoading(false);
      }
    };
    fetchInfo();
    return () => {
      ignore = true;
    };
  }, []);

  // Format WhatsApp link
  const getWhatsAppLink = (phone) => {
    if (!phone) return "#";
    const cleanNumber = phone.replace(/[^0-9]/g, "");
    const formatted = cleanNumber.startsWith("0")
      ? "62" + cleanNumber.slice(1)
      : cleanNumber;
    return `https://wa.me/${formatted}?text=Halo%20SIDE%20LINE%2C%20saya%20ingin%20bertanya%20mengenai%20menu%20dan%20reservasi`;
  };

  // Format Instagram link
  const getInstagramLink = (username) => {
    if (!username) return "#";
    const cleanUsername = username.replace("@", "").trim();
    return `https://instagram.com/${cleanUsername}`;
  };

  return (
    <div className="space-y-24 md:space-y-36 pb-24 pt-8 md:pt-14 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Index Bar */}
        <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">CONTACT & INQUIRIES</span>
            <span className="text-[#141414]/30">/</span>
            <span>FIND US</span>
          </div>
          <span className="text-[#FF0000] font-bold">VISITOR GUIDE</span>
        </div>

        {/* Headline */}
        <div className="mt-10 md:mt-14 max-w-3xl space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
            Koneksi & Lokasi
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            Visit The Café or Say Hello.
          </h1>
          <p className="font-body text-sm sm:text-base text-[#5C584E] pt-2">
            Punya pertanyaan mengenai sajian, ketersediaan meja, kolaborasi event, atau panduan arah ke lokasi café? Kami siap menyambut Anda.
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <span className="font-heading text-xs uppercase tracking-widest text-[#5C584E]">
              Memuat informasi lokasi & kontak...
            </span>
          </div>
        ) : (
          <>
            {/* Information Grid: Architectural Café Approach */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Box 1: Address & Maps */}
              <div className="border border-[#141414] p-8 bg-[#FFF5CF] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-heading font-bold uppercase tracking-widest text-[#5C584E] border-b border-[#141414] pb-2">
                    <span>01 // LOCATION</span>
                    <span className="text-[#FF0000]">ADDRESS</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold uppercase text-[#141414]">
                    Alamat Café
                  </h2>
                  <p className="font-body text-sm text-[#5C584E] leading-relaxed">
                    {cafeInfo?.address || "Jl. Contoh Alamat Café SIDE LINE No. 123"}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#141414]/15">
                  {cafeInfo?.google_maps_url ? (
                    <a
                      href={cafeInfo.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center bg-[#FF0000] px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest text-white hover:bg-[#D60000] transition"
                    >
                      Buka di Google Maps ↗
                    </a>
                  ) : (
                    <span className="text-xs font-heading text-[#5C584E]">
                      Maps URL belum diatur
                    </span>
                  )}
                </div>
              </div>

              {/* Box 2: Operating Hours */}
              <div className="border border-[#141414] p-8 bg-[#FFF5CF] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-heading font-bold uppercase tracking-widest text-[#5C584E] border-b border-[#141414] pb-2">
                    <span>02 // TIMINGS</span>
                    <span className="text-[#FF0000]">DAILY</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold uppercase text-[#141414]">
                    Jam Operasional
                  </h2>
                  <p className="font-heading text-base font-bold text-[#141414]">
                    {cafeInfo?.opening_hours || "Setiap Hari: 09:00 — 22:00 WIB"}
                  </p>
                  <p className="font-body text-xs text-[#5C584E] leading-relaxed">
                    Melayani pesanan dine-in, takeaway, dan area coffee workspace. Last order 30 menit sebelum café tutup.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#141414]/15">
                  <div className="border border-[#141414] px-4 py-3 text-center text-xs font-heading font-bold uppercase tracking-wider text-[#141414]">
                    Open Daily for Coffee & Dining
                  </div>
                </div>
              </div>

              {/* Box 3: Direct Connect */}
              <div className="border border-[#141414] p-8 bg-[#FFF5CF] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-heading font-bold uppercase tracking-widest text-[#5C584E] border-b border-[#141414] pb-2">
                    <span>03 // CHANNELS</span>
                    <span className="text-[#FF0000]">DIRECT</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold uppercase text-[#141414]">
                    Kontak & Medsos
                  </h2>
                  <div className="space-y-2 text-xs sm:text-sm font-body text-[#5C584E]">
                    <p>
                      WhatsApp:{" "}
                      <span className="font-heading font-semibold text-[#141414]">
                        {cafeInfo?.phone || "+62 812-3456-7890"}
                      </span>
                    </p>
                    <p>
                      Instagram:{" "}
                      <span className="font-heading font-semibold text-[#141414]">
                        {cafeInfo?.instagram || "@sideline.coffee"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#141414]/15 space-y-2">
                  {cafeInfo?.phone && (
                    <a
                      href={getWhatsAppLink(cafeInfo.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center bg-[#141414] px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest text-[#FFF5CF] hover:bg-[#FF0000] hover:text-white transition"
                    >
                      Chat via WhatsApp ↗
                    </a>
                  )}

                  {cafeInfo?.instagram && (
                    <a
                      href={getInstagramLink(cafeInfo.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center border border-[#141414] px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-[#FFF5CF] transition"
                    >
                      Kunjungi Instagram ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Architectural FAQ Section */}
            <div className="mt-24 md:mt-32 border-t border-[#141414] pt-14">
              <div className="mb-10">
                <span className="text-xs font-heading font-bold uppercase tracking-[0.25em] text-[#FF0000] block mb-1">
                  Common Inquiries
                </span>
                <h2 className="font-heading text-3xl font-black text-[#141414] uppercase tracking-tight">
                  Pertanyaan Pengunjung (FAQ)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border border-[#141414] p-6 space-y-2 bg-[#FFF5CF]">
                  <span className="text-[10px] font-heading font-bold text-[#FF0000] block">
                    Q1 // CONNECTIVITY
                  </span>
                  <h3 className="font-heading text-sm font-bold uppercase text-[#141414]">
                    Apakah tersedia Wi-Fi kencang?
                  </h3>
                  <p className="font-body text-xs text-[#5C584E] leading-relaxed">
                    Tersedia jaringan Wi-Fi berkecepatan tinggi yang bebas digunakan untuk aktivitas kerja (WFC), riset, maupun berselancar santai.
                  </p>
                </div>

                <div className="border border-[#141414] p-6 space-y-2 bg-[#FFF5CF]">
                  <span className="text-[10px] font-heading font-bold text-[#FF0000] block">
                    Q2 // RESERVATIONS
                  </span>
                  <h3 className="font-heading text-sm font-bold uppercase text-[#141414]">
                    Bisa reservasi meja & private event?
                  </h3>
                  <p className="font-body text-xs text-[#5C584E] leading-relaxed">
                    Sangat bisa. Hubungi kami melalui WhatsApp untuk reservasi meja kelompok, perayaan ulang tahun, atau sewa ruang rapat.
                  </p>
                </div>

                <div className="border border-[#141414] p-6 space-y-2 bg-[#FFF5CF]">
                  <span className="text-[10px] font-heading font-bold text-[#FF0000] block">
                    Q3 // PARKING
                  </span>
                  <h3 className="font-heading text-sm font-bold uppercase text-[#141414]">
                    Bagaimana fasilitas parkir kendaraan?
                  </h3>
                  <p className="font-body text-xs text-[#5C584E] leading-relaxed">
                    Tersedia area parkir yang aman dan tertata rapi bagi pengunjung roda dua maupun roda empat tepat di pelataran café.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}