"use client"

interface FAQItem {
  pregunta: string
  respuesta: string
}

interface ProductFormFAQProps {
  preguntasFrecuentes: FAQItem[]
  faqPregunta: string
  faqRespuesta: string
  onPreguntaChange: (value: string) => void
  onRespuestaChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

export default function ProductFormFAQ({
  preguntasFrecuentes,
  faqPregunta,
  faqRespuesta,
  onPreguntaChange,
  onRespuestaChange,
  onAdd,
  onRemove,
}: ProductFormFAQProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Pregunta</label>
          <input
            type="text"
            value={faqPregunta}
            onChange={(e) => onPreguntaChange(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: ¿Cuánto tiempo tarda en cocinarse?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Respuesta</label>
          <textarea
            rows={3}
            value={faqRespuesta}
            onChange={(e) => onRespuestaChange(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder="Respuesta a la pregunta..."
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onAdd}
          disabled={!faqPregunta.trim() || !faqRespuesta.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Agregar Pregunta Frecuente
        </button>
      </div>

      {/* Lista de FAQs existentes */}
      {preguntasFrecuentes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-neutral-800">Preguntas agregadas:</h4>
          {preguntasFrecuentes.map((faq, index) => (
            <div key={index} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-neutral-900">Pregunta {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  × Eliminar
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-neutral-700">Pregunta:</span>
                  <p className="text-sm text-neutral-600 mt-1">{faq.pregunta}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-700">Respuesta:</span>
                  <p className="text-sm text-neutral-600 mt-1 whitespace-pre-line">{faq.respuesta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
