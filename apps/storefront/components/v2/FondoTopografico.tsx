"use client";

import { useEffect, useRef } from "react";
import { VERT, FRAG } from "./topografia-shader";

/**
 * Curvas de nivel en movimiento. El patrón no es una textura que se
 * desplaza: se REGENERA cada frame con ruido fractal deformado sobre sí
 * mismo (domain warping), que es lo que hace que los lazos se abran, se
 * cierren y se arrastren en vez de solo viajar. Es el mecanismo del GIF
 * de referencia.
 *
 * Por qué shader y no SVG: animar feTurbulence obliga al navegador a
 * recalcular el filtro sobre todo el viewport en cada frame, en CPU.
 * En GPU el mismo cálculo es gratis.
 *
 * Presupuesto de rendimiento, deliberado:
 *   - Buffer a media resolución. El patrón es difuso; nadie ve el reescalado.
 *   - DPR fijo a 1. Es una textura de fondo, no un mapa.
 *   - 30 fps. El movimiento es lento; 60 no aporta y dobla el coste.
 *   - Se detiene con la pestaña oculta y con prefers-reduced-motion.
 *
 * Los colores NO viven aquí: se leen de los tokens de globals.css y entran
 * como uniforms, para que el sistema de color siga teniendo una sola fuente.
 * Si no hay WebGL2, la clase --estatico devuelve la versión SVG enmascarada.
 */

/** Resolución del buffer respecto al viewport. Tiene DOS efectos, y el
 *  segundo es el que importa aquí:
 *
 *  1. Coste. Medido a 30fps: 0.5 = 0.52ms/frame (1.6% del presupuesto),
 *     0.75 = 0.88ms (2.6%), 1.0 = 1.60ms (4.8%). Bajarlo sale gratis.
 *  2. Nitidez. Bajarlo NO es una buena forma de difuminar, aunque lo
 *     parezca: a 0.4 aparecían parches moteados donde las curvas se
 *     apiñan, porque no había píxeles para representarlas. El difuminado
 *     se pone con el blur CSS de .fondo-topo, que es gaussiano de verdad
 *     y no degrada el muestreo. Este dial se queda donde el dibujo está
 *     bien resuelto. */
const ESCALA_BUFFER = 0.75;
const FPS = 30;
/** Multiplicador global del tiempo.
 *
 *  Medido sobre el canvas real (buffer 1440px) por desplazamiento de las
 *  líneas, que es lo que el ojo percibe:
 *  NO existe un "px por segundo" que valga aquí: la correlación cruzada
 *  siempre da su pico en desplazamiento 0 porque el patrón no se traslada,
 *  se DEFORMA en el sitio. Gasté varias rondas midiendo desplazamiento
 *  antes de darme cuenta.
 *
 *  El único método fiable que encontré: capturar el mismo recorte en t=0
 *  y en t=VELOCIDAD (un segundo de animación) y compararlos a ojo.
 *
 *  Con GROSOR 6 y blur 9px, medido así:
 *      0.45 → el dibujo cambia con claridad y sin agitar.  ← aquí
 *      0.75 → algo más vivo.
 *      2.0  → reorganiza la topografía entera: demasiado.
 *  Un aviso: el suelo de percepción depende del GROSOR. Con líneas finas,
 *  0.6 se veía congelado; con formas anchas, 0.45 se lee bien. Si alguien
 *  adelgaza las curvas, hay que revisar esta velocidad. */
const VELOCIDAD = 0.45;
/** Alfa máximo de las líneas sobre --crema. El bronce tiene mucha menos
 *  distancia de luminancia contra el crema que los tonos marinos, así que
 *  necesita más alfa para la misma presencia visual.
 *
 *  Una textura necesita rondar 1.8:1 contra el fondo para leerse. A 0.30
 *  con --cobre medía 1.31:1 y era invisible en pantalla, aunque en una
 *  captura recortada y ampliada pareciera evidente. Las capturas exageran
 *  el contraste: no sirven para decidir esto.
 *
 *  El umbral de 1.8:1 vale para líneas FINAS. Una banda ancha y difusa se
 *  percibe con menos contraste, así que 1.57:1 se sigue leyendo.
 *
 *  Medido con --profundo #1E6E70:
 *      0.38 → 1.77:1, superficie a 110.4°
 *      0.46 → 2.02:1, superficie a 112.5°   ← aquí
 *      0.54 → 2.32:1, superficie a 114.6°
 *
 *  El crema puro está en 100.9°. Al revés que todos los bronces que
 *  probamos, este verde-marino EMPUJA el tono por encima del crema en vez
 *  de hundirlo hacia el amarillo: refuerza el primer pilar de la dirección
 *  de arte en lugar de cobrarle peaje. Referencia de lo que costaba antes:
 *  el bronce del logo necesitaba bajar el crema a 91.2° para dar 1.57:1. */
