import { Producto } from "./types"

type ProductUrlInput = Pick<Producto, "categoria" | "subcategoria" | "slug">

export function getProductUrl(producto: ProductUrlInput): string {

    if (!producto?.slug) {
        return "/pastas"
    }

    const { categoria, subcategoria, slug } = producto

    // Caso especial: salsas (fuera de /pastas)
    if (categoria === "salsas") {
        return `/salsas/${slug}`
    }

    // Ruta estándar (SIEMPRE con subcategoría)
    if (categoria && subcategoria) {
        return `/pastas/${categoria}/${subcategoria}/${slug}`
    }

    // Fallbacks defensivos (por si falta data)
    if (categoria) {
        return `/pastas/${categoria}`
    }

    return `/pastas/${slug}`
}

export function getProductCanonicalUrl(
    producto: ProductUrlInput,
    baseUrl = "https://paulapastas.com"
): string {
    return `${baseUrl}${getProductUrl(producto)}`
}

export function getCategoryUrl(categoria: string): string {
    if (categoria === "salsas") {
        return "/salsas"
    }
    return `/pastas/${categoria}`
}

export function getSubcategoryUrl(categoria: string, subcategoria: string): string | null {

    if (categoria === "salsas") {
        return null
    }

    return `/pastas/${categoria}/${subcategoria}`
}