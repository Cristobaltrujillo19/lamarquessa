"use client";

import { useEffect } from "react";
import { consumirSnapshotCompra, trackPurchase } from "@/lib/analytics";

// Dispara el evento `purchase` de GA4 al llegar a /gracias, con el snapshot
// que checkout dejó en sessionStorage justo antes de redirigir a MP.
// consumirSnapshotCompra lo consume: una recarga NO vuelve a disparar.
//
// El transactionId es el payment_id de Mercado Pago cuando el pago fue
// aprobado (status=approved). Si volvemos con status=pending (PSE, Efecty),
// se guarda igual pero con un id derivado del preference_id para no perder
// la conversión — GA4 permite deduplicar por transaction_id si el pago
// finalmente se aprueba y llegara una segunda visita.
export default function PurchaseTracker({
  transactionId,
}: {
  transactionId: string | null;
}) {
  useEffect(() => {
    if (!transactionId) return;
    const snapshot = consumirSnapshotCompra();
    if (!snapshot) return;
    trackPurchase({ transactionId, snapshot });
  }, [transactionId]);

  return null;
}
