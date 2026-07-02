// Transportadoras y cómo armar el link de rastreo de cada una.
// Para agregar otra: añade su id, nombre y la función `rastreo(guia)`.

export type TransportadoraDef = {
  id: string;
  nombre: string;
  /** Construye la URL pública de rastreo a partir del número de guía. */
  rastreo?: (guia: string) => string;
};

export const TRANSPORTADORAS: TransportadoraDef[] = [
  {
    id: "coordinadora",
    nombre: "Coordinadora",
    rastreo: (g) =>
      `https://coordinadora.com/rastreo/rastreo-de-guia/?guia=${encodeURIComponent(g.trim())}`,
  },
  {
    id: "servientrega",
    nombre: "Servientrega",
    rastreo: (g) =>
      `https://www.servientrega.com/wps/portal/rastreo-envio?guia=${encodeURIComponent(g.trim())}`,
  },
  {
    id: "interrapidisimo",
    nombre: "Interrapidísimo",
    rastreo: (g) =>
      `https://interrapidisimo.com/sigue-tu-envio/?guia=${encodeURIComponent(g.trim())}`,
  },
  // "Otra": sin plantilla; en el panel se pega el link de rastreo a mano.
  { id: "otra", nombre: "Otra" },
];

export function transportadoraNombre(id: string): string {
  return TRANSPORTADORAS.find((t) => t.id === id)?.nombre ?? id;
}

/** Link de rastreo para una transportadora conocida + guía. */
export function urlRastreo(id: string, guia: string): string | undefined {
  const t = TRANSPORTADORAS.find((x) => x.id === id);
  if (!t?.rastreo || !guia.trim()) return undefined;
  return t.rastreo(guia);
}