const INTENSIDAD = 0.46;
/** Nº de curvas de nivel. Bajar = curvas más separadas.
 *  A 22 el patrón se leía como ruido fino, no como topografía. */
const BANDAS = 13.0;
/** Grosor de línea, en múltiplos de la derivada. Medido a BANDAS 13:
 *  grosor 4.0 → 11 curvas de ancho a 8.6px, frente a 20 curvas a 4.5px con
 *  la combinación anterior. La cobertura total apenas se mueve (27.7% vs
 *  26.4%), así que el dibujo gana legibilidad SIN calentar más el crema:
 *  la misma tinta repartida en menos líneas y más gruesas. */
const GROSOR = 6.0;
/** Exponente del perfil de línea. CUIDADO con la intuición, la tuve al
 *  revés: valores POR DEBAJO de 1 no difuminan, endurecen. El pow empuja
 *  casi toda la tinta hacia el pico y produce una meseta plana con borde
 *  duro — medido, el difuminado caía del 48% al 18% al bajar de 0.45 a 0.10.
 *  Por encima de 1 el degradado se conserva y la curva se lee como veladura.
 *
 *  Cuidado al ensanchar: la cobertura se dispara (GROSOR 5 → 20%, 8 → 25%,
 *  12 → 41%) y con ella la tinta total. Con un color CLARO eso hundía el
 *  tono del crema — de 91° a 85° al pasar de 5 a 12. Con --profundo, que
 *  es oscuro y aporta poco croma cálido, ensanchar apenas mueve el tono. */
const SUAVIZADO = 1.3;

