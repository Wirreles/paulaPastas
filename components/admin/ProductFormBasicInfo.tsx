"use client"

import type { Producto } from "@/lib/types"

interface ProductFormBasicInfoProps {
  nombre: string
  slug: string
  descripcion: string
  descripcionAcortada: string
  precio: number
  porciones: number
  disponible: boolean
  destacado: boolean
  onChange: (field: keyof Producto, value: any) => void
}

export default function ProductFormBasicInfo({
  nombre,
  slug,
  descripcion,
  descripcionAcortada,
  precio,
  porciones,
  disponible,
  destacado,
  onChange,
}: ProductFormBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre del Producto *</label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Ej: Ravioles de Carne"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (URL) *</label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => onChange("slug", e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="ravioles-de-carne"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción *</label>
        <textarea
          required
          rows={4}
          value={descripcion}
          onChange={(e) => onChange("descripcion", e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          placeholder={"Descripción del producto...\nPuedes usar Enter para crear párrafos\ny respetar la ortografía..."}
        />
        <p className="text-xs text-neutral-500 mt-1">
          💡 Usa Enter para crear párrafos. El formato se respetará al mostrar el producto.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción Acortada</label>
        <textarea
          rows={2}
          value={descripcionAcortada}
          onChange={(e) => onChange("descripcionAcortada", e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Descripción breve del producto para mostrar en listas o resúmenes..."
        />
        <p className="text-xs text-neutral-500 mt-1">
          💡 Descripción más corta para mostrar en cards o listas de productos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Precio *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={precio}
            onChange={(e) => onChange("precio", Number.parseFloat(e.target.value))}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Porciones</label>
          <input
            type="number"
            min="1"
            value={porciones}
            onChange={(e) => onChange("porciones", Number.parseInt(e.target.value))}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={disponible}
            onChange={(e) => onChange("disponible", e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-neutral-700">Disponible</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => onChange("destacado", e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-neutral-700">Destacado</span>
        </label>
      </div>
    </div>
  )
}
