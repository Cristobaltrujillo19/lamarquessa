// Símbolos del manual de marca (concha, velero, hibisco, olas del manifiesto).
// Se sirven como archivos estáticos ya coloreados en cobre desde /public/svg:
// pesan lo mismo pero se cachean aparte en vez de inflar el HTML de cada página.
// Son decorativos, así que van con alt vacío y aria-hidden.

export type SimboloMarca = "concha" | "velero" | "hibisco" | "waves";

export default function IconoMarca({
  nombre,
  tamano = 64,
  className,
}: {
  nombre: SimboloMarca;
  tamano?: number;
  className?: string;
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/svg/${nombre}.svg`}
      alt=""
      aria-hidden="true"
      width={tamano}
      height={tamano}
      className={className}
      style={{ width: tamano, height: "auto" }}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Línea de olas decorativa para separar secciones ("El encuentro de las olas"). */
export function IconoOlas({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="120"
      height="16"
      viewBox="0 0 120 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path d="M0 8 Q10 0 20 8 T40 8 T60 8 T80 8 T100 8 T120 8" />
    </svg>
  );
}

/** Ícono de WhatsApp (marca registrada de Meta, se usa tal cual). */
export function IconoWhatsApp({ tamano = 24 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.5 2.1 7.9L.4 31.6l8-2.1c2.3 1.3 4.9 1.9 7.6 1.9 8.6 0 15.5-7 15.5-15.5C31.5 7.3 24.6.4 16 .4zm0 28.4c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-5 1.3 1.3-4.9-.3-.5C3.4 20.5 2.8 18.2 2.8 15.9 2.8 8.6 8.7 2.7 16 2.7S29.2 8.6 29.2 15.9 23.3 28.8 16 28.8zm8.2-9.9c-.4-.2-2.6-1.3-3-1.5-.4-.1-.7-.2-1 .2-.3.4-1.1 1.4-1.4 1.7-.3.3-.5.3-.9.1-2.4-1.2-4-2.1-5.6-4.8-.4-.7.4-.7 1.2-2.2.1-.3.1-.5 0-.7-.1-.2-1-2.3-1.3-3.2-.3-.8-.7-.7-1-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 4 1.7 4.3c.2.3 2.9 4.5 7.1 6.3 2.6 1.1 3.7 1.2 5 1 .8-.1 2.6-1.1 3-2.1.4-1 .4-1.9.3-2.1-.1-.2-.4-.3-.8-.5z" />
    </svg>
  );
}
