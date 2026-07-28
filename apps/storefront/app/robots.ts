import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// No bloqueamos CSS/JS ni a los rastreadores de IA (GPTBot, PerplexityBot,
// ClaudeBot, Google-Extended): en esta etapa queremos que la marca sea
// descubrible también en respuestas generadas por IA. Solo se excluye /panel,
// que es la trastienda.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/carrito", "/checkout"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
