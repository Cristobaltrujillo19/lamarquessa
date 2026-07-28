import IconoMarca from "./IconoMarca";
import css from "./FranjaIconos.module.css";

// Franja divisoria con los tres símbolos de marca. Puramente decorativa.
export default function FranjaIconos() {
  return (
    <section className={css.franja} aria-hidden="true">
      <div className={`contenedor ${css.iconos}`}>
        <IconoMarca nombre="concha" tamano={88} />
        <IconoMarca nombre="velero" tamano={88} />
        <IconoMarca nombre="hibisco" tamano={88} />
      </div>
    </section>
  );
}
