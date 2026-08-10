import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";

// Host canónico derivado de SITE_URL (lo hornea el build junto con canonical,
// OG y sitemap). Cualquier petición en producción que llegue a otro host
// (típicamente el subdominio auto de Vercel, lamarquessa-landing-gtpv-three
// .vercel.app) se responde 301 al mismo path bajo el host canónico. Con eso:
//  - Google despriva la URL de Vercel y consolida autoridad en el dominio.
//  - Enlaces viejos compartidos antes del cutover llegan sin romperse.
const CANONICO_HOST = new URL(SITE_URL).host;

export function middleware(req: NextRequest) {
  // Los previews de Vercel deben seguir sirviéndose bajo su propia URL: si
  // no, no se podría revisar una PR en su despliegue de preview.
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();

  const host = req.headers.get("host") ?? "";
  if (host === CANONICO_HOST) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.host = CANONICO_HOST;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 301);
}

// Se salta assets del framework (_next/*): están cacheados y no aportan a
// SEO redirigirlos. Todo lo demás (páginas, /robots.txt, /sitemap.xml,
// /og.jpg, favicon) sí pasa por el middleware.
export const config = {
  matcher: ["/((?!_next/).*)"],
};
