/**
 * Header halaman publik yang konsisten: label kecil, judul besar di kiri,
 * dan paragraf pengantar di kanan (desktop).
 */
export default function PageHeader({ eyebrow, title, intro, children }) {
  return (
    <header className="border-b border-[#141414]/15 pb-8 sm:pb-10 md:pb-14">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          {eyebrow && (
            <p className="font-heading text-xs sm:text-sm font-bold text-[#E5251F] uppercase tracking-wider">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 sm:mt-3 font-heading text-3xl xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black uppercase tracking-tight leading-[1] sm:leading-[0.95] text-[#141414]">
            {title}
          </h1>
        </div>
        {intro && (
          <p className="lg:col-span-4 font-body text-xs sm:text-sm md:text-base leading-relaxed text-[#5C584E]">
            {intro}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
