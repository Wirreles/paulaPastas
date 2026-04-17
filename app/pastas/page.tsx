"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { FirebaseService } from "@/lib/firebase-service";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

const PRIORITY_COUNT = 1;
const DEFERRED_BATCH_SIZE = 6;

export default function PastasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deferredCount, setDeferredCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProductos = async () => {
      try {
        const data = await FirebaseService.getProductos();

        if (isMounted) {
          setProductos(data);
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProductos();

    return () => {
      isMounted = false;
    };
  }, []);

  // Progressive deferred loading: predictable setInterval batching
  useEffect(() => {
    if (loading || productos.length <= PRIORITY_COUNT) return;

    const remaining = productos.length - PRIORITY_COUNT - deferredCount;
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setDeferredCount((prev) => {
        if (prev + DEFERRED_BATCH_SIZE >= productos.length - PRIORITY_COUNT) {
          clearInterval(interval);
          return productos.length - PRIORITY_COUNT;
        }
        return prev + DEFERRED_BATCH_SIZE;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [loading, productos.length, deferredCount]);

  // Split products into priority and deferred
  const priorityProducts = useMemo(
    () => productos.slice(0, PRIORITY_COUNT),
    [productos]
  );

  const deferredProducts = useMemo(
    () => productos.slice(PRIORITY_COUNT, PRIORITY_COUNT + deferredCount),
    [productos, deferredCount]
  );

  const totalDeferredTarget = productos.length - PRIORITY_COUNT;
  const pendingCount = totalDeferredTarget - deferredCount;

  // SEO estructurado
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pastas Artesanales en Rosario",
    description:
      "Comprá pastas artesanales caseras. Ravioles, sorrentinos, ñoquis y más con envío en Rosario.",
    url: "https://paulapastas.com/pastas",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* HERO OPTIMIZADO (LCP) */}
        <section className="relative h-[25vh] min-h-[200px] flex items-center justify-center">
          <Image
            src="/banners/banner-pastas.webp"
            alt="Pastas artesanales caseras en Rosario"
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Pastas Artesanales
            </h1>
            <p className="text-sm text-neutral-200 mt-2">
              Hechas todos los días con ingredientes frescos
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <section>
            <header className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-neutral-900">
                Todos nuestros productos
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Explorá nuestro catálogo completo de pastas
              </p>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : productos.length > 0 ? (
              <>
                {/* PRIORITY PRODUCT: First product - eager loaded */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {priorityProducts.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      priority={true}
                    />
                  ))}

                  {/* DEFERRED PRODUCTS: Lazy loaded in batches */}
                  {deferredProducts.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      priority={false}
                    />
                  ))}
                </div>

                {/* PENDING SKELETONS */}
                {pendingCount > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {Array.from({
                      length: Math.min(pendingCount, DEFERRED_BATCH_SIZE),
                    }).map((_, i) => (
                      <ProductCardSkeleton key={`pending-${i}`} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <span className="text-4xl">🍝</span>
                <h3 className="text-xl font-semibold mt-4">Próximamente</h3>
                <p className="text-neutral-600">
                  Estamos cargando nuestros productos
                </p>
              </div>
            )}
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <div className="bg-primary-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                ¿No sabés qué elegir?
              </h2>
              <p className="text-neutral-600 mb-6">
                Te ayudamos a elegir la mejor opción
              </p>
              <Link
                href="/delivery"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
              >
                Hacer Pedido
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}