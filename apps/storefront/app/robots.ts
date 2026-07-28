import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// No bloqueamos CSS/JS ni a los rastreadores de IA (GPTBot, PerplexityBot,
// ClaudeBot, Google-Extended): en esta etapa queremos que la marca sea
// descubrible también en respuestas generadas por IA. Solo se excluyen /panel
// (la trastienda) y las páginas del embudo de compra, que no aportan nada en
// buscadores y sí compiten con las que venden.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/carrito", "/checkout", "/gracias", "/pago-fallido"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
