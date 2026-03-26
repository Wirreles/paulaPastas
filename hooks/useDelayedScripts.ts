"use client";

import { useEffect, useState } from "react";

export function useDelayedScripts(delayMs: number = 0) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Si el navegador está en modo "ahorro de datos", podríamos elegir no cargar nada
    // Pero para tracking general, procedemos con los eventos de interacción
    const loadScripts = () => {
      if (shouldLoad) return;
      
      // Añadimos un pequeño delay opcional para asegurar que el hilo principal esté libre
      setTimeout(() => {
        setShouldLoad(true);
      }, delayMs);

      // Limpieza: Removemos los listeners inmediatamente después de la primera interacción
      removeEventListeners();
    };

    const removeEventListeners = () => {
      window.removeEventListener("scroll", loadScripts);
      window.removeEventListener("mousemove", loadScripts);
      window.removeEventListener("touchstart", loadScripts);
      window.removeEventListener("keydown", loadScripts);
    };

    // Escuchamos las interacciones más comunes
    window.addEventListener("scroll", loadScripts, { passive: true });
    window.addEventListener("mousemove", loadScripts, { passive: true });
    window.addEventListener("touchstart", loadScripts, { passive: true });
    window.addEventListener("keydown", loadScripts, { passive: true });

    return () => removeEventListeners();
  }, [shouldLoad, delayMs]);

  return shouldLoad;
}