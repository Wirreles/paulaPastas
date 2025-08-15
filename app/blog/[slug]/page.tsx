import { notFound } from "next/navigation";
import { Metadata } from "next";
import { FirebaseService } from "@/lib/firebase-service";
import { BlogArticle } from "@/lib/types";
import { ImageWrapper } from "@/components/ui/ImageWrapper";
import { ProductPlaceholder } from "@/components/ui/ImagePlaceholder";

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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <article>
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-800`}>
            {article.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-sm text-neutral-500 mb-6 space-x-4">
          <span>Por {article.author}</span>
          <span>•</span>
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{article.readingTime} min lectura</span>
        </div>
        {article.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
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
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </main>
  );
}