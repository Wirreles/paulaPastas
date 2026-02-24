import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata: Metadata = {
    title: "Política de Privacidad | Paula Pastas",
    description: "Política de privacidad y protección de datos de Paula Pastas.",
    robots: "noindex, follow",
}

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-neutral-500 mb-8">
                    <Link href="/" className="hover:text-primary-600 transition-colors">
                        Inicio
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-neutral-900 font-medium">Política de Privacidad</span>
                </nav>

                <article className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 sm:p-12 prose prose-neutral max-w-none">
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-8">
                        Política de Privacidad
                    </h1>

                    <section className="space-y-6 text-neutral-700">
                        <p>
                            En <strong>Paula Pastas</strong>, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la información personal que nos proporcionas cuando utilizas nuestro sitio web y realizas compras.
                        </p>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">1. Información que recopilamos</h2>
                            <p>
                                Recopilamos información necesaria para procesar tus pedidos y brindarte el mejor servicio posible, incluyendo:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Nombre y apellido.</li>
                                <li>Dirección de correo electrónico.</li>
                                <li>Número de teléfono/WhatsApp.</li>
                                <li>Dirección de entrega.</li>
                                <li>Información sobre tus pedidos y preferencias.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">2. Uso de la información</h2>
                            <p>Utilizamos tu información personal para:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Procesar y confirmar tus compras.</li>
                                <li>Coordinar los envíos y entregas a domicilio.</li>
                                <li>Comunicarnos contigo vía WhatsApp o email por cuestiones relacionadas con tu pedido.</li>
                                <li>Enviarte promociones y novedades (solo si has aceptado suscribirte).</li>
                                <li>Mejorar nuestros productos y servicios.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">3. Protección de tus datos</h2>
                            <p>
                                Implementamos medidas de seguridad para garantizar que tu información personal esté protegida. No vendemos, intercambiamos ni transferimos tus datos a terceros con fines comerciales. Tus datos solo son compartidos con proveedores de servicios necesarios para completar tu compra (como la pasarela de pago o el servicio de mensajería).
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">4. Pagos</h2>
                            <p>
                                Los pagos realizados a través de nuestra web se procesan mediante plataformas seguras como MercadoPago. Paula Pastas no almacena información de tus tarjetas de crédito o débito en nuestros servidores.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">5. Derechos del usuario</h2>
                            <p>
                                Tienes derecho a solicitar el acceso, rectificación o eliminación de tus datos personales de nuestra base de datos en cualquier momento. Puedes hacerlo contactándonos a través de nuestros canales oficiales.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">6. Modificaciones</h2>
                            <p>
                                Paula Pastas se reserva el derecho de actualizar esta Política de Privacidad. Cualquier cambio será publicado en esta misma sección.
                            </p>
                        </div>

                        <p className="mt-8 text-sm italic">
                            Última actualización: Febrero 2025.
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t border-neutral-200 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    )
}
