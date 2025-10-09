import Image from "next/image"

export default function SalsasHero() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      <Image
        src="/banners/banner-salsas.webp"
        alt="Salsas caseras artesanales"
        fill
        className="object-cover object-center"
        priority={true}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">Salsas Caseras</h1>
        <p className="text-lg md:text-xl text-white max-w-2xl drop-shadow-md">
          Descubrí nuestras salsas pensadas para potenciar el sabor de cada pasta. Hechas en casa, sin conservantes ni
          apuros.
        </p>
      </div>
    </section>
  )
}
