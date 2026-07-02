// Auth del panel (solo servidor). Login por persona (usuario + clave) con sesión
// firmada (HMAC). La contraseña de cada persona se guarda como hash scrypt + salt
// en Convex; nunca en claro. Hay un acceso "maestro": usuario `admin` +
// PANEL_PASSWORD, para arrancar y gestionar el equipo. El navegador nunca ve el
// secreto ni los hashes.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

export const COOKIE_NAME = "lm_panel";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

/** Secreto compartido con Convex (server-only). También firma la sesión. */
export function secreto(): string {
  const s = process.env.ADMIN_API_SECRET;
  if (!s) throw new Error("Falta ADMIN_API_SECRET en las variables de entorno");
  return s;
}

function firmar(payload: string): string {
  return crypto.createHmac("sha256", secreto()).update(payload).digest("base64url");
}

export type Sesion = { uid: string; nombre: string };

/** Crea el valor de la cookie de sesión: "<payload>.<firma>". */
export function crearToken(s: Sesion): string {
  const data = { uid: s.uid, nombre: s.nombre, exp: Date.now() + COOKIE_MAX_AGE * 1000 };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${firmar(payload)}`;
}

function verificar(token: string | undefined): Sesion | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const firma = Buffer.from(token.slice(i + 1));
  const esperada = Buffer.from(firmar(payload));
  if (firma.length !== esperada.length) return null;
  if (!crypto.timingSafeEqual(firma, esperada)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof d.exp !== "number" || d.exp <= Date.now()) return null;
    return { uid: String(d.uid), nombre: String(d.nombre) };
  } catch {
    return null;
  }
}

export async function leerSesion(): Promise<Sesion | null> {
  const c = await cookies();
  return verificar(c.get(COOKIE_NAME)?.value);
}

/** Para páginas/acciones protegidas: redirige al login si no hay sesión. */
export async function requireAuth(): Promise<Sesion> {
  const s = await leerSesion();
  if (!s) redirect("/panel/login");
  return s;
}

/** ¿Hay una sesión válida? (compat con el layout de productos.) */
export async function estaAutenticado(): Promise<boolean> {
  return (await leerSesion()) !== null;
}

// === Contraseñas ===
export function hashPassword(plain: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(plain: string, hash: string, salt: string): boolean {
  const calc = crypto.scryptSync(plain, salt, 64);
  const guardado = Buffer.from(hash, "hex");
  return calc.length === guardado.length && crypto.timingSafeEqual(calc, guardado);
}

/** Acceso maestro: usuario "admin" + PANEL_PASSWORD. */
export function esMasterPassword(plain: string): boolean {
  const m = process.env.PANEL_PASSWORD;
  if (!m) return false;
  const a = Buffer.from(plain);
  const b = Buffer.from(m);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
