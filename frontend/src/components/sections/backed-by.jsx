import Image from "next/image";

/**
 * BackedBy component clones the logo wall section of investors and partners.
 * It uses the provided SVG assets and follows the high-level design system.
 */
export default function BackedBy() {
  const partners = [
    {
      name: "Top Fund",
      src: "https://placehold.co/120x48/e0f2fe/0ea5e9?text=Top+Fund",
      width: 120,
      height: 48,
    },
    {
      name: "Growth VC",
      src: "https://placehold.co/100x40/f0f9ff/0284c7?text=Growth+VC",
      width: 100,
      height: 40,
    },
    {
      name: "Innovate Labs",
      src: "https://placehold.co/100x40/e0f2fe/38bdf8?text=Innovate+Labs",
      width: 100,
      height: 40,
    },
    {
      name: "Alpha Ventures",
      src: "https://placehold.co/120x40/f0f9ff/0ea5e9?text=Alpha+VC",
      width: 120,
      height: 40,
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container px-4 mx-auto text-center">
        {/* Section Heading */}
        <h3
          className="text-[14px] font-semibold text-[#666666] mb-8 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Backed By
        </h3>

        {/* Logo Wall */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-80 hover:opacity-100 transition-opacity duration-300">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className="object-contain max-h-[40px] w-auto"
                unoptimized // Using unoptimized for SVGs and external Supabase links to ensure they load as intended
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}