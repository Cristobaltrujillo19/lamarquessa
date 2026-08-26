/**
 * Ultimas publicaciones de Instagram.
 *
 * NO se conectan solas. Instagram no permite leer un feed publico sin
 * credenciales, y las dos vias posibles tienen implicaciones que el dueno
 * tiene que decidir:
 *
 *   1. API Graph de Instagram (Meta). Exige cuenta Business o Creator
 *      vinculada a una pagina de Facebook, una app de Meta y un token de
 *      larga duracion que caduca cada 60 dias y hay que renovar. La lectura
 *      se hace EN BUILD, nunca desde el navegador: un token en el cliente
 *      queda expuesto a cualquiera que abra el inspector.
 *
 *   2. Un servicio de terceros (Behold, EmbedSocial, LightWidget...). Se
 *      resuelve en minutos, pero mete un script ajeno en el sitio y suele
 *      ser de pago.
 *
 * OJO CON LAS IMAGENES: las URL del CDN de Instagram CADUCAN. Guardar aqui
 * el enlace que devuelve la API produce fotos rotas en pocos dias. Hay que
 * descargarlas a /public/instagram y referenciarlas en local, que es lo
 * que espera el campo `imagen`.
 *
 * Mientras tanto, mismo criterio que testimonios y destinos: sin datos
 * reales la seccion entera no se renderiza en produccion.
 */

export type PostInstagram = {
  /** Enlace permanente a la publicacion. */
  url: string;
  /** Ruta LOCAL de la miniatura, ya descargada. Nunca una URL del CDN. */
  imagen: string;
  /** Descripcion para lector de pantalla: que se ve, no el pie del post. */
  alt: string;
  /** Fecha de publicacion en ISO (YYYY-MM-DD). Ordena el muro: la mas
   *  reciente primero. La API de Meta la devuelve como `timestamp`. */
  fecha: string;
};

/* ---------------------------------------------------------------------
   PUBLICACIONES QUE EL DUENO YA ELIGIO (2026-08-26), A LA ESPERA DE IMAGEN

   Estas siete son las que van al muro. NO se pueden activar todavia porque
   falta la miniatura de cada una en /public/instagram.

   Por que no se descargaron solas: Instagram no sirve el contenido de una
   publicacion sin sesion iniciada. Comprobado el 2026-08-26 contra la pagina
   del post y contra /embed/captioned/ — las dos devuelven un cascaron de
   ~614 KB de CSS y JS, con CERO URLs de imagen de contenido. Es control de
   acceso de Instagram, no un fallo nuestro, y no se rodea.

   Las dos marcadas CARRUSEL llevaban ?img_index=2 en el enlace que paso el
   dueno: de esas hay que tomar la SEGUNDA imagen del carrusel, no la primera.

     1. https://www.instagram.com/p/DceieuXT8QQ/
     2. https://www.instagram.com/p/Dcb0Oq-zoyQ/
     3. https://www.instagram.com/p/DcRjhMQTjRd/
     4. https://www.instagram.com/p/DcOUnAJuTrr/
     5. https://www.instagram.com/p/Db6yEZrDGH-/?img_index=2   CARRUSEL, imagen 2
     6. https://www.instagram.com/p/Db4EobPDAi_/?img_index=2   CARRUSEL, imagen 2
     7. https://www.instagram.com/p/DbE-MpUspAX/

   PARA ACTIVARLAS hacen falta dos cosas del dueno:
     a) Las siete imagenes en /public/instagram (el original que subio a
        Instagram vale mas que lo que Instagram devolveria: llega sin la
        recompresion de la plataforma).
     b) La fecha de cada publicacion, porque `recientesPrimero()` ordena por
        `fecha` y una fecha inventada cambiaria el orden del muro. Si no las
        hay, sirve confirmar que el orden de arriba ES el orden de exhibicion.

   El `alt` se escribe MIRANDO cada foto, no adivinando: un alt que describe
   algo que no esta en la imagen es peor que no tener alt, porque quien usa
   lector de pantalla no puede detectar el error.
   --------------------------------------------------------------------- */

/** Publicaciones reales. Vacio = la seccion no existe en produccion. */
export const POSTS: PostInstagram[] = [];

/** Cuantas muestra el muro como maximo. */
export const MAX_POSTS = 12;

/* Andamiaje solo para desarrollo. Usa fotos del propio proyecto porque el
   proyecto no admite stock ni imagenes generadas, y el alt las marca como
   pendientes para que nadie las confunda con publicaciones reales. */
const ANDAMIAJE_DEV: PostInstagram[] = [
  "/fotos/bolso-menorca-ambiente.jpg",
  "/fotos/bolso-mallorca-ambiente.jpg",
  "/fotos/bolso-kruta-ambiente.jpg",
  "/fotos/bolso-montt-ambiente.jpg",
  "/fotos/bolso-menorca-en-uso.jpg",
  "/fotos/bolso-mallorca-en-uso.jpg",
  "/fotos/bolso-kruta-en-uso.jpg",
  "/fotos/bolso-montt-en-uso.jpg",
  "/fotos/bolso-menorca-impresion-3d-frente.jpg",
  "/fotos/bolso-mallorca-impresion-3d-frente.jpg",
  "/fotos/bolso-kruta-impresion-3d-frente.jpg",
  "/fotos/bolso-montt-impresion-3d-frente.jpg",
].map((imagen, i) => ({
  url: "https://www.instagram.com/lamarquessa.co/",
  imagen,
  alt: `PUBLICACIÓN PENDIENTE ${i + 1}: aquí irá una foto real de Instagram`,
  // Fechas descendentes para que se note el orden en la maqueta.
  fecha: new Date(Date.now() - i * 6 * 864e5).toISOString().slice(0, 10),
}));

/** Mas reciente primero. El orden se impone aqui y no se confia al orden del
 *  arreglo: quien anada una publicacion a mano no tiene por que saber donde
 *  insertarla. */
function recientesPrimero(lista: PostInstagram[]): PostInstagram[] {
  return [...lista]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, MAX_POSTS);
}

export function getPosts(): PostInstagram[] {
  if (POSTS.length > 0) return recientesPrimero(POSTS);
  if (process.env.NODE_ENV === "development") return recientesPrimero(ANDAMIAJE_DEV);
  return [];
}
