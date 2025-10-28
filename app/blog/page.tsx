import type { Metadata } from "next";
import Link from "next/link";
import { ImageWrapper } from "@/components/ui/ImageWrapper";
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Heart,
  Clock,
  Users,
} from "lucide-react";
import { FirebaseService } from "@/lib/firebase-service";

export const metadata: Metadata = {
  title: "Blog de Paula Pastas | Recetas, Rituales y Secretos de Cocina",
  description:
    "Inspiración para transformar cada comida en un momento especial. Consejos, recetas, ideas y curiosidades para disfrutar la experiencia Paula Pastas.",
  keywords:
    "blog pastas, recetas caseras, cocina artesanal, consejos cocina, rituales gastronómicos, paula pastas blog, rosario",
  openGraph: {
    title: "Blog de Paula Pastas | Recetas y Secretos de Cocina",
    description:
      "Inspiración para transformar cada comida en un momento especial. Consejos, recetas e ideas para amantes de las pastas.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Blog de Paula Pastas - Recetas y secretos de cocina",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  alternates: {
    canonical: "https://paulapastas.com/blog",
  },
};

export default async function BlogPage() {
  // JSON-LD para datos estructurados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de Paula Pastas",
    description:
      "Recetas, rituales y secretos de cocina para amantes de las pastas",
    url: "https://paulapastas.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Paula Pastas",
      logo: {
        "@type": "ImageObject",
        url: "https://paulapastas.com/pplog2.png",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://paulapastas.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://paulapastas.com/blog",
        },
      ],
    },
  };

  // Obtener artículos del blog dinámicamente
  const articulos = await FirebaseService.getPublishedBlogArticles();

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "recetas":
        return "Recetas";
      case "lifestyle":
        return "Lifestyle";
      case "consejos":
        return "Consejos";
      case "cultura":
        return "Cultura";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "recetas":
        return "bg-red-100 text-red-800";
      case "lifestyle":
        return "bg-purple-100 text-purple-800";
      case "consejos":
        return "bg-green-100 text-green-800";
      case "cultura":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-neutral-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-neutral-500 hover:text-primary-600"
              >
                Inicio
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-900 font-medium">Blog</span>
            </nav>
          </div>
        </div>

        {/* 1. Banner Principal */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-b from-primary-50 to-primary-100">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=800&fit=crop')] bg-cover bg-center opacity-10"></div>
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="w-20 h-20 mx-auto bg-primary-200 rounded-full flex items-center justify-center mb-8">
              <BookOpen className="w-10 h-10 text-primary-700" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 leading-tight">
              Recetas, rituales y secretos de cocina para amantes de las pastas
            </h1>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed">
                Inspiración para transformar cada comida en un momento especial.
              </p>
              <p className="text-lg md:text-xl text-neutral-600 mt-4">
                Consejos, recetas, ideas y curiosidades para disfrutar la
                experiencia Paula Pastas.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Cards de Artículos */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nuestros Artículos
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Descubrí consejos, recetas y secretos para llevar tu experiencia
                culinaria al siguiente nivel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articulos.map((articulo) => (
                <article
                  key={articulo.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift group border border-neutral-200"
                >
                  <div className="relative h-48">
                    <ImageWrapper
                      src={articulo.featuredImage}
                      alt={`${articulo.title} - Blog Paula Pastas`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback="/placeholder.svg?height=192&width=400&text=Articulo"
                      placeholder={
                        <ProductPlaceholder className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      }
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(articulo.category)}`}
                      >
                        {getCategoryLabel(articulo.category)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{articulo.readingTime} min</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {articulo.title}
                    </h3>
                    <p className="text-neutral-600 mb-4 line-clamp-3 leading-relaxed">
                      {articulo.excerpt}
                    </p>

                    <Link
                      href={`/blog/${articulo.slug}`}
                      className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group/link"
                    >
                      Leer más
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Botón "Ver más artículos" */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center px-8 py-4 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors">
                Ver más artículos
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* 3. Newsletter */}
        <section className="py-16 bg-primary-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-12 shadow-lg">
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                ¿Querés recibir nuestros mejores consejos, rituales y recetas?
              </h2>
              <p className="text-lg text-neutral-700 mb-8">
                Suscribite al boletín gourmet
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <label htmlFor="email-newsletter-blog" className="sr-only">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email-newsletter-blog"
                  name="email"
                  placeholder="Correo electrónico"
                  required
                  className="flex-1 px-5 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 text-neutral-900"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-neutral-900 font-semibold rounded-lg border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center"
                >
                  Suscribirme
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </form>
              <p className="text-sm text-neutral-600 mt-4">
                Recibirás contenido exclusivo, recetas especiales y consejos de
                expertos.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Categorías destacadas */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Explora por categorías
              </h2>
              <p className="text-lg text-neutral-600">
                Encontrá el contenido que más te interesa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  nombre: "Recetas",
                  icono: ChefHat,
                  descripcion: "Platos paso a paso",
                },
                {
                  nombre: "Consejos",
                  icono: BookOpen,
                  descripcion: "Tips y trucos",
                },
                {
                  nombre: "Lifestyle",
                  icono: Heart,
                  descripcion: "Estilo de vida",
                },
                {
                  nombre: "Cultura",
                  icono: Users,
                  descripcion: "Historia y tradición",
                },
              ].map((categoria, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center hover-lift cursor-pointer border border-neutral-200"
                >
                  <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <categoria.icono className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2">
                    {categoria.nombre}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {categoria.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
