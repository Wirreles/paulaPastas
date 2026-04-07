"use client";

import { memo } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function CartButtonComponent() {
    const { totalItems, toggleCart } = useCart();

    return (
        <button
            onClick={toggleCart}
            aria-label="Ver carrito"
            className="p-2 relative hover:bg-white/50 rounded-full transition"
        >
            <ShoppingBag className="w-6 h-6 text-neutral-900" />

            {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                </span>
            )}
        </button>
    );
}

export default memo(CartButtonComponent);