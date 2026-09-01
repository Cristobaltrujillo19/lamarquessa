/**
 * Aviso de tratamiento de datos que se muestra junto al formulario de compra.
 *
 * Es DELIBERADAMENTE corto. El detalle —que se guarda aunque no se complete
 * el pedido, para que sirve, los 90 dias y como pedir el borrado— vive en la
 * pregunta "¿Que hacen con mis datos?" de /preguntas-frecuentes y en
 * /privacidad. Un parrafo largo en mitad del formulario no se lee, y un aviso
 * que no se lee no informa de nada.
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
 * debe conservar lo que se mostro en su momento. Y actualiza tambien la
 * pregunta de la FAQ, o el visitante autorizara una cosa y la pagina
 * explicara otra.
 */
export const TEXTO_AVISO_DATOS =
  "Al escribir tus datos autorizas su tratamiento conforme a nuestra " +
  "política de privacidad.";
