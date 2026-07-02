import Link from "next/link";
import { requireAuth } from "@/app/panel/lib/auth";
import { puedeVerCuentas } from "@/app/panel/lib/permisos";
import { logout } from "@/app/panel/actions";

const navLink =
  "rounded-sm px-3 py-2 text-cacao-suave transition-colors hover:text-cobre";

export default async function PanelAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sesion = await requireAuth();
  const verCuentas = await puedeVerCuentas(sesion.uid);

  return (
    <div className="min-h-screen bg-crema">
      <header className="border-b border-cacao/10 bg-blanco">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
          <Link href="/panel" className="font-titulo text-xl">
            Panel · La Marquessa
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link href="/panel" className={navLink}>Pedidos</Link>
            <Link href="/panel/productos" className={navLink}>Productos</Link>
            <Link href="/panel/inventario" className={navLink}>Inventario</Link>
            <Link href="/panel/cupones" className={navLink}>Cupones</Link>
            {verCuentas && (
              <Link href="/panel/finanzas" className={navLink}>Finanzas</Link>
            )}
            {sesion.uid === "master" && (
              <Link href="/panel/equipo" className={navLink}>Equipo</Link>
            )}
            <Link
              href="/panel/venta"
              className="rounded-sm bg-cobre px-4 py-2 text-xs uppercase tracking-[0.14em] text-blanco transition-colors hover:bg-cobre-hondo"
            >
              + Venta
            </Link>
            <a
              href="/"
              className="px-3 py-2 text-cacao-suave transition-colors hover:text-cobre"
            >
              Ver tienda ↗
            </a>
            <form action={logout}>
              <button type="submit" className={navLink}>Salir</button>
            </form>
          </nav>
        </div>
        <div className="mx-auto max-w-[1000px] px-5 pb-3 text-sm text-cacao-suave">
          👤 {sesion.nombre}
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 py-8">{children}</main>
    </div>
  );
}
