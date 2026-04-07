import Link from "next/link";
import Image from "next/image";

export default function HeaderLogo() {
    return (
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
    );
}