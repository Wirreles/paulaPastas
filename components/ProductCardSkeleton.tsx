// components/ProductCardSkeleton.tsx
export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full animate-pulse">
            {/* Imitamos la imagen h-64 */}
            <div className="h-64 bg-neutral-200" />

            <div className="p-4 flex flex-col flex-grow space-y-3">
                {/* Imitamos el título */}
                <div className="h-6 bg-neutral-200 rounded w-3/4" />

                {/* Imitamos la descripción (varias líneas) */}
                <div className="space-y-2">
                    <div className="h-4 bg-neutral-100 rounded" />
                    <div className="h-4 bg-neutral-100 rounded" />
                    <div className="h-4 bg-neutral-100 rounded w-5/6" />
                </div>

                {/* Precio y cantidad */}
                <div className="flex justify-between items-center mt-auto pt-4">
                    <div className="h-8 bg-neutral-200 rounded w-24" />
                    <div className="h-8 bg-neutral-100 rounded-full w-20" />
                </div>
            </div>

            {/* Botones inferiores */}
            <div className="p-4 pt-0 flex gap-2">
                <div className="h-10 bg-neutral-200 rounded-lg flex-1" />
                <div className="h-10 bg-neutral-200 rounded-lg w-10" />
            </div>
        </div>
    );
}