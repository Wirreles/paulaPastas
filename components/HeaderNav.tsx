"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_DATA } from "@/lib/navigation.confing";

export default function HeaderNav() {
    const pathname = usePathname();

    return (
        <nav className="hidden lg:flex items-center space-x-2">
            {NAVIGATION_DATA.map((item) => (
                <div key={item.id} className="relative group">
                    <Link
                        href={item.href}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-white/40 ${pathname === item.href ? "text-primary-800" : "text-neutral-900"
                            }`}
                    >
                        {item.name}
                    </Link>

                    {item.submenu && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="py-2">
                                {item.submenu.map((subitem: any) => (
                                    <div key={subitem.id}>
                                        <Link
                                            href={subitem.href}
                                            className="block px-4 py-2 text-sm font-bold hover:bg-primary-50"
                                        >
                                            {subitem.name}
                                        </Link>

                                        {subitem.subcategorias && (
                                            <div className="bg-neutral-50/50 py-1">
                                                {subitem.subcategorias.map((cat: any) => (
                                                    <Link
                                                        key={cat.name}
                                                        href={cat.href}
                                                        className="block px-8 py-1.5 text-xs text-neutral-600 hover:text-primary-600"
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
    );
}