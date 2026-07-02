import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductoForm from "../../ProductoForm";
import { accionActualizar } from "@/app/panel/actions";
import { secreto } from "@/app/panel/lib/auth";

export default async function EditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const items = await fetchQuery(api.productos.listar, { secret: secreto() });
  const producto = items.find((p) => p._id === id);
  if (!producto) notFound();

  return (
    <div>
      <h1 className="font-titulo text-3xl">Editar producto</h1>
      <div className="mt-6">
        <ProductoForm esNuevo={false} action={accionActualizar} producto={producto} />
      </div>
    </div>
  );
}
