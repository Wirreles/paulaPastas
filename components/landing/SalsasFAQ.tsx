"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SalsasFAQ() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-neutral-900 mb-10">Preguntas Frecuentes</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold text-neutral-800 hover:text-primary-600">
              ¿Cuánto rinden las salsas?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              Nuestras salsas están pensadas para complementar perfectamente nuestras porciones de pasta. Generalmente,
              un frasco rinde para 2-3 porciones abundantes, dependiendo del gusto.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold text-neutral-800 hover:text-primary-600">
              ¿Cuánto duran en el freezer? ¿Y en la heladera?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              En la heladera, nuestras salsas se mantienen frescas por 3-4 días una vez abiertas. Si las congelas,
              pueden durar hasta 3 meses sin perder sus propiedades ni sabor. Asegúrate de descongelarlas lentamente en
              la heladera antes de calentar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-semibold text-neutral-800 hover:text-primary-600">
              ¿Vienen listas para usar o hay que calentarlas?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              ¡Vienen listas para usar! Solo necesitas calentarlas suavemente en una olla a fuego bajo o en el
              microondas hasta alcanzar la temperatura deseada. Son el complemento perfecto para tus pastas recién
              hechas.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
