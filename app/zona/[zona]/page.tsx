import { notFound } from "next/navigation"
import { FirebaseService } from "@/lib/firebase-service"
import { MapPin, Clock, Truck } from "lucide-react"

interface ZonaPageProps {
  params: {
    zona: string
  }
}

async function getZona(slug: string) {
  try {
    return await FirebaseService.getZona(slug)
  } catch (error) {
    console.error("Error fetching zona:", error)
    return null
  }
}

export default async function ZonaPage({ params }: ZonaPageProps) {
  const { zona } = params
  const zonaData = await getZona(zona)

  if (!zonaData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-4">{zonaData.nombre}</h1>
          <p className="text-lg text-neutral-600">{zonaData.descripcion}</p>
        </div>

        {/* Información de entrega */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Costo de Envío</h3>
              <p className="text-2xl font-bold text-primary-600">
                {zonaData.costoEnvio === 0 ? "GRATIS" : `$${zonaData.costoEnvio}`}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tiempo de Entrega</h3>
              <p className="text-lg text-neutral-700">{zonaData.tiempoEntrega}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cobertura</h3>
              <p className="text-lg text-neutral-700">{zonaData.barrios.length} barrios</p>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Horarios de Entrega</h2>
          <div className="space-y-4">
            {zonaData.horarios.map((horario, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-b-0"
              >
                <span className="font-medium text-neutral-900">{horario.dia}</span>
                <span className="text-neutral-600">
                  {horario.desde} - {horario.hasta}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barrios */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Barrios que Cubrimos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {zonaData.barrios.map((barrio, index) => (
              <div key={index} className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span className="text-neutral-700">{barrio}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors">
            <Truck className="w-5 h-5 mr-2" />
            Hacer Pedido a {zonaData.nombre}
          </button>
        </div>
      </div>
    </div>
  )
}
