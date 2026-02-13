"use client"

import type { Producto } from "@/lib/types"

interface ProductFormSEOProps {
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  keywordInput: string
  onKeywordInputChange: (value: string) => void
  onChange: (field: keyof Producto, value: any) => void
  onKeywordAdd: () => void
  onKeywordRemove: (index: number) => void
}

export default function ProductFormSEO({
  seoTitle,
  seoDescription,
  seoKeywords,
  keywordInput,
  onKeywordInputChange,
  onChange,
  onKeywordAdd,
  onKeywordRemove,
}: ProductFormSEOProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Título SEO</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => onChange("seoTitle", e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Título optimizado para SEO"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción SEO</label>
          <textarea
            rows={2}
            value={seoDescription}
            onChange={(e) => onChange("seoDescription", e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Descripción para meta description"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-neutral-700 mb-1">Palabras Clave SEO</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => onKeywordInputChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                onKeywordAdd()
              }
            }}
            className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Agregar palabra clave..."
          />
          <button
            type="button"
            onClick={onKeywordAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {seoKeywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => onKeywordRemove(index)}
                className="ml-2 text-primary-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
