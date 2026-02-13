"use client"

interface DetalleSection {
  titulo: string
  texto: string
}

interface ProductFormDetallesProps {
  comoPreparar: DetalleSection
  historiaPlato: DetalleSection
  onNestedChange: (section: 'comoPreparar' | 'historiaPlato', field: 'titulo' | 'texto', value: string) => void
}

export default function ProductFormDetalles({
  comoPreparar,
  historiaPlato,
  onNestedChange,
}: ProductFormDetallesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sección: Cómo se prepara */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-neutral-800">Cómo se prepara</h4>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Título de la sección</label>
          <input
            type="text"
            value={comoPreparar.titulo}
            onChange={(e) => onNestedChange("comoPreparar", "titulo", e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: Cómo preparar este plato"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Instrucciones de preparación</label>
          <textarea
            rows={4}
            value={comoPreparar.texto}
            onChange={(e) => onNestedChange("comoPreparar", "texto", e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder={"Paso 1: Hervir agua con sal...\nPaso 2: Cocinar la pasta...\nPaso 3: Servir caliente..."}
          />
          <p className="text-xs text-neutral-500 mt-1">
            💡 Usa Enter para separar pasos. El formato se respetará al mostrar el producto.
          </p>
        </div>
      </div>

      {/* Sección: Historia del plato */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-neutral-800">Historia del plato</h4>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Título de la sección</label>
          <input
            type="text"
            value={historiaPlato.titulo}
            onChange={(e) => onNestedChange("historiaPlato", "titulo", e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: Historia y origen de este plato"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Historia y origen</label>
          <textarea
            rows={4}
            value={historiaPlato.texto}
            onChange={(e) => onNestedChange("historiaPlato", "texto", e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder={"Este plato tiene sus orígenes en...\nLa tradición cuenta que...\nHoy en día se prepara..."}
          />
          <p className="text-xs text-neutral-500 mt-1">
            💡 Usa Enter para crear párrafos. El formato se respetará al mostrar el producto.
          </p>
        </div>
      </div>
    </div>
  )
}
