"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderActions from "./HeaderActions";

// 🔥 MobileMenu lazy real
const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
  loading: () => null,
});

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState<string[]>([]);
  const pathname = usePathname();

  // 🔥 evita recreación innecesaria
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

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

          {/* SSR puro → mejor LCP */}
          <HeaderNav />

          <HeaderActions
            onMenuToggle={toggleMenu}
            isMenuOpen={isMenuOpen}
          />
        </div>
      </div>

      {/* 🔥 SOLO existe cuando se usa */}
      {isMenuOpen && (
        <MobileMenu
          menuPath={menuPath}
          setMenuPath={setMenuPath}
        />
      )}
    </header>
  );
}