import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { secreto } from "@/app/panel/lib/auth";
import { PosForm } from "./PosForm";

export const dynamic = "force-dynamic";

export default async function VentaPage() {
  const [productos, inv] = await Promise.all([
    fetchQuery(api.productos.catalogo, {}),
    fetchQuery(api.admin.listarInventario, { secret: secreto() }),
  ]);

  // Stock por variante, indexado para el POS.
  const stock: Record<string, number> = {};
  for (const r of inv) stock[`${r.slug}|${r.colorId}|${r.tamanoId}`] = r.cantidad;

  // Solo lo que el POS necesita del catálogo (payload liviano al cliente).
  const catalogo = productos.map((p) => ({
    slug: p.slug,
    nombre: p.nombre,
    colores: p.colores.map((c) => ({ id: c.id, nombre: c.nombre, hex: c.hex })),
    tamanos: p.tamanos.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      precioCop: t.precioCop,
    })),
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-titulo text-3xl">Nueva venta</h1>
      <p className="mt-1 text-sm text-cacao-suave">
        Venta presencial. El stock baja de la bodega al registrar (entrega en
        mano) o al despachar (con envío).
      </p>
      {catalogo.length === 0 ? (
        <p className="mt-6 rounded-lg border border-cacao/10 bg-blanco p-6 text-center text-cacao-suave">
          No hay bolsos activos. Crea o activa productos en la pestaña Productos.
        </p>
      ) : (
        <PosForm catalogo={catalogo} stock={stock} />
      )}
    </div>
  );
}
