"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { FirebaseService } from "@/lib/firebase-service";
import ProductCard from "@/components/ProductCard";
import { getProductUrl } from "@/lib/product-url";

export default function PastasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ✅ SEO estructurado mejorado
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
      {/* ✅ JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* ✅ HERO OPTIMIZADO (LCP < 2.5s) */}
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
          {/* ✅ PRODUCTOS */}
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando productos...</p>
              </div>
            ) : productos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map((producto) => {
                  const productUrl = getProductUrl(producto);

                  return (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      productUrl={productUrl}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-4xl">🍝</span>
                <h3 className="text-xl font-semibold mt-4">
                  Próximamente
                </h3>
                <p className="text-neutral-600">
                  Estamos cargando nuestros productos
                </p>
              </div>
            )}
          </section>

          {/* ✅ CTA */}
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