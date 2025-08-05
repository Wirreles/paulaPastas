import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍝</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Comida Casera</h3>
                <p className="text-sm text-neutral-400">Pastas Artesanales</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm">
              Desde 1995 elaboramos las mejores pastas con recetas familiares tradicionales. Cada pasta es un bocado de
              amor y tradición.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu/rellenas" className="text-neutral-400 hover:text-white transition-colors">
                  Pastas Rellenas
                </Link>
              </li>
              <li>
                <Link href="/menu/sin-tacc" className="text-neutral-400 hover:text-white transition-colors">
                  Sin TACC
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
                <span>(0341) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-neutral-400">
                <Mail className="w-4 h-4" />
                <span>info@comidacasera.com</span>
              </li>
              <li className="flex items-center space-x-2 text-neutral-400">
                <MapPin className="w-4 h-4" />
                <span>Rosario, Santa Fe</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Horarios</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Lun - Vie: 18:00 - 23:00</span>
              </li>
              <li className="ml-6">Sáb - Dom: 12:00 - 23:00</li>
            </ul>

            <div className="mt-4">
              <h5 className="font-medium mb-2">Síguenos</h5>
              <div className="flex space-x-3">
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
          <p>&copy; 2024 Comida Casera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
