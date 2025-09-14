"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function AdminNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { href: "/admin", label: "Productos", icon: "📦", priority: "high" },
    { href: "/admin/orders", label: "Pedidos", icon: "📋", priority: "high" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "👥", priority: "medium" },
    { href: "/admin/home-sections", label: "Secciones del Home", icon: "🏠", priority: "medium" },
    { href: "/admin/page-banners", label: "Banners", icon: "🖼️", priority: "medium" },
    { href: "/admin/blog", label: "Blog", icon: "📝", priority: "low" },
    { href: "/admin/reviews", label: "Reseñas", icon: "⭐", priority: "low" },
    { href: "/admin/newsletter", label: "Newsletter", icon: "📧", priority: "low" },
    { href: "/admin/cupones", label: "Cupones", icon: "🎫", priority: "low" },
  ]

  const NavLink = ({ item, isActive, className = "" }: { item: any, isActive: boolean, className?: string }) => (
    <Link
      href={item.href}
      className={`py-2 px-3 text-sm font-medium transition-colors whitespace-nowrap rounded-lg ${
        isActive
          ? "text-primary-600 bg-primary-50 border border-primary-200"
          : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
      } ${className}`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <span className="mr-2">{item.icon}</span>
      {item.label}
    </Link>
  )

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Panel de Administración</h1>
        <p className="text-neutral-600">Gestiona productos, categorías y configuraciones del sitio</p>
      </div>

      {/* Desktop Navigation - Horizontal Layout */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return <NavLink key={item.href} item={item} isActive={isActive} />
            })}
          </div>
        </div>
      </div>

      {/* Tablet Navigation - Grid Layout */}
      <div className="hidden md:block lg:hidden">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <NavLink key={item.href} item={item} isActive={isActive} />
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Collapsible */}
      <div className="md:hidden">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <span className="text-sm font-semibold text-neutral-700">Navegación</span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <NavLink key={item.href} item={item} isActive={isActive} />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
