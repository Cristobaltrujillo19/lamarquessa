"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type LineaCarrito = {
  /** slug|colorId|tamanoId — identifica la combinación exacta. */
  key: string;
  slug: string;
  nombre: string;
  colorId: string;
  colorNombre: string;
  tamanoId: string;
  tamanoNombre: string;
  precioCop: number;
  foto: string;
  cantidad: number;
};

type NuevaLinea = Omit<LineaCarrito, "key" | "cantidad">;

type Ctx = {
  lineas: LineaCarrito[];
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  agregar: (linea: NuevaLinea, cantidad?: number) => void;
  cambiarCantidad: (key: string, cantidad: number) => void;
  quitar: (key: string) => void;
  vaciar: () => void;
  cantidadTotal: number;
  subtotal: number;
};

const CarritoContext = createContext<Ctx | null>(null);
const STORAGE = "lm_carrito_v1";

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setLineas(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(lineas));
    } catch {
      /* ignore */
    }
  }, [lineas]);

  const agregar = useCallback((linea: NuevaLinea, cantidad = 1) => {
    const key = `${linea.slug}|${linea.colorId}|${linea.tamanoId}`;
    setLineas((prev) => {
      const i = prev.findIndex((x) => x.key === key);
      if (i >= 0) {
        const copia = [...prev];
        copia[i] = { ...copia[i], cantidad: copia[i].cantidad + cantidad };
        return copia;
      }
      return [...prev, { ...linea, key, cantidad }];
    });
    setAbierto(true);
  }, []);

  const cambiarCantidad = useCallback((key: string, cantidad: number) => {
    setLineas((prev) =>
      cantidad <= 0
        ? prev.filter((x) => x.key !== key)
        : prev.map((x) => (x.key === key ? { ...x, cantidad } : x)),
    );
  }, []);

  const quitar = useCallback((key: string) => {
    setLineas((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const vaciar = useCallback(() => setLineas([]), []);

  const cantidadTotal = useMemo(
    () => lineas.reduce((s, x) => s + x.cantidad, 0),
    [lineas],
  );
  const subtotal = useMemo(
    () => lineas.reduce((s, x) => s + x.precioCop * x.cantidad, 0),
    [lineas],
  );

  const value: Ctx = {
    lineas,
    abierto,
    abrir: () => setAbierto(true),
    cerrar: () => setAbierto(false),
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    cantidadTotal,
    subtotal,
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): Ctx {
  const c = useContext(CarritoContext);
  if (!c) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return c;
}
