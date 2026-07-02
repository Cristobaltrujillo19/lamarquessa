import ProductoForm from "../ProductoForm";
import { accionCrear } from "@/app/panel/actions";

export default function NuevoPage() {
  return (
    <div>
      <h1 className="font-titulo text-3xl">Nuevo producto</h1>
      <div className="mt-6">
        <ProductoForm esNuevo action={accionCrear} />
      </div>
    </div>
  );
}