/** "#2F2016" → [0.184, 0.125, 0.086] */
function hexAVec3(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16
  );
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compilar(gl: WebGL2RenderingContext, tipo: number, fuente: string) {
  const sh = gl.createShader(tipo)!;
  gl.shaderSource(sh, fuente);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[fondo-topo] shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function FondoTopografico() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;

    const gl = lienzo.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    // Sin WebGL2 no hay degradado a medias: se cae a la textura SVG fija.
    // isContextLost() no es paranoia: un <canvas> solo tiene UN contexto de
    // por vida, así que si alguien lo perdió antes, getContext devuelve ese
    // mismo cadáver en vez de null.
    if (!gl || gl.isContextLost()) {
      lienzo.classList.add("fondo-topo--estatico");
      lienzo.dataset.modo = "estatico";
      return;
    }

    const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      lienzo.classList.add("fondo-topo--estatico");
      lienzo.dataset.modo = "estatico";
      return;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "pos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[fondo-topo] link:", gl.getProgramInfoLog(prog));
      lienzo.classList.add("fondo-topo--estatico");
      lienzo.dataset.modo = "estatico";
      return;
    }
    gl.useProgram(prog);

    // Un triángulo que cubre el viewport. Dos triángulos cosen una diagonal
    // por la que se pierden fragmentos; uno solo no tiene costura.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");
    const uInt = gl.getUniformLocation(prog, "u_int");
    const uBandas = gl.getUniformLocation(prog, "u_bandas");
    const uGrosor = gl.getUniformLocation(prog, "u_grosor");
    const uSuave = gl.getUniformLocation(prog, "u_suave");

    /* Los colores salen de los tokens, no de literales en el shader.
       Ambos ya existen: la textura no introduce color nuevo al sistema.

       El contraste lo da la LUMINANCIA y el calentamiento del crema lo da
       el croma, así que un bronce apagado sale mucho más barato que uno
       claro. Medido para llegar a 1.95:1 sobre --crema:
         --cobre (#BB825A, el del logo) → alfa 0.72
         --cobre-texto (#8A5A34)        → alfa 0.49
       --bronce-sombra es más oscuro todavía: llega al mismo contraste con
       menos alfa y por tanto con menos croma encima del crema.

       Nota: --cobre ES el bronce del logo. Muestreados los píxeles opacos
       de logo-cobre.png dan #BD835B de media y #BC845C como dominante,
       contra el #BB825A del token: 1–2 por canal, imperceptible. */
    const raiz = getComputedStyle(document.documentElement);
    const tono = (nombre: string, respaldo: string) =>
      hexAVec3(raiz.getPropertyValue(nombre) || respaldo);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_c1"), tono("--profundo", "#1E6E70"));
    gl.uniform3fv(gl.getUniformLocation(prog, "u_c2"), tono("--tinta", "#2F2016"));
    gl.uniform1f(uInt, INTENSIDAD);
    gl.uniform1f(uBandas, BANDAS);
    gl.uniform1f(uGrosor, GROSOR);
    gl.uniform1f(uSuave, SUAVIZADO);

    lienzo.dataset.modo = "webgl";

    const redimensionar = () => {
      const w = Math.max(1, Math.round(window.innerWidth * ESCALA_BUFFER));
      const h = Math.max(1, Math.round(window.innerHeight * ESCALA_BUFFER));

      /* Reasignar canvas.width/height reinicia el buffer, así que eso sí se
         hace solo cuando el tamaño cambia de verdad. */
      if (lienzo.width !== w || lienzo.height !== h) {
        lienzo.width = w;
        lienzo.height = h;
      }

      /* El viewport y u_res, en cambio, se fijan SIEMPRE. Van atados al
         programa, no al canvas: en un remontaje el canvas conserva su
         tamaño (así que la condición de arriba es falsa) pero el programa
         es nuevo y sus uniforms arrancan a cero. Tenerlo dentro del if
         dejaba u_res en [0,0], el shader dividía por cero y todo el fondo
         salía NaN — invisible, sin un solo error en consola. */
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    redimensionar();

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");

    const dibujar = (t: number) => {
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Un frame siempre, aunque no se anime: la textura debe existir.
    dibujar(0);

    let raf = 0;
    let ultimo = 0;
    let reloj = 0;
    const intervalo = 1000 / FPS;

    const bucle = (ahora: number) => {
      raf = requestAnimationFrame(bucle);
      if (ultimo === 0) ultimo = ahora;
      const delta = ahora - ultimo;
      if (delta < intervalo) return;
      ultimo = ahora - (delta % intervalo);
      reloj += (delta / 1000) * VELOCIDAD;
      dibujar(reloj);
    };

    const arrancar = () => {
      if (raf || quieto.matches || document.hidden) return;
      ultimo = 0;
      raf = requestAnimationFrame(bucle);
    };
    const parar = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar());
    const alCambiarMotion = () => (quieto.matches ? parar() : arrancar());

    /* El contexto se puede perder en caliente: reinicio del driver, la
       pestaña en segundo plano mucho tiempo, o simplemente demasiados
       contextos WebGL vivos en el navegador. Sin esto el canvas se
       quedaría transparente y el fondo desaparecería sin más. */
    const alPerderContexto = (e: Event) => {
      e.preventDefault();
      parar();
      lienzo.classList.add("fondo-topo--estatico");
      lienzo.dataset.modo = "estatico";
    };

    arrancar();
    window.addEventListener("resize", redimensionar);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    quieto.addEventListener("change", alCambiarMotion);
    lienzo.addEventListener("webglcontextlost", alPerderContexto);

    return () => {
      parar();
      window.removeEventListener("resize", redimensionar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      quieto.removeEventListener("change", alCambiarMotion);
      lienzo.removeEventListener("webglcontextlost", alPerderContexto);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      /* Aquí NO se llama a loseContext(). Sería tentador para "liberar la
         GPU", pero el contexto va atado al elemento canvas de por vida: al
         volver a montar, getContext devolvería el mismo contexto perdido y
         el fondo caería al respaldo para siempre. Se nota en dev, donde
         StrictMode monta, limpia y vuelve a montar. Soltar las referencias
         basta: el recolector se encarga cuando el canvas muere. */
    };
  }, []);

  return <canvas ref={ref} className="fondo-topo" aria-hidden="true" />;
}
