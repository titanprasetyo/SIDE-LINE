import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

export default function Menu() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchMenuData = async () => {
      try {
        const [
          { data: categoriesData },
          { data: menusData },
        ] = await Promise.all([
          supabase.from("categories").select("*").order("name", { ascending: true }),
          supabase
            .from("menus")
            .select("*, categories(name)")
            .order("is_featured", { ascending: false })
            .order("name", { ascending: true }),
        ]);

        if (!ignore) {
          setCategories(categoriesData || []);
          setMenus(menusData || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat menu publik:", err);
        if (!ignore) setLoading(false);
      }
    };

    fetchMenuData();
    return () => {
      ignore = true;
    };
  }, []);

  // Filter logic
  const filteredMenus = menus.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category_id === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-16 md:space-y-24 pb-24 pt-8 md:pt-14 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Editorial Index Bar */}
        <div className="flex items-center justify-between border-b border-[#141414] pb-3 text-[11px] font-heading font-medium tracking-[0.25em] text-[#5C584E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#FF0000]" />
            <span className="text-[#141414] font-bold">MENU CATALOGUE</span>
            <span className="text-[#141414]/30">/</span>
            <span>CURRENT SELECTION</span>
          </div>
          <span className="text-[#FF0000] font-bold">PRICES IN IDR</span>
        </div>

        {/* Headline */}
        <div className="mt-10 md:mt-14 max-w-3xl space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-[0.3em] text-[#FF0000]">
            Sajian Terkurasi
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#141414] leading-[0.95]">
            The Coffee, Eatery & Drinks Menu.
          </h1>
          <p className="font-body text-sm sm:text-base text-[#5C584E] pt-2">
            Setiap hidangan dan minuman diracik menggunakan bahan berkualitas untuk menyempurnakan waktu santai Anda di SIDE LINE.
          </p>
        </div>

        {/* Navigation & Search Bar */}
        <div className="mt-12 border-y border-[#141414] py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory("all")}
              type="button"
              className={`font-heading text-xs uppercase tracking-widest px-3 py-1.5 transition cursor-pointer font-bold ${
                selectedCategory === "all"
                  ? "bg-[#141414] text-[#FFF5CF]"
                  : "text-[#141414] hover:text-[#FF0000]"
              }`}
            >
              ALL ITEMS
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                type="button"
                className={`font-heading text-xs uppercase tracking-widest px-3 py-1.5 transition cursor-pointer font-bold ${
                  selectedCategory === cat.id
                    ? "bg-[#FF0000] text-white"
                    : "text-[#141414] hover:text-[#FF0000]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <div className="relative border border-[#141414] bg-[#FFF5CF]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH MENU BY NAME..."
                className="w-full px-4 py-2 text-xs font-heading uppercase tracking-wider text-[#141414] placeholder-[#5C584E]/60 bg-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF0000]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Menu Listings: Modern Café Editorial Layout */}
        <div className="mt-12">
          {loading ? (
            <div className="py-24 text-center">
              <span className="font-heading text-xs uppercase tracking-widest text-[#5C584E]">
                Menyiapkan daftar menu...
              </span>
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[#141414]/30 p-12">
              <h3 className="font-heading text-lg font-bold uppercase text-[#141414]">
                Menu Tidak Ditemukan
              </h3>
              <p className="font-body text-xs text-[#5C584E] mt-2">
                Tidak ada menu yang sesuai dengan kata kunci pencarian atau kategori yang dipilih.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                type="button"
                className="mt-4 font-heading text-xs uppercase tracking-widest text-[#FF0000] font-bold underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-14 gap-y-10">
              {filteredMenus.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-[#141414]/20 pb-8 flex gap-5 items-start group ${
                    !item.is_available ? "opacity-60" : ""
                  }`}
                >
                  {/* Item Image (selective thumbnail) */}
                  {item.image_url ? (
                    <div className="h-24 w-24 shrink-0 border border-[#141414] overflow-hidden bg-[#F5E8BA]">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 shrink-0 border border-dashed border-[#141414]/30 flex items-center justify-center text-[10px] font-heading uppercase text-[#5C584E] bg-[#FFF5CF]">
                      [ SIDE LINE ]
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-black text-lg sm:text-xl text-[#141414] group-hover:text-[#FF0000] transition">
                          {item.name}
                        </h2>
                        {item.is_featured && (
                          <span className="bg-[#FF0000] text-white text-[9px] font-heading font-bold uppercase tracking-widest px-1.5 py-0.5">
                            SIGNATURE
                          </span>
                        )}
                      </div>

                      <span className="font-heading font-black text-base sm:text-lg text-[#141414] shrink-0">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Category Label */}
                    <div className="flex items-center gap-2 text-[10px] font-heading uppercase tracking-widest text-[#5C584E]">
                      <span>{item.categories?.name || "MENU"}</span>
                      <span>•</span>
                      {item.is_available ? (
                        <span className="text-[#141414] font-semibold">Tersedia</span>
                      ) : (
                        <span className="text-[#FF0000] font-bold">[ SEDANG HABIS ]</span>
                      )}
                    </div>

                    <p className="font-body text-xs text-[#5C584E] leading-relaxed pt-1">
                      {item.description || "Racikan istimewa pilihan barista SIDE LINE."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <div className="mt-20 border-t border-[#141414] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-heading uppercase tracking-wider text-[#5C584E] gap-4">
          <p>Seluruh harga sudah termasuk pajak & disajikan segar di café.</p>
          <p className="text-[#FF0000] font-bold">SIDE LINE COFFEE • EATERY</p>
        </div>
      </div>
    </div>
  );
}