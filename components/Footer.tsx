import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, Truck, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sección Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Columna 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-12 h-12 relative">
                <Image
                  src="/pplog2.png"
                  alt="Logo Paula Pastas"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold group-hover:text-neutral-300 transition-colors">Paula Pastas</h3>
                <p className="text-xs text-neutral-400 uppercase tracking-widest">Pastas Artesanales</p>
              </div>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Desde 2020 elaboramos las mejores pastas frescas en Rosario con recetas familiares.
              Calidad artesanal directo a tu mesa.
            </p>
            {/* Redes Sociales con Iconos (Mejor UI) */}
            <div className="flex space-x-4 pt-2">
              <a href="https://instagram.com/paulapastas" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-neutral-400 hover:text-white transition-colors" />
              </a>
              <a href="https://facebook.com/..." target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-neutral-400 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida (SEO) */}
          <nav aria-label="Enlaces rápidos">
            <h4 className="font-semibold text-lg mb-6">Explorar</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/pastas" className="hover:text-white transition-colors">Todos los Productos</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition-colors">Zonas de Envío</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog y Recetas</Link></li>
            </ul>
          </nav>

          {/* Columna 3: Categorías Top (SEO Keywords) */}
          <nav aria-label="Categorías populares">
            <h4 className="font-semibold text-lg mb-6">Categorías</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/pastas/rellenas/lasagna" className="hover:text-white transition-colors">Lasagna Artesanal</Link></li>
              <li><Link href="/pastas/rellenas/sorrentinos" className="hover:text-white transition-colors">Sorrentinos</Link></li>
              <li><Link href="/pastas/sin-relleno/noquis" className="hover:text-white transition-colors">Ñoquis de Papa</Link></li>
              <li><Link href="/pastas/sin-tacc" className="hover:text-white transition-colors">Pastas Sin TACC</Link></li>
              <li><Link href="/pack-raviolada" className="hover:text-white transition-colors font-medium text-white">Pack Raviolada</Link></li>
            </ul>
          </nav>

          {/* Columna 4: Contacto directo */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-neutral-500 shrink-0" />
                <a href="https://wa.me/5493413557400" className="hover:text-white">+54 9 341 355-7400</a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-neutral-500 shrink-0" />
                <a href="mailto:paulapastas.ar@gmail.com" className="hover:text-white italic">paulapastas.ar@gmail.com</a>
              </li>
              <li className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-neutral-500 shrink-0" />
                <span>Rosario, Santa Fe<br /><span className="text-xs italic">Solo envíos a domicilio</span></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Inferior: Legal y Sitemap Compacto */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Paula Pastas. Todos los derechos reservados.</p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terminos-y-condiciones" className="hover:text-white">Términos</Link>
            <Link href="/login" className="hover:text-white">Mi Cuenta</Link>
            <Link href="/pastas/rellenas/ravioles" className="hover:text-white italic text-[10px]">Ravioles</Link>
            <Link href="/salsas" className="hover:text-white italic text-[10px]">Salsas</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}