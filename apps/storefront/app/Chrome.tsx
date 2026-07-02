"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Muestra el header/footer/carrito de la TIENDA en las rutas públicas,
// pero no en /panel (que tiene su propio chrome).
export default function Chrome({
  header,
  footer,
  drawer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  drawer: ReactNode;
  children: ReactNode;
}) {
  const path = usePathname();
  if (path?.startsWith("/panel")) return <>{children}</>;
  return (
    <>
      {header}
      {children}
      {footer}
      {drawer}
    </>
  );
}
