import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata: Metadata = {
    title: "Términos y Condiciones | Paula Pastas",
    description: "Términos y condiciones de compra de Paula Pastas – Producción artesanal.",
    robots: "noindex, follow",
}

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-neutral-500 mb-8">
                    <Link href="/" className="hover:text-primary-600 transition-colors">
                        Inicio
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-neutral-900 font-medium">Términos y Condiciones</span>
                </nav>

                <article className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 sm:p-12 prose prose-neutral max-w-none">
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                        Términos y Condiciones de Compra
                    </h1>
                    <p className="text-primary-600 font-medium mb-8">Paula Pastas – Producción artesanal</p>

                    <section className="space-y-6 text-neutral-700">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">1. Identificación del emprendimiento</h2>
                            <p>
                                Paula Pastas es un emprendimiento gastronómico artesanal dedicado a la elaboración de pastas frescas gourmet, producidas de manera casera y bajo pedido.
                            </p>
                            <p>
                                Al realizar una compra, el cliente reconoce que adquiere productos elaborados de forma artesanal y no industrial.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">2. Modalidad de compra</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Los pedidos se realizan exclusivamente a través de los canales oficiales informados en la web.</li>
                                <li>La compra se considera confirmada una vez recibido el pago.</li>
                                <li>Todos los productos se elaboran a pedido, garantizando frescura y calidad.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">3. Precios y formas de pago</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Todos los precios están expresados en pesos argentinos.</li>
                                <li>Los precios pueden modificarse sin previo aviso.</li>
                                <li>El valor del pedido queda congelado al momento del pago.</li>
                                <li>Métodos de pago disponibles: transferencia bancaria, efectivo, billeteras virtuales u otros medios informados al momento de la compra.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">4. Producción artesanal</h2>
                            <p>Los productos de Paula Pastas:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Son elaborados manualmente.</li>
                                <li>Pueden presentar variaciones mínimas de forma, peso o color propias del proceso artesanal.</li>
                                <li>No contienen conservantes ni aditivos artificiales.</li>
                            </ul>
                            <p>Estas características no se consideran fallas.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">5. Política de cambios, cancelaciones y devoluciones</h2>
                            <p>Due a la naturaleza alimenticia y perecedera de los productos:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>No se aceptan cambios ni devoluciones.</li>
                                <li>Todos los productos son cuidadosamente controlados antes de su entrega.</li>
                                <li>No obstante, si el cliente recibiera un producto incorrecto o con un inconveniente evidente al momento de la entrega, podrá informarlo dentro de las 2 horas posteriores a la recepción, adjuntando evidencia fotográfica, para su evaluación.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">6. Conservación y manipulación</h2>
                            <p>Una vez entregado el pedido, la correcta conservación del producto es responsabilidad del cliente.</p>
                            <p><strong>Recomendaciones:</strong></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Mantener refrigerado o congelado según indicaciones.</li>
                                <li>Respetar las instrucciones de cocción y conservación.</li>
                            </ul>
                            <p>Paula Pastas no se responsabiliza por daños derivados de una conservación inadecuada.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">7. Envíos y entregas</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Los envíos pueden realizarse mediante servicios de mensajería o retiro por el domicilio de producción.</li>
                                <li>El costo y responsabilidad del envío corren por cuenta del cliente, salvo indicación contraria.</li>
                                <li>Paula Pastas no se responsabiliza por demoras, daños o pérdidas ocasionadas por el servicio de mensajería.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">8. Alergias e intolerancias alimentarias</h2>
                            <p>Los productos pueden contener o haber estado en contacto con:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Gluten</li>
                                <li>Lácteos</li>
                                <li>Huevos</li>
                                <li>Frutos secos</li>
                            </ul>
                            <p>Si el cliente posee alergias o intolerancias alimentarias, deberá consultarlo antes de realizar la compra.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">9. Pedidos especiales y personalizados</h2>
                            <p>Se consideran pedidos especiales aquellos que incluyen:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Formas personalizadas o temáticas.</li>
                                <li>Sabores fuera de carta.</li>
                                <li>Producciones para eventos.</li>
                                <li>Cantidades superiores al volumen habitual.</li>
                                <li>Fechas específicas de entrega.</li>
                            </ul>
                            <div className="mt-4 space-y-4">
                                <p><strong>9.1 Confirmación:</strong> Los pedidos especiales requieren confirmación previa y disponibilidad de agenda. Solo se consideran confirmados una vez abonado el pago total o la seña acordada.</p>
                                <p><strong>9.2 Anticipación mínima:</strong> Deben realizarse con un mínimo de 72 horas de anticipación. En fechas de alta demanda, los plazos pueden extenderse.</p>
                                <p><strong>9.3 Señales y cancelaciones:</strong> Pueden requerir una seña del 50% para su reserva. La seña no es reembolsable en caso de cancelación por parte del cliente.</p>
                                <p><strong>9.4 Modificaciones:</strong> Las modificaciones podrán realizarse hasta 48 horas antes de la entrega. Luego de ese plazo no se garantizan cambios.</p>
                                <p><strong>9.5 Naturaleza artesanal:</strong> Al tratarse de productos elaborados manualmente, las formas pueden presentar ligeras variaciones y los colores pueden diferir levemente según ingredientes naturales. Estas características no constituyen defectos.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">10. Responsabilidad sobre fechas de entrega</h2>
                            <p>Paula Pastas garantiza la entrega en la fecha acordada dentro de la franja horaria informada. No se responsabiliza por demoras ocasionadas por servicios de mensajería, condiciones climáticas, cortes de energía o situaciones de fuerza mayor.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">11. Aceptación de los términos</h2>
                            <p>Al realizar una compra, el cliente declara haber leído y aceptado los presentes Términos y Condiciones.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">12. Modificaciones</h2>
                            <p>Paula Pastas se reserva el derecho de modificar estos términos en cualquier momento, sin previo aviso.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">13. Compras mayoristas y reventa</h2>
                            <p>Se consideran compras mayoristas aquellos pedidos destinados a reventa, eventos, comercios o consumo institucional.</p>
                            <div className="mt-4 space-y-4">
                                <p><strong>13.1 Condiciones generales:</strong> Sujeto a disponibilidad de producción. Requiere coordinación previa.</p>
                                <p><strong>13.2 Cantidades mínimas:</strong> El pedido mínimo será informado al momento de la consulta.</p>
                                <p><strong>13.3 Confirmación y pagos:</strong> Requieren pago total anticipado o seña acordada.</p>
                                <p><strong>13.4 Tiempos de producción:</strong> Los plazos serán informados al momento de la compra.</p>
                                <p><strong>13.5 Conservación:</strong> La cadena de frío es responsabilidad del comprador una vez entregado.</p>
                                <p><strong>13.6 Uso de marca:</strong> Queda prohibido el uso de la identidad visual sin autorización previa.</p>
                                <p><strong>13.7 Reventa con autorización:</strong> Deberán cumplir condiciones obligatorias como no modificar el producto y mantener la cadena de frío.</p>
                            </div>
                        </div>
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
