"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminNavigation() {
  const pathname = usePathname()

  const navigationItems = [
    { href: "/admin", label: "Productos", icon: "📦" },
    { href: "/admin/orders", label: "Pedidos", icon: "📋" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { href: "/admin/home-sections", label: "Secciones del Home", icon: "🏠" },
    { href: "/admin/page-banners", label: "Banners de Páginas", icon: "🖼️" },
    { href: "/admin/blog", label: "Blog", icon: "📝" },
    { href: "/admin/reviews", label: "Reseñas", icon: "⭐" },
  ]

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Panel de Administración</h1>
        <p className="text-neutral-600">Gestiona productos, categorías y configuraciones del sitio</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap space-x-4 border-b border-neutral-200">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-neutral-600 hover:text-primary-600 hover:border-b-2 hover:border-primary-600"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
