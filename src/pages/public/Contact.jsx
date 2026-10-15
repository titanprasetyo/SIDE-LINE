import { useState, useEffect } from "react";
import { cafeService } from "../../services/cafeService";
import PageHeader from "../../components/public/PageHeader";
import { cleanText, toWhatsAppLink, toInstagramLink } from "../../utils/text";

const FAQS = [
  {
    q: "Wi-Fi-nya kencang? Enak buat kerja?",
    a: "Kencang dan gratis. Banyak meja juga sudah dekat colokan, jadi aman buat kerja atau nugas berjam-jam.",
  },
  {
    q: "Bisa reservasi meja atau acara privat?",
    a: "Bisa. Chat kami di WhatsApp untuk reservasi meja rombongan, ulang tahun, atau sewa ruang meeting. Sebutkan tanggal, jam, dan jumlah orangnya ya.",
  },
  {
    q: "Parkirnya gimana?",
    a: "Ada area parkir untuk motor dan mobil tepat di depan cafe, dijaga dan tertata.",
  },
  {
    q: "Jam berapa last order?",
    a: "Last order 30 menit sebelum tutup, baik untuk minuman maupun makanan.",
  },
];

function InfoRow({ label, children }) {
  return (
    <div className="grid gap-1 sm:gap-6 border-t border-[#141414]/15 py-4 sm:py-5 sm:grid-cols-[9rem_1fr]">
      <dt className="text-xs sm:text-sm font-semibold text-[#5C584E]">{label}</dt>
      <dd className="text-sm sm:text-base text-[#141414]">{children}</dd>
    </div>
  );
}

export default function Contact() {
  const [cafeInfo, setCafeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchInfo = async () => {
      try {
        const data = await cafeService.get();
        if (!ignore && data) setCafeInfo(data);
      } catch (err) {
        console.warn("Gagal memuat kontak:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInfo();
    return () => {
      ignore = true;
    };
  }, []);

  const phone = cafeInfo?.phone || "";
  const instagram = cafeInfo?.instagram || "";
  const waLink = toWhatsAppLink(
    phone,
    "Halo Side Line, saya mau tanya soal menu dan reservasi."
  );
  const igLink = toInstagramLink(instagram);

  return (
    <div className="px-4 sm:px-6 lg:px-12 2xl:px-16 pt-8 sm:pt-10 md:pt-16 pb-16 sm:pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
        <PageHeader
          eyebrow="Kontak"
          title={
            <>
              Mampir, atau
              <br />
              sapa kami dulu.
            </>
          }
          intro="Mau tanya menu, booking meja, ngajak kolaborasi, atau bingung cari jalan? Kabari kami, biasanya dibalas cepat."
        />

        {loading ? (
          <p className="py-20 text-center text-xs sm:text-sm text-[#5C584E]">Memuat info kontak…</p>
        ) : (
          <div className="mt-10 sm:mt-12 md:mt-16 grid gap-8 sm:gap-12 lg:grid-cols-12">
            {/* Detail */}
            <dl className="lg:col-span-7 border-b border-[#141414]/15">
              <InfoRow label="Alamat">
                <span className="leading-relaxed">
                  {cleanText(cafeInfo?.address) || "Jl. Kayu Manis Raya, & Jl. Lereng Indah, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan"}
                </span>
                <a
                  href={cafeInfo?.google_maps_url || "https://maps.google.com/?q=Jl.+Kayu+Manis+Raya,+%26+Jl.+Lereng+Indah,+Pd.+Cabe+Udik,+Kec.+Pamulang,+Kota+Tangerang+Selatan"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#FF0000] hover:text-[#141414] transition-colors"
                >
                  <span>Petunjuk arah di Google Maps ↗</span>
                </a>
              </InfoRow>
              <InfoRow label="Jam buka">
                <span className="font-semibold">
                  {cleanText(cafeInfo?.opening_hours) || "Setiap hari, 09.00 – 22.00 WIB"}
                </span>
                <span className="mt-1 block text-xs sm:text-sm text-[#5C584E]">
                  Dine-in dan takeaway. Last order 30 menit sebelum tutup.
                </span>
              </InfoRow>
              {phone && (
                <InfoRow label="WhatsApp">
                  <a href={waLink} target="_blank" rel="noreferrer" className="hover:text-[#FF0000] transition-colors font-medium">
                    {phone}
                  </a>
                </InfoRow>
              )}
              {instagram && (
                <InfoRow label="Instagram">
                  <a href={igLink} target="_blank" rel="noreferrer" className="hover:text-[#FF0000] transition-colors font-medium">
                    {instagram}
                  </a>
                </InfoRow>
              )}
            </dl>

            {/* Ajakan reservasi */}
            <aside className="lg:col-span-5">
              <div className="rounded-2xl sm:rounded-3xl bg-[#141414] p-6 sm:p-8 md:p-10 text-[#FFF5CF]">
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight">
                  Mau booking meja?
                </h2>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-[#FFF5CF]/65">
                  Kirim tanggal, jam, dan jumlah orang lewat WhatsApp. Untuk rombongan besar atau acara privat, sebaiknya kabari H-2.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col gap-2.5 sm:gap-3">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl sm:rounded-full bg-[#FF0000] px-5 sm:px-6 py-3 sm:py-3.5 text-center text-xs sm:text-sm font-semibold text-white hover:bg-[#D60000] active:scale-[0.98] transition-all shadow-md"
                    >
                      Chat di WhatsApp
                    </a>
                  )}
                  {igLink && (
                    <a
                      href={igLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl sm:rounded-full border border-[#FFF5CF]/30 px-5 sm:px-6 py-3 sm:py-3.5 text-center text-xs sm:text-sm font-semibold hover:border-[#FFF5CF] hover:bg-white/5 active:scale-[0.98] transition-all"
                    >
                      Lihat Instagram
                    </a>
                  )}
                  {!waLink && !igLink && (
                    <p className="text-xs sm:text-sm text-[#FFF5CF]/60">Kontak akan segera diperbarui.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* FAQ */}
        <section className="mt-16 sm:mt-20 md:mt-28 grid gap-6 sm:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-[#141414]">
              Sering ditanya
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#5C584E]">
              Belum ketemu jawabannya? Tanya langsung saja lewat WhatsApp.
            </p>
          </div>
          <div className="lg:col-span-8 border-b border-[#141414]/15">
            {FAQS.map((item) => (
              <details key={item.q} className="group border-t border-[#141414]/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 sm:py-5 font-heading text-sm sm:text-base md:text-lg font-bold text-[#141414] [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-[#141414]/20 text-base sm:text-lg transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 sm:pb-6 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#5C584E]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}