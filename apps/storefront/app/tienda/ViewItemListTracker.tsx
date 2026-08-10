"use client";

import { useEffect, useRef } from "react";
import { trackViewItemList } from "@/lib/analytics";

type ItemLista = { slug: string; nombre: string; precioDesde: number };

// Dispara view_item_list una sola vez por listName al llegar al catálogo.
// Va aquí y no en la página porque la página es server (async fetchQuery);
// GA4 espera el evento desde el navegador.
//
// El ref evita el doble disparo de React Strict Mode (dev) y protege también
// de un re-render inesperado en prod.
export default function ViewItemListTracker({
  items,
  listName,
}: {
  items: ItemLista[];
  listName: string;
}) {
  const disparadoPara = useRef<string | null>(null);

  useEffect(() => {
    if (disparadoPara.current === listName) return;
    if (items.length === 0) return;
    disparadoPara.current = listName;
    trackViewItemList(items, listName);
    // Solo depende del nombre de la lista: si cambia el orden pero es la
    // misma vista, no volvemos a disparar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName]);

  return null;
}
