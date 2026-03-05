// lib/product-url.ts

import { Producto } from "./types" // ajusta la ruta si tu interface está en otro lugar

type ProductUrlInput = Pick<Producto, "categoria" | "subcategoria" | "slug">

/**
 * Genera la URL correcta de un producto según su categoría.
 * Centraliza la lógica de rutas para evitar hardcodear paths en los componentes.
 */
export function getProductUrl(producto: ProductUrlInput): string {
    // Seguridad básica
    if (!producto?.slug) {
        return "/pastas"
    }

    const { categoria, subcategoria, slug } = producto

    // Caso especial: salsas
    if (categoria === "salsas") {
        return `/salsas/${slug}`
    }

    // Ruta estándar para pastas
    if (categoria && subcategoria) {
        return `/pastas/${categoria}/${subcategoria}/${slug}`
    }

    // Fallback si faltara subcategoría
    if (categoria) {
        return `/pastas/${categoria}/${slug}`
    }

    // Último fallback de seguridad
    return `/pastas/${slug}`
}

/**
 * Genera la URL absoluta del producto (útil para SEO, OpenGraph, sitemap, etc).
 */
export function getProductCanonicalUrl(
    producto: ProductUrlInput,
    baseUrl = "https://paulapastas.com"
): string {
    return `${baseUrl}${getProductUrl(producto)}`
}