import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import {
  PASOS_CARRITO,
  type PasoCarrito,
  formatFecha,
  whatsappLink,
} from "@/app/panel/lib/ui";
import { formatCop } from "@/lib/productos";
import { addOnsPorUnidad, nombreFuente } from "@/lib/personalizacion";

// Se escriben desde el navegador de cada visitante: nunca cachear.
export const dynamic = "force-dynamic";

const VISTAS = [
  { id: "abandonados", label: "Abandonados" },
  { id: "carrito", label: "Solo carrito" },
  { id: "checkout", label: "Llegaron al checkout" },
  { id: "enviado", label: "Enviaron el pedido" },
  { id: "todos", label: "Todos" },
] as const;

type VistaId = (typeof VISTAS)[number]["id"];

/** "Abandonado" es todo lo que no llegó a enviar el formulario: son los que se
 *  pueden recuperar. Los `enviado` ya tienen un pedido en la otra pantalla. */
function pasaFiltro(paso: PasoCarrito, vista: VistaId): boolean {
  if (vista === "todos") return true;
  if (vista === "abandonados") return paso !== "enviado";
  return paso === vista;
}

function esVista(v: string | undefined): v is VistaId {
  return VISTAS.some((x) => x.id === v);
}

export default async function CarritosPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const { vista: vistaParam } = await searchParams;
  const vista: VistaId = esVista(vistaParam) ? vistaParam : "abandonados";

  const { carritos, truncado } = await fetchQuery(api.admin.listarCarritos, {
    secret: secreto(),
  });

  const cuenta = (v: VistaId) =>
    carritos.filter((c) => pasaFiltro(c.paso, v)).length;

  // Lo que se dejó por el camino. Solo cuenta lo abandonado: sumar los
  // enviados inflaría la cifra con dinero que sí entró.
  const abandonados = carritos.filter((c) => c.paso !== "enviado");
  const plataAbandonada = abandonados.reduce((s, c) => s + c.subtotalCop, 0);
  const conContacto = abandonados.filter((c) => c.contacto).length;

  const filtrados = carritos.filter((c) => pasaFiltro(c.paso, vista));

  return (
    <div>
      <h1 className="font-titulo text-3xl">Carritos</h1>
      <p className="mt-1 max-w-2xl text-sm text-cacao-suave">
        El tramo anterior al pedido: quién agregó al carrito y quién empezó el
        checkout sin enviarlo. Se borran solos a los 90 días. Los datos de
        contacto solo aparecen cuando la persona los escribió teniendo a la
        vista el aviso de tratamiento de datos.
      </p>

      {/* Resumen del embudo */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-cacao/10 bg-blanco p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">
            Carritos abandonados
          </p>
          <p className="mt-1 font-titulo text-3xl">{abandonados.length}</p>
        </div>
        <div className="rounded-lg border border-cacao/10 bg-blanco p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">
            Se quedó por el camino
          </p>
          <p className="mt-1 font-titulo text-3xl">{formatCop(plataAbandonada)}</p>
        </div>
        <div className="rounded-lg border border-cacao/10 bg-blanco p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-cacao-suave">
            Con contacto para escribir
          </p>
          <p className="mt-1 font-titulo text-3xl">{conContacto}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-5 mt-5 flex flex-wrap gap-2">
        {VISTAS.map((v) => {
          const activo = vista === v.id;
          return (
            <Link
              key={v.id}
              href={`/panel/carritos?vista=${v.id}`}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                activo
                  ? "bg-cobre text-blanco"
                  : "bg-blanco text-cacao-suave hover:text-cobre"
              }`}
            >
              {v.label} <span className="opacity-60">{cuenta(v.id)}</span>
            </Link>
          );
        })}
      </div>

      {truncado && (
        <p className="mb-4 rounded-lg border border-cobre/30 bg-blanco p-3 text-sm text-cacao-suave">
          Se muestran los 500 carritos más recientes. Los totales de arriba
          cuentan solo esos.
        </p>
      )}

      {filtrados.length === 0 ? (
        <p className="rounded-lg border border-cacao/10 bg-blanco p-8 text-center text-cacao-suave">
          No hay carritos en esta vista.
        </p>
      ) : (
        <ul className="grid gap-3">
          {filtrados.map((c) => {
            const p = PASOS_CARRITO[c.paso];
            const wa = whatsappLink(c.contacto?.whatsapp);
            const unidades = c.items.reduce((s, i) => s + i.cantidad, 0);

            return (
              <li
                key={c._id}
                className="rounded-lg border border-cacao/10 bg-blanco p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-cacao">
                      {c.contacto?.nombre ?? "Visitante sin nombre"}
                    </p>
                    <p className="text-sm text-cacao-suave">
                      {formatFecha(c.actualizadoEn)} · {unidades} bolso(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.clase}`}
                    >
                      {p.label}
                    </span>
                    <p className="mt-1 font-titulo text-lg">
                      {formatCop(c.subtotalCop)}
                    </p>
                  </div>
                </div>

                {/* Qué llevaba */}
                <ul className="mt-3 border-t border-cacao/10 pt-3 text-sm text-cacao-suave">
                  {c.items.map((i, n) => (
                    <li key={n} className="py-0.5">
                      {i.cantidad} × {i.nombre} · {i.colorNombre} ·{" "}
                      {i.tamanoNombre} ·{" "}
                      {formatCop(i.precioCop + addOnsPorUnidad(i.personalizacion))}
                      {i.personalizacion?.iniciales && (
                        <span className="block pl-4 text-cobre">
                          Iniciales{" "}
                          <strong>{i.personalizacion.iniciales.texto}</strong> (
                          {nombreFuente(i.personalizacion.iniciales.fuenteId)})
                        </span>
                      )}
                      {i.personalizacion?.colorPersonalizado && (
                        <span className="block pl-4 text-cobre">
                          Color:{" "}
                          <em>{i.personalizacion.colorPersonalizado.descripcion}</em>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Cómo escribirle, si autorizó sus datos */}
                {c.contacto ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-cacao/10 pt-3 text-sm">
                    {c.contacto.email && (
                      <a
                        href={`mailto:${c.contacto.email}`}
                        className="text-cobre underline underline-offset-2"
                      >
                        {c.contacto.email}
                      </a>
                    )}
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cobre underline underline-offset-2"
                      >
                        WhatsApp {c.contacto.whatsapp}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 border-t border-cacao/10 pt-3 text-sm text-cacao-suave">
                    Sin datos de contacto: no llegó a escribirlos.
                  </p>
                )}

                {/* La prueba de la autorización, tal como se archivó */}
                {c.consentimiento && (
                  <details className="mt-2 text-sm text-cacao-suave">
                    <summary className="cursor-pointer">
                      Autorización de datos · {formatFecha(c.consentimiento.en)}
                    </summary>
                    <p className="mt-1 border-l-2 border-cacao/15 pl-3 italic">
                      {c.consentimiento.texto}
                    </p>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
