/**
 * Datos de marca que solo el dueno puede confirmar.
 * `null` significa "aun no hay dato": la interfaz oculta el elemento en vez
 * de mostrar una aproximacion. Sin "mas de", sin cifra inventada.
 *
 * Portado de LM_MOCKUP/data/marca.ts. SIGUIENTE_SERIE no viaja: la
 * numeracion de piezas vive en el campo `serie` del catalogo de Convex y
 * sigue sin pintarse mientras no se decida desde que numero arranca.
 */

/** Piezas efectivamente entregadas. Lo confirma el dueno contando pedidos
 *  entregados, no pedidos hechos. Mientras sea null, el contador de la
 *  prueba social no se renderiza. */
export const PIEZAS_ENTREGADAS: number | null = null;

/**
 * Convierte un entero pequeno (1-999) a su forma en palabras, con mayuscula
 * inicial. Es solo para el contador de la home; fuera de ese rango devuelve
 * la cifra sin adornos. Una cifra pequena se lee pequena, la palabra se lee
 * deliberada.
 */
export function numeroEnPalabras(n: number): string {
  if (!Number.isInteger(n) || n < 0) return String(n);
  if (n === 0) return "Cero";
  if (n > 999) return String(n);

  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis",
    "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro",
    "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
  ];
  const decenas = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const centenas = [
    "", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos",
  ];

  const decir = (m: number): string => {
    if (m < 30) return unidades[m];
    if (m < 100) {
      const d = Math.floor(m / 10), u = m % 10;
      return u === 0 ? decenas[d] : `${decenas[d]} y ${unidades[u]}`;
    }
    if (m === 100) return "cien";
    const c = Math.floor(m / 100), resto = m % 100;
    return resto === 0 ? centenas[c] : `${centenas[c]} ${decir(resto)}`;
  };

  const palabra = decir(n);
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}
