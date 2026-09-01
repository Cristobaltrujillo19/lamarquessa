/**
 * Identificador de sesion del carrito.
 *
 * Es un aleatorio del navegador. NO identifica a una persona, no se cruza
 * con nada y no viaja a ningun tercero: solo sirve para que el mismo
 * visitante actualice su propia fila en vez de crear una nueva cada vez que
 * toca el carrito.
 *
 * Vive junto al carrito en localStorage, asi que si alguien borra sus datos
 * del navegador desaparecen los dos a la vez, que es lo coherente.
 */
const CLAVE = "lm_sesion_v1";

export function idDeSesion(): string {
  if (typeof window === "undefined") return "";
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return guardado;
    // randomUUID no existe en contextos no seguros ni en navegadores viejos.
    const nuevo =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLAVE, nuevo);
    return nuevo;
  } catch {
    // Modo privado o almacenamiento bloqueado: sin id, no se registra nada.
    // Preferible a inventar uno nuevo en cada carga y ensuciar el embudo.
    return "";
  }
}
