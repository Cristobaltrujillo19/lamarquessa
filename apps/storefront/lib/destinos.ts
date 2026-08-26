/**
 * Ciudades a las que se ha enviado efectivamente al menos una pieza.
 * NUNCA se inventa una: prueba social sin nombres, pero verificable.
 *
 * Regla de exhibición: si hay menos de tres, el bloque no se renderiza.
 * Menos de tres ciudades no leen como red, leen como excepción.
 *
 * ⚠️ Hoy está vacío a propósito. En el panel hay pedidos con ciudad, pero
 * ninguno entregado todavía, y "enviado a" tiene que significar entregado.
 * Cuando haya al menos tres entregas confirmadas, se listan aquí a mano.
 */
export const DESTINOS: string[] = [];

export function getDestinos(): string[] {
  return DESTINOS;
}
