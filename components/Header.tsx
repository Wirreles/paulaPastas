"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, User, ArrowLeft, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"

const NAVIGATION_DATA = [
  { name: "Inicio", href: "/", id: "inicio" },
  {
    name: "Pastas",
    href: "/pastas",
    id: "pastas",
    submenu: [
      {
        name: "Rellenas",
        href: "/pastas/rellenas",
        id: "rellenas",
        subcategorias: [
          { name: "Lasagna", href: "/pastas/rellenas/lasagna/lasagna-estrato" },
          { name: "Ravioles", href: "/pastas/rellenas/ravioles" },
          { name: "Sorrentinos", href: "/pastas/rellenas/sorrentinos" },
        ],
      },
      {
        name: "Sin Relleno",
        href: "/pastas/sin-relleno",
        id: "sin-relleno",
        subcategorias: [
          { name: "Ñoquis", href: "/pastas/sin-relleno/noquis/nube-de-papa" },
          { name: "Fideos", href: "/pastas/sin-relleno/fideos" },
        ],
      },
      { name: "Sin TACC", href: "/pastas/sin-tacc", id: "sin-tacc" },
      { name: "Pack Raviolada", href: "/pack-raviolada", id: "pack" },
      { name: "Salsas", href: "/salsas", id: "salsas" },
    ],
  },
  { name: "Nosotros", href: "/nosotros", id: "nosotros" },
  { name: "Delivery", href: "/delivery", id: "delivery" },
  { name: "Blog", href: "/blog", id: "blog" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState<string[]>([])
  const pathname = usePathname()
  const { user, isAdmin } = useAuth()
  const { totalItems, toggleCart } = useCart()

  useEffect(() => {
    setIsMenuOpen(false)
    setMenuPath([])
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMenuOpen])

  const getMenuItems = (path: string[]) => {
    let currentItems: any[] = NAVIGATION_DATA
    for (const segment of path) {
      const parent = currentItems.find((item) => item.id === segment)
      if (parent?.submenu) currentItems = parent.submenu
      else if (parent?.subcategorias) currentItems = parent.subcategorias
      else return []
    }
    return currentItems
  }

  const currentMenuItems = getMenuItems(menuPath)
  const isSubMenu = menuPath.length > 0

  const currentMenuTitle = isSubMenu
    ? getMenuItems(menuPath.slice(0, -1)).find((item) => item.id === menuPath[menuPath.length - 1])?.name || "Menú"
    : "Menú"

  const handleMobileClick = (e: React.MouseEvent, item: any) => {
    if (item.submenu || item.subcategorias) {
      e.preventDefault()
      setMenuPath([...menuPath, item.id])
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-primary-350 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20 py-2">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <Image
                src="/pplog2.png"
                alt="Paula Pastas Logo"
                width={56}
                height={56}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="font-display text-base sm:text-lg font-bold text-neutral-900 block">
                Paula Pastas
              </span>
              <p className="text-[10px] sm:text-xs text-neutral-600 uppercase tracking-tighter">Pastas Artesanales</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {NAVIGATION_DATA.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:bg-white/50 ${pathname === item.href ? "text-primary-800" : "text-neutral-900"
                    }`}
                >
                  {item.name}
                </Link>

                {/* Dropdown Desktop */}
                {(item.submenu) && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="py-2">
                      {item.submenu.map((subitem: any) => (
                        <div key={subitem.id}>
                          <Link
                            href={subitem.href}
                            className="block px-4 py-2 text-sm text-neutral-900 hover:bg-primary-50 hover:text-primary-700 font-bold"
                          >
                            {subitem.name}
                          </Link>
                          {subitem.subcategorias && (
                            <div className="bg-neutral-50 py-1">
                              {subitem.subcategorias.map((cat: any) => (
                                <Link
                                  key={cat.name}
                                  href={cat.href}
                                  className="block px-8 py-1.5 text-xs text-neutral-600 font-medium hover:text-primary-600"
                                >
                                  {cat.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={toggleCart} className="p-2 relative hover:bg-white/50 rounded-full transition-all duration-200">
              <ShoppingBag className="w-6 h-6 text-neutral-900" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <Link href={isAdmin ? "/admin" : "/dashboard-usuario"} className="p-2 hover:bg-white/50 rounded-full transition-all duration-200">
                <User className="w-6 h-6 text-neutral-900" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 rounded-full text-sm font-bold text-neutral-900 hover:bg-white/50 transition-all duration-200"
              >
                Entrar
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-neutral-900" /> : <Menu className="w-6 h-6 text-neutral-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Mantiene la lógica anterior pero con texto más fuerte) */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-[999] lg:hidden flex flex-col">
          <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isSubMenu && (
                <button onClick={() => setMenuPath(prev => prev.slice(0, -1))} className="p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="font-bold uppercase tracking-widest text-sm">{currentMenuTitle}</h2>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto">
            {currentMenuItems.map((item: any) => (
              <Link
                key={item.id || item.name}
                href={item.href}
                onClick={(e) => handleMobileClick(e, item)}
                className="flex items-center justify-between px-6 py-5 border-b border-neutral-50 text-neutral-900 active:bg-neutral-100"
              >
                <span className="font-bold text-lg">{item.name}</span>
                {(item.submenu || item.subcategorias) && <ArrowRight className="w-5 h-5 text-neutral-400" />}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}