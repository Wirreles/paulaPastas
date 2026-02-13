"use client"

import type { Producto } from "@/lib/types"

interface ProductFormCategoriaProps {
  categoria: string
  subcategoria: string
  onChange: (field: keyof Producto, value: any) => void
}

export default function ProductFormCategoria({
  categoria,
  subcategoria,
  onChange,
}: ProductFormCategoriaProps) {
  const requiresSubcategoria = !["salsas", "packs"].includes(categoria)

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
        <select
          required
          value={categoria}
          onChange={(e) => onChange("categoria", e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Seleccionar categoría</option>
          <option value="rellenas">Pastas Rellenas</option>
          <option value="sin-relleno">Sin Relleno</option>
          <option value="sin-tacc">Sin TACC</option>
          <option value="salsas">Salsas Caseras</option>
          <option value="packs">Packs y Combos</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Subcategoría {requiresSubcategoria ? "*" : ""}
        </label>
        <select
          required={requiresSubcategoria}
          value={subcategoria}
          onChange={(e) => onChange("subcategoria", e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={!categoria}
        >
          <option value="">Seleccionar subcategoría</option>
          {categoria === "rellenas" && (
            <>
              <option value="lasagna">Lasagna</option>
              <option value="ravioles">Ravioles</option>
              <option value="sorrentinos">Sorrentinos</option>
            </>
          )}
          {categoria === "sin-relleno" && (
            <>
              <option value="noquis">Ñoquis</option>
              <option value="fideos">Fideos</option>
            </>
          )}
          {categoria === "sin-tacc" && (
            <>
              <option value="ravioles">Ravioles Sin TACC</option>
              <option value="fideos">Fideos Sin TACC</option>
            </>
          )}
          {["salsas", "packs"].includes(categoria) && (
            <option value="">No requiere subcategoría</option>
          )}
        </select>
      </div>
    </div>
  )
}
