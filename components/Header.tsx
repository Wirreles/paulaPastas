"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Importaciones atómicas para reducir el bundle size
import {
  Menu, X, ShoppingBag, User, ArrowLeft, ArrowRight
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { NAVIGATION_DATA, NavItem } from "@/lib/navigation.confing";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { totalItems, toggleCart } = useCart();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
    setMenuPath([]);
  }, [pathname]);

  // Bloqueo de scroll más eficiente
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Memorizamos el cálculo de los items para evitar re-renders costosos
  const currentMenuItems = useMemo(() => {
    let current: NavItem[] = NAVIGATION_DATA; // Usa el tipo NavItem que ya importas
    for (const segment of menuPath) {
      const parent = current.find((item) => item.id === segment);
      // @ts-ignore - Dependiendo de tu interfaz NavItem
      if (parent?.submenu) current = parent.submenu;
      // @ts-ignore
      else if (parent?.subcategorias) current = parent.subcategorias;
      else return [];
    }
    return current;
  }, [menuPath]);

  const isSubMenu = menuPath.length > 0;

  const handleMobileClick = (e: React.MouseEvent, item: any) => {
    if (item.submenu || item.subcategorias) {
      e.preventDefault();
      setMenuPath([...menuPath, item.id]);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary-350 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20 py-2">

          {/* Logo Optimizado: Contenedor con tamaño fijo para evitar Layout Shift */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 min-w-[150px]">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/pplog2.webp"
                alt="Paula Pastas Logo"
                fill
                priority
                sizes="(max-width: 640px) 40px, 48px"
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="font-display text-base sm:text-lg font-bold text-neutral-900 block">
                Paula Pastas
              </span>
              <p className="text-[10px] sm:text-xs text-neutral-600 uppercase tracking-tighter">
                Pastas Artesanales
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {NAVIGATION_DATA.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:bg-white/40 ${pathname === item.href ? "text-primary-800" : "text-neutral-900"
                    }`}
                >
                  {item.name}
                </Link>

                {item.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
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
                            <div className="bg-neutral-50/50 py-1">
                              {subitem.subcategorias.map((cat: any) => (
                                <Link
                                  key={cat.name}
                                  href={cat.href}
                                  className="block px-8 py-1.5 text-xs text-neutral-600 font-medium hover:text-primary-600 transition-colors"
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
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={toggleCart}
              aria-label="Ver carrito"
              className="p-2 relative hover:bg-white/50 rounded-full transition-all duration-200"
            >
              <ShoppingBag className="w-6 h-6 text-neutral-900" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard-usuario"}
                className="p-2 hover:bg-white/50 rounded-full transition-all"
              >
                <User className="w-6 h-6 text-neutral-900" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block px-5 py-2 rounded-full text-sm font-bold text-neutral-900 hover:bg-white/50 transition-all border border-transparent hover:border-white/20"
              >
                Entrar
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Solo se renderiza si está abierto para mejorar performance */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-[999] lg:hidden flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-neutral-900 text-white p-4 flex items-center">
            {isSubMenu && (
              <button
                onClick={() => setMenuPath(prev => prev.slice(0, -1))}
                className="mr-4 p-1 active:scale-90 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-bold uppercase tracking-widest text-xs">
              {isSubMenu ? "Volver" : "Menú Principal"}
            </h2>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain">
            {currentMenuItems.map((item: any) => (
              <Link
                key={item.id || item.name}
                href={item.href}
                onClick={(e) => handleMobileClick(e, item)}
                className="flex items-center justify-between px-6 py-5 border-b border-neutral-50 text-neutral-900 active:bg-neutral-100 transition-colors"
              >
                <span className="font-bold text-lg">{item.name}</span>
                {(item.submenu || item.subcategorias) && <ArrowRight className="w-5 h-5 text-neutral-400" />}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}