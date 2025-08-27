import { notFound } from "next/navigation";
import { Metadata } from "next";
import { FirebaseService } from "@/lib/firebase-service";
import { BlogArticle } from "@/lib/types";
import { ImageWrapper } from "@/components/ui/ImageWrapper";
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder";
import { BlogContent } from "@/components/ui/BlogContent";

type Props = {
  params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await FirebaseService.getBlogArticleBySlug(params.slug);
  if (!article) return {};
  let publishedTime: string | undefined = undefined;
  if (article.publishedAt) {
    const d = new Date(article.publishedAt);
    if (!isNaN(d.getTime())) {
      publishedTime = d.toISOString();
    }
  }
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    keywords: article.seoKeywords || [],
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : [],
      type: "article",
      publishedTime,
      authors: [article.author],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const article: BlogArticle | null = await FirebaseService.getBlogArticleBySlug(params.slug);
  if (!article || !article.isPublished) return notFound();

  // Formatea la fecha
  let formattedDate = "Sin fecha";
  if (article.publishedAt) {
    const d = new Date(article.publishedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-neutral-500 hover:text-primary-600">
              Inicio
            </a>
            <span className="text-neutral-400">/</span>
            <a href="/blog" className="text-neutral-500 hover:text-primary-600">
              Blog
            </a>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-900 font-medium">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header del artículo */}
          <header className="mb-8">
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase ${
                article.category === 'recetas' ? 'bg-red-100 text-red-800' :
                article.category === 'lifestyle' ? 'bg-purple-100 text-purple-800' :
                article.category === 'consejos' ? 'bg-green-100 text-green-800' :
                article.category === 'cultura' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {article.category === 'recetas' ? 'Recetas' :
                 article.category === 'lifestyle' ? 'Lifestyle' :
                 article.category === 'consejos' ? 'Consejos' :
                 article.category === 'cultura' ? 'Cultura' :
                 article.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-neutral-500 mb-6 space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                Por {article.author}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.readingTime} min lectura
              </span>
            </div>
            
            {article.excerpt && (
              <div className="bg-neutral-50 border-l-4 border-primary-300 pl-6 py-4 rounded-r-lg">
                <p className="text-lg text-neutral-700 italic leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            )}
          </header>
        {article.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <ImageWrapper
              src={article.featuredImage}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
              priority={true}
              fallback="/placeholder.svg?height=400&width=800&text=Articulo"
              placeholder={<ProductPlaceholder className="w-full h-auto object-cover" />}
            />
          </div>
        )}
        
        {/* Contenido del artículo */}
        <div className="border-t border-neutral-200 pt-8">
          <BlogContent 
            content={article.content}
            className="mt-8"
          />
        </div>
        
        {/* Footer del artículo */}
        <footer className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-neutral-500">
            <div className="flex items-center space-x-4">
              <span>Compartir:</span>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.107-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              <span>Artículo de {article.category}</span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  </main>
  );
}