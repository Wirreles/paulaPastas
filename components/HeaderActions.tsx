"use client";

import { memo } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";

import CartButton from "./CartButton";
import { useAuth } from "@/lib/auth-context";

interface Props {
    onMenuToggle: () => void;
    isMenuOpen: boolean;
}

function HeaderActionsComponent({ onMenuToggle, isMenuOpen }: Props) {
    const { user, isAdmin } = useAuth();

    return (
        <div className="flex items-center space-x-1 sm:space-x-3">

            <CartButton />

            {user ? (
                <Link
                    href={isAdmin ? "/admin" : "/dashboard-usuario"}
                    className="p-2 hover:bg-white/50 rounded-full"
                >
                    <User className="w-6 h-6 text-neutral-900" />
                </Link>
            ) : (
                <Link
                    href="/login"
                    className="hidden sm:block px-5 py-2 rounded-full text-sm font-bold hover:bg-white/50"
                >
                    Entrar
                </Link>
            )}

            <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-white/50"
                aria-label="Menu"
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
    );
}

// 🔥 evita re-render innecesario
export default memo(HeaderActionsComponent);