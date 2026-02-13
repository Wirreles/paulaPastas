"use client"

interface ProductFormImagenProps {
  imagePreview: string
  currentImageUrl?: string
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function ProductFormImagen({
  imagePreview,
  currentImageUrl,
  onImageChange,
}: ProductFormImagenProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">Imagen del Producto *</label>
      <div className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-neutral-500">
          💡 Formatos soportados: JPG, PNG, GIF. Tamaño máximo recomendado: 2MB
        </p>
      </div>

      {/* Preview de imagen */}
      {(imagePreview || currentImageUrl) && (
        <div className="mt-3">
          <p className="text-sm font-medium text-neutral-700 mb-2">Vista previa:</p>
          <img
            src={imagePreview || currentImageUrl || "/placeholder.svg"}
            alt="Preview"
            className="w-32 h-24 object-cover rounded-lg border border-neutral-200"
          />
        </div>
      )}
    </div>
  )
}
