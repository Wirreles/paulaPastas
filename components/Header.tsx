"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import HeaderLogo from "./HeaderLogo";
const HeaderNav = dynamic(() => import("./HeaderNav"), {
  ssr: true, // importante para SEO
});
import HeaderActions from "./HeaderActions";

// 🔥 MobileMenu lazy (clave)
const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
  loading: () => null, // nada → no bloquea render
});

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
    setMenuPath([]);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-primary-350 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20 py-2">

          <HeaderLogo />

          {/* 👇 opcional lazy si querés ultra optimización */}
          <HeaderNav />

          <HeaderActions
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            isMenuOpen={isMenuOpen}
          />
        </div>
      </div>

      {/* 🔥 SOLO monta cuando se abre */}
      {isMenuOpen && (
        <MobileMenu
          menuPath={menuPath}
          setMenuPath={setMenuPath}
        />
      )}
    </header>
  );
}