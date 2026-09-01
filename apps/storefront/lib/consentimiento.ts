/**
 * Texto de la autorizacion para guardar datos de contacto.
 *
 * Vive aqui, y no junto a la casilla ni junto a la mutacion, porque los dos
 * lados TIENEN que decir exactamente lo mismo: lo que se le enseno a la
 * persona y lo que se archiva como prueba. Si se separan, la prueba deja de
 * probar nada.
 *
 * El Decreto 1377 pide que la autorizacion quede registrada de forma que se
 * pueda consultar despues; por eso se guarda el texto literal y la fecha,
 * no un simple `true`.
 */
export const TEXTO_CONSENTIMIENTO =
  "Autorizo a La Marquessa a guardar mis datos de contacto para escribirme " +
  "sobre este pedido si no lo completo.";
