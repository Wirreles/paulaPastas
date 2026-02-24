import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, Truck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/pplog2.png"
                  alt="Paula Pastas Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Paula Pastas</h3>
                <p className="text-sm text-neutral-400">Pastas Artesanales</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm">
              Desde 2020 elaboramos las mejores pastas con recetas familiares tradicionales. Cada pasta es un bocado de
              amor y tradición.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Nuestras Pastas</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pastas" className="text-neutral-400 hover:text-white transition-colors">
                  Todas las Pastas
                </Link>
              </li>
              <li>
                <Link href="/pastas/rellenas" className="text-neutral-400 hover:text-white transition-colors">
                  Pastas Rellenas
                </Link>
              </li>
              <li>
                <Link href="/pastas/sin-relleno" className="text-neutral-400 hover:text-white transition-colors">
                  Pastas Sin Relleno
                </Link>
              </li>
              <li>
                <Link href="/pastas/sin-tacc" className="text-neutral-400 hover:text-white transition-colors">
                  Sin TACC
                </Link>
              </li>
              <li>
                <Link href="/salsas" className="text-neutral-400 hover:text-white transition-colors">
                  Salsas Caseras
                </Link>
              </li>
              <li>
                <Link href="/packs" className="text-neutral-400 hover:text-white transition-colors">
                  Packs Especiales
                </Link>
              </li>
              <li>
                <Link href="/zonas" className="text-neutral-400 hover:text-white transition-colors">
                  Zonas de Entrega
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-neutral-400">
                <Phone className="w-4 h-4" />
                <span>+5493413557400</span>
              </li>
              <li className="flex items-center space-x-2 text-neutral-400">
                <Mail className="w-4 h-4" />
                <span>paulapastas.ar@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 text-neutral-400">
                <Truck className="w-4 h-4" />
                <span>Solo nos manejamos con delivery</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Síguenos</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="https://www.facebook.com/profile.php?id=61572472166030" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="https://www.instagram.com/paulapastas/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="https://wa.me/5493413557400" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Sitemap Interno para SEO */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center sm:text-left">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-sm text-neutral-400">
            <div>
              <h5 className="font-medium mb-3 text-white uppercase tracking-wider text-xs">Información</h5>
              <ul className="space-y-2">
                <li><Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-3 text-white uppercase tracking-wider text-xs">Explorar</h5>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
                <li><Link href="/pastas" className="hover:text-white transition-colors">Todos los productos</Link></li>
                <li><Link href="/delivery" className="hover:text-white transition-colors">Delivery</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-3 text-white uppercase tracking-wider text-xs">Categorías</h5>
              <ul className="space-y-2">
                <li><Link href="/pastas/rellenas/lasagna" className="hover:text-white transition-colors">Lasagna</Link></li>
                <li><Link href="/pastas/rellenas/ravioles" className="hover:text-white transition-colors">Ravioles</Link></li>
                <li><Link href="/pastas/rellenas/sorrentinos" className="hover:text-white transition-colors">Sorrentinos</Link></li>
                <li><Link href="/pastas/sin-relleno/noquis" className="hover:text-white transition-colors">Ñoquis</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-3 text-white uppercase tracking-wider text-xs">Servicios</h5>
              <ul className="space-y-2">
                <li><Link href="/pack-raviolada" className="hover:text-white transition-colors">Pack Raviolada</Link></li>
                <li><Link href="/salsas" className="hover:text-white transition-colors">Salsas</Link></li>
                <li><Link href="/zonas" className="hover:text-white transition-colors">Zonas de entrega</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-3 text-white uppercase tracking-wider text-xs">Mi Cuenta</h5>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link href="/dashboard-usuario" className="hover:text-white transition-colors">Mis Pedidos</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
          <p>&copy; 2025 Paula Pastas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
