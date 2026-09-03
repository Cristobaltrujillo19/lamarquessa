/**
 * Consentimiento de cookies — modelo INFORMATIVO, no opt-in.
 *
 * Decisión del dueño (3 de septiembre de 2026): el mercado es Colombia, donde
 * la Ley 1581 no exige consentimiento PREVIO para cookies analíticas como sí
 * hace el RGPD europeo. Se informa, se ofrece rechazar, y la analítica corre
 * por defecto. Un opt-in estricto costaría entre el 20% y el 50% de los datos
 * sin obligación legal que lo respalde aquí.
 *
 * ⚠️ Si algún día se vende de forma habitual a Europa, esto hay que cambiarlo
 * a opt-in: el RGPD se aplica por la ubicación del visitante, no la del
 * negocio.
 */

/** Dónde se guarda la decisión. Cambiar la clave equivale a volver a
 *  preguntarle a todo el mundo. */
export const CLAVE_COOKIES = "lm_cookies_v1";

export type DecisionCookies = "aceptado" | "rechazado";

/** El texto que se le enseña a la persona. Vive aquí y no en el componente
 *  porque la política de privacidad tiene que poder decir lo mismo, igual que
 *  pasa con el aviso de datos del checkout en `lib/consentimiento.ts`. */
export const TEXTO_COOKIES =
  "Usamos cookies propias y de terceros para entender cómo se usa la tienda y mejorarla. No las usamos para identificarte personalmente.";

/** Lee la decisión guardada. `null` = todavía no ha decidido.
 *
 *  Falla a `null` en silencio si el navegador bloquea el almacenamiento
 *  (modo privado, ajustes estrictos): en ese caso se vuelve a preguntar, que
 *  es preferible a romper la página por un banner. */
export function leerDecision(): DecisionCookies | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CLAVE_COOKIES);
    return v === "aceptado" || v === "rechazado" ? v : null;
  } catch {
    return null;
  }
}

export function guardarDecision(d: DecisionCookies): void {
  try {
    window.localStorage.setItem(CLAVE_COOKIES, d);
  } catch {
    // Sin almacenamiento no se puede recordar. Se respeta la decisión en esta
    // visita y se volverá a preguntar en la siguiente.
  }
}

/**
 * Aplica la decisión a los dos proveedores que ya están cargados.
 *
 * GA4 usa Consent Mode: `analytics_storage` y `ad_storage`. Meta usa su propio
 * `fbq('consent', ...)`. Los dos aceptan que se les revoque DESPUÉS de haber
 * cargado, que es justo lo que hace falta en un modelo informativo: arrancan
 * concedidos y se apagan si la persona lo pide.
 */
export function aplicarDecision(d: DecisionCookies): void {
  if (typeof window === "undefined") return;
  const concedido = d === "aceptado" ? "granted" : "denied";

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  // ⚠️ `arguments` y no un array: gtag.js reconoce las entradas del dataLayer
  // con forma de `Arguments`. Es la misma trampa que costó tiempo el 2 de
  // septiembre con `Ga4PageViews` (§15 del ESTADO).
  if (typeof w.gtag !== "function") {
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  }
  w.gtag("consent", "update", {
    analytics_storage: concedido,
    ad_storage: concedido,
    ad_user_data: concedido,
    ad_personalization: concedido,
  });

  // Meta no encola: si el pixel no ha cargado, no hay a quién decírselo. Se
  // vuelve a aplicar al montar el banner, cuando ya lleva rato cargado.
  if (typeof w.fbq === "function") {
    w.fbq("consent", d === "aceptado" ? "grant" : "revoke");
  }
}
