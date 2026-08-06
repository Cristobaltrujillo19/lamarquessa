import Link from "next/link";
import IconoMarca from "./IconoMarca";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import css from "./CierreCta.module.css";

export default function CierreCta() {
  return (
    <section className={css.cierre}>
      <div className={`contenedor ${css.centro} reveal`}>
        <IconoMarca nombre="concha" tamano={64} />
        <h2 className={css.frase}>
          {/* Espacio antes del <br /> para que innerText no pegue "mar" y "y":
              sin él, lectores de pantalla y crawlers leen "mary". */}
          Del amor, del mar{" "}
          <br />y del amor al mar.
        </h2>
        <p className={css.sub}>Cada pieza se hace una sola vez.</p>
        <div className={css.acciones}>
          <Link className="boton boton-primario" href="/tienda">
            Ver la colección
          </Link>
          <a
            className="boton boton-fantasma"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener"
          >
            Síguenos {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </section>
  );
}
