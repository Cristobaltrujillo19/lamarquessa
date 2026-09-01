import type { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { urlAbsoluta } from "@/lib/site";

// El sitemap se arma con el catálogo real: si se publica o se oculta un bolso
// desde el panel, aquí se refleja solo.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await fetchQuery(api.productos.catalogo, {}).catch(() => []);
  const ahora = new Date();

  const fijas: MetadataRoute.Sitemap = [
    { url: urlAbsoluta("/"), lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: urlAbsoluta("/tienda"), lastModified: ahora, changeFrequency: "weekly", priority: 0.9 },
    { url: urlAbsoluta("/nosotros"), lastModified: ahora, changeFrequency: "monthly", priority: 0.7 },
    {
      url: urlAbsoluta("/preguntas-frecuentes"),
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Envios y contacto faltaban aqui, y son indexables: tienen canonical, no
    // llevan noindex y responden 200. Sin entrada en el sitemap, Google solo
    // llegaba a ellas siguiendo enlaces internos.
    { url: urlAbsoluta("/envios"), lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: urlAbsoluta("/contacto"), lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: urlAbsoluta("/privacidad"), lastModified: ahora, changeFrequency: "yearly", priority: 0.2 },
  ];

  const fichas: MetadataRoute.Sitemap = productos.map((p) => ({
    url: urlAbsoluta(`/producto/${p.slug}`),
    lastModified: new Date(p._creationTime),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...fijas, ...fichas];
}
