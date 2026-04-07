"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NAVIGATION_DATA, NavItem } from "@/lib/navigation.confing";

interface Props {
    menuPath: string[];
    setMenuPath: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function MobileMenu({ menuPath, setMenuPath }: Props) {

    const currentMenuItems = useMemo(() => {
        let current: NavItem[] = NAVIGATION_DATA;

        for (const segment of menuPath) {
            const parent = current.find((item) => item.id === segment);
            // @ts-ignore
            if (parent?.submenu) current = parent.submenu;
            // @ts-ignore
            else if (parent?.subcategorias) current = parent.subcategorias;
            else return [];
        }

        return current;
    }, [menuPath]);

    const isSubMenu = menuPath.length > 0;

    const handleClick = (e: any, item: any) => {
        if (item.submenu || item.subcategorias) {
            e.preventDefault();
            setMenuPath((prev) => [...prev, item.id]);
        }
    };

    return (
        <div className="fixed inset-0 top-16 bg-white z-[999] lg:hidden flex flex-col animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="bg-neutral-900 text-white p-4 flex items-center">
                {isSubMenu && (
                    <button
                        onClick={() => setMenuPath((prev) => prev.slice(0, -1))}
                        className="mr-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <h2 className="font-bold uppercase text-xs">
                    {isSubMenu ? "Volver" : "Menú"}
                </h2>
            </div>

            {/* Items */}
            <nav className="flex-1 overflow-y-auto">
                {currentMenuItems.map((item: any) => (
                    <Link
                        key={item.id || item.name}
                        href={item.href}
                        onClick={(e) => handleClick(e, item)}
                        className="flex items-center justify-between px-6 py-5 border-b text-neutral-900"
                    >
                        <span className="font-bold text-lg">{item.name}</span>

                        {(item.submenu || item.subcategorias) && (
                            <ArrowRight className="w-5 h-5 text-neutral-400" />
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );
}