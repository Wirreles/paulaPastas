"use client"

interface ProductFormIngredientesProps {
  ingredientes: string[]
  ingredienteInput: string
  onIngredienteInputChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

export default function ProductFormIngredientes({
  ingredientes,
  ingredienteInput,
  onIngredienteInputChange,
  onAdd,
  onRemove,
}: ProductFormIngredientesProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">Ingredientes</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={ingredienteInput}
          onChange={(e) => onIngredienteInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAdd()
            }
          }}
          className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Agregar ingrediente..."
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredientes.map((ingrediente, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
          >
            {ingrediente}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-2 text-neutral-500 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
