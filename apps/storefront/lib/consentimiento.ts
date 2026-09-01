/**
 * Aviso de tratamiento de datos que se muestra junto al formulario de compra.
 *
 * Vive aqui, y no junto al formulario ni junto a la mutacion, porque los dos
 * lados TIENEN que decir exactamente lo mismo: lo que se le enseno a la
 * persona y lo que se archiva como prueba. Si se separan, la prueba deja de
 * probar nada.
 *
 * POR QUE SE GUARDA EL TEXTO Y NO UN `true`: el Decreto 1377 pide que la
 * autorizacion quede registrada de forma que se pueda consultar despues. Un
 * booleano no dice QUE se autorizo. Si el aviso cambia, los registros viejos
 * conservan la version que esa persona vio de verdad.
 *
 * ⚠️ Si cambias este texto, NO edites los registros ya guardados: cada uno
 * debe conservar lo que se mostro en su momento.
 */
export const TEXTO_AVISO_DATOS =
  "Al escribir tus datos autorizas que los guardemos y los tratemos conforme " +
  "a nuestra política de privacidad, aunque no completes el pedido. Los " +
  "usamos solo para ayudarte a terminar tu compra y se eliminan a los 90 días.";
