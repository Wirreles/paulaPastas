"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image" // Importar Image
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, User, LogOut, ArrowLeft, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context" // Importar useCart
import CartSidebar from "@/components/CartSidebar" // Importar CartSidebar

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState<string[]>([]) // Tracks current path in nested menu
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const { totalItems, toggleCart } = useCart() // Usar totalItems y toggleCart del contexto

  // Effect to control body overflow
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "" // Reset to default
    }
    // Cleanup function to ensure overflow is reset when component unmounts
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  const navigation = [
    { name: "Inicio", href: "/" },
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
            { name: "Lasaña", href: "/pastas/rellenas/lasana" },
            { name: "Ravioles", href: "/pastas/rellenas/ravioles" },
            { name: "Sorrentinos", href: "/pastas/rellenas/sorrentinos" },
          ],
        },
        {
          name: "Sin Relleno",
          href: "/pastas/sin-relleno",
          id: "sin-relleno",
          subcategorias: [
            { name: "Ñoquis", href: "/pastas/sin-relleno/noquis" },
            { name: "Fideos", href: "/pastas/sin-relleno/fideos" },
          ],
        },
        { name: "Sin TACC", href: "/pastas/sin-tacc", id: "sin-tacc" },
        { name: "Pack", href: "/pack-raviolada", id: "pack" }, // Adjusted to match screenshot
        { name: "Ravioles fritos", href: "/pastas/ravioles-fritos", id: "ravioles-fritos" }, // Placeholder
        { name: "Salsas", href: "/pastas/salsas", id: "salsas" }, // Placeholder
      ],
    },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Delivery", href: "/delivery" },
    { name: "Blog", href: "/blog" },
  ]

  const getMenuItems = (path: string[]) => {
    let currentItems: any[] = navigation

    for (const segment of path) {
      const parent = currentItems.find((item) => item.id === segment)
      if (parent && parent.submenu) {
        currentItems = parent.submenu
      } else if (parent && parent.subcategorias) {
        currentItems = parent.subcategorias
      } else {
        return [] // Path not found or no submenu/subcategories
      }
    }
    return currentItems
  }

  const currentMenuItems = getMenuItems(menuPath)
  const isSubMenu = menuPath.length > 0
  const currentMenuTitle = isSubMenu
    ? getMenuItems(menuPath.slice(0, -1)).find((item) => item.id === menuPath[menuPath.length - 1])?.name || "Menú"
    : "Menú"

  const handleMenuItemClick = (item: any) => {
    if (item.submenu || item.subcategorias) {
      setMenuPath([...menuPath, item.id])
    } else {
      setIsMenuOpen(false) // Close menu on final link click
    }
  }

  const handleBackClick = () => {
    setMenuPath((prevPath) => prevPath.slice(0, -1))
  }

  return (
    <header className="sticky top-0 z-50 bg-primary-350">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/pplog2.png" alt="Paula Pastas Logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-neutral-900">Paula Pastas</h1>
              <p className="text-xs text-neutral-600">Pastas Artesanales</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === item.href ? "text-primary-600" : "text-neutral-700"
                  }`}
                >
                  {item.name}
                </Link>

                {(item.submenu || item.subcategorias) && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {(item.submenu || item.subcategorias)?.map((subitem: any) => (
                        <div key={subitem.name}>
                          <Link
                            href={subitem.href}
                            className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                          >
                            {subitem.name}
                          </Link>
                          {subitem.subcategorias && (
                            <div className="ml-4 border-l border-neutral-200">
                              {subitem.subcategorias.map((subcategoria: any) => (
                                <Link
                                  key={subcategoria.name}
                                  href={subcategoria.href}
                                  className="block px-4 py-1 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-primary-600"
                                >
                                  {subcategoria.name}
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

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="p-2 text-neutral-900 hover:text-primary-600 transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-neutral-900 hover:text-primary-600 transition-colors">
                  <User className="w-5 h-5" />
                  {isAdmin && (
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">Admin</span>
                  )}
                </button>

                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {isAdmin ? (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        Panel Admin
                      </Link>
                    ) : (
                      <Link href="/dashboard-usuario" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                        Mi Cuenta
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-900 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed top-16 left-0 right-0 h-[calc(100vh-4rem)] bg-primary-350 lg:hidden z-[999] flex flex-col overflow-y-auto">
            {/* Top bar of mobile menu */}
            <div className="bg-primary-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isSubMenu && (
                  <button onClick={handleBackClick} className="p-2 text-white hover:text-primary-100">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="font-display text-xl font-bold">{currentMenuTitle}</h2>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white hover:text-primary-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Menu items */}
            <nav className="py-4">
              {currentMenuItems.map((item: any) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between px-6 py-3 text-neutral-900 hover:bg-primary-100 transition-colors"
                  onClick={() => handleMenuItemClick(item)}
                >
                  <span className="text-lg font-medium">{item.name}</span>
                  {(item.submenu || item.subcategorias) && <ArrowRight className="w-5 h-5 text-neutral-500" />}
                </Link>
              ))}
            </nav>
            {/* Removed the bottom section with "Conoce todas las pastas" and "Sin Conservantes" / "Frescura garantizada" */}
          </div>
        )}
      </div>
      <CartSidebar /> {/* Renderizar el CartSidebar aquí */}
    </header>
  )
}
