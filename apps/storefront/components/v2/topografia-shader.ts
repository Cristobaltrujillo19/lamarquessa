/**
 * Shader de las curvas de nivel. Vive fuera del componente para que la
 * pagina de diagnostico pueda instanciar EXACTAMENTE el mismo codigo: si
 * el diagnostico usara una copia, dejaria de probar lo que corre en el sitio.
 */

export const VERT = `#version 300 es
in vec2 pos;
void main() { gl_Position = vec4(pos, 0.0, 1.0); }
`;

export const FRAG = `#version 300 es
precision highp float;

uniform vec2  u_res;
uniform float u_t;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform float u_int;
uniform float u_bandas;
uniform float u_grosor;
uniform float u_suave;

out vec4 color;

const float TAU = 6.28318530718;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

/* Ruido de valor con interpolación quíntica: sin quiebres visibles en las
   derivadas, que es lo que delataría la rejilla en las curvas. */
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(hash(i),                hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)),hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/* Cada octava se rota antes de duplicar frecuencia: evita que los máximos
   se alineen en ejes y el resultado parezca cuadriculado.

   Tres octavas, no cinco. Las dos últimas aportan detalle por debajo del
   tamaño de un píxel del buffer (que va a 0.4 del viewport), así que no
   se ven: se alias y aparecen como puntilleo al reescalar. Quitarlas es
   lo que convierte el reescalado en difuminado limpio en vez de grano. */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += a * ruido(p);
    p = rot * p * 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  /* Normalizamos por altura para que el patrón no se estire en pantallas
     anchas: las curvas deben ser isotrópicas. */
  vec2 uv = gl_FragCoord.xy / u_res.y;
  float t = u_t;

  vec2 p = uv * 1.6;

  /* Dos niveles de deformación del dominio. El primero arrastra, el
     segundo pliega. Los signos opuestos en el tiempo son lo que produce
     la sensación de corriente en vez de deriva uniforme. */
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + t * 0.060),
    fbm(p + vec2(5.2, 1.3) - t * 0.050)
  );
  vec2 r = vec2(
    fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.040),
    fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.045)
  );
  float h = fbm(p + 1.9 * r);

  /* Curvas de nivel: bandear la altura y dibujar solo el borde de banda.
     El ancho se deriva de fwidth, así la línea mide lo mismo en pantalla
     donde el gradiente es suave y donde es abrupto — sin ese término las
     zonas planas se empastan. */
  float bandas = h * u_bandas;
  float d  = abs(fract(bandas) - 0.5) * 2.0;
  /* w = cuántas bandas caben en un píxel. Es la medida de si el dibujo
     es resoluble a esta resolución. */
  float w  = fwidth(bandas);
  float df = clamp(w * u_grosor, 0.015, 0.85);
  float linea = smoothstep(1.0 - df, 1.0, d);

  /* Difuminado. Con u_suave < 1 las faldas de la curva suben y el borde
     se disuelve: la línea deja de tener contorno y pasa a ser una veladura.
     Ojo, esto AÑADE tinta (ensancha), así que al difuminar hay que bajar
     u_int en la misma medida o el fondo gana presencia en vez de perderla. */
  linea = pow(linea, u_suave);

  /* Nada de desvanecer por densidad de bandas aquí. Lo intenté para tapar
     el puntilleo que salía con el buffer a 0.4, y o no hacía nada (umbral
     0.35 cuando w nunca pasa de 0.153) o se comía líneas buenas dejándolas
     punteadas. El puntilleo era falta de resolución, no aliasing analítico:
     se resuelve con ESCALA_BUFFER decente y el difuminado se pone después
     con un blur CSS, que es gaussiano de verdad y no toca el muestreo. */

  /* Deriva lenta del bronce hacia la tinta marina y vuelta. El tope de
     0.30 mantiene la textura siempre reconociblemente bronce; el tramo
     hacia la tinta es lo que impide que el fondo se lea como una capa
     uniformemente cálida y devuelve un guiño a la familia marina. */
  float f1 = 0.5 + 0.5 * sin(TAU * t * 0.012);
  vec3 col = mix(u_c1, u_c2, f1 * 0.30);

  color = vec4(col, linea * u_int);
}
`;
