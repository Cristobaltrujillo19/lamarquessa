// GENERADO. No editar a mano.
//
// Anchos disponibles de cada foto de producto, para que <Foto> arme un
// `srcset` que solo apunte a ficheros que EXISTEN. Sin este mapa habría que
// asumir que todas las fotos tienen las mismas tallas, y no es cierto: las
// fuentes van de 1083 a 1600 px de ancho, y no se generan reescalados hacia
// arriba porque no ahorran nada y se ven peor.
//
// El último número de cada lista es el ancho del original, que se sirve con
// su nombre sin sufijo. Los demás son ficheros `<nombre>-<ancho>.{jpg,avif}`.
//
// Para regenerar tras añadir fotos, ver el §16 del ESTADO.
export const ANCHOS_FOTO: Record<string, number[]> = {
  "/fotos/bolso-kruta-ambiente.jpg": [400, 800, 1086],
  "/fotos/bolso-kruta-en-uso-horizonte.jpg": [400, 800, 1086],
  "/fotos/bolso-kruta-en-uso.jpg": [400, 800, 1086],
  "/fotos/bolso-kruta-impresion-3d-angulo.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-kruta-impresion-3d-frente.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-mallorca-ambiente.jpg": [400, 800, 1083],
  "/fotos/bolso-mallorca-en-uso.jpg": [400, 800, 1086],
  "/fotos/bolso-mallorca-impresion-3d-angulo.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-mallorca-impresion-3d-frente.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-menorca-ambiente.jpg": [400, 800, 1200, 1472],
  "/fotos/bolso-menorca-en-uso.jpg": [400, 800, 1086],
  "/fotos/bolso-menorca-impresion-3d-angulo.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-menorca-impresion-3d-frente.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-montt-ambiente.jpg": [400, 800, 1122],
  "/fotos/bolso-montt-en-uso.jpg": [400, 800, 1086],
  "/fotos/bolso-montt-impresion-3d-angulo.jpg": [400, 800, 1200, 1600],
  "/fotos/bolso-montt-impresion-3d-frente.jpg": [400, 800, 1200, 1600],
  "/fotos/coleccion-la-marquessa-amanecer.jpg": [400, 800, 1200, 1600],
  "/fotos/coleccion-la-marquessa-caribe.jpg": [400, 800, 1200, 1600],
  "/fotos/editorial-amanecer-torso.jpg": [400, 800, 1086],
  "/fotos/editorial-bolsos-piscina.jpg": [400, 800, 1200, 1448],
  "/fotos/editorial-menorca-mallorca.jpg": [400, 800, 1086],
};
