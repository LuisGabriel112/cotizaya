import type { CambiosCotizacion } from "@/lib/cotizaciones/estado";
import type { Acabado, Cotizacion, Croquis, Estado, FotoMaterial, PartidaGuardada, Plantilla, Taller } from "@/lib/cotizaciones/tipos";
import type { Material, Unidad } from "@/lib/quote";

// Filas tal como las regresa Supabase (snake_case) y su traducción al dominio.

export interface FilaItem {
  id: string;
  orden: number;
  plantilla_clave: string;
  descripcion: string;
  material_id: string | null;
  unidad: Unidad;
  precio_centavos: number;
  pieza_singular: string | null;
  pieza_plural: string | null;
  ancho_cm: number;
  alto_cm: number;
  cantidad: number;
  mano_obra_centavos: number;
  importe_centavos: number;
}

export interface FilaQuote {
  id: string;
  folio: number;
  cliente_nombre: string;
  status: Estado;
  descuento_pct: number;
  con_iva: boolean;
  acabado: Acabado;
  garantia_salitre: boolean;
  public_slug: string;
  viewed_at: string | null;
  /** La vista pública no lo trae. */
  aviso_pendiente?: boolean;
  created_at: string;
  quote_items?: FilaItem[];
}

export interface FilaMaterial {
  id: string;
  clave: string;
  nombre: string;
  linea: string;
  unidad: Unidad;
  precio_centavos: number;
  pieza_singular: string | null;
  pieza_plural: string | null;
}

export interface FilaPlantilla {
  workshop_id: string | null;
  clave: string;
  nombre: string;
  descripcion: string;
  material_clave: string;
  mano_obra_centavos: number;
  croquis: string;
  orden: number;
}

export interface FilaTaller {
  nombre: string;
  ciudad: string;
  telefono: string;
  condiciones: string;
  plan: Taller["plan"];
  logo_url: string | null;
}

export type FilaPartida = Omit<FilaItem, "id">;

function pieza(singular: string | null, plural: string | null): { pieza?: readonly [string, string] } {
  return singular && plural ? { pieza: [singular, plural] } : {};
}

function aFoto(i: FilaItem): FotoMaterial {
  return { unidad: i.unidad, precioCentavos: i.precio_centavos, ...pieza(i.pieza_singular, i.pieza_plural) };
}

export function aPartida(i: FilaItem): PartidaGuardada {
  return {
    id: i.id,
    plantillaId: i.plantilla_clave,
    descripcion: i.descripcion,
    materialId: i.material_id ?? "",
    anchoCm: i.ancho_cm,
    altoCm: i.alto_cm,
    cantidad: i.cantidad,
    manoObraCentavos: i.mano_obra_centavos,
    material: aFoto(i),
  };
}

export function aCotizacion(q: FilaQuote): Cotizacion {
  const items = [...(q.quote_items ?? [])].sort((a, b) => a.orden - b.orden);
  return {
    id: q.id,
    folio: q.folio,
    slug: q.public_slug,
    cliente: q.cliente_nombre,
    partidas: items.map(aPartida),
    descuentoPct: q.descuento_pct,
    conIva: q.con_iva,
    acabado: q.acabado,
    garantiaSalitre: q.garantia_salitre,
    estado: q.status,
    creadaEn: q.created_at,
    avisoPendiente: q.aviso_pendiente ?? false,
    ...(q.viewed_at ? { vistaEn: q.viewed_at } : {}),
  };
}

/** La partida ya con su foto de material; sin quote_id ni workshop_id, que pone el repositorio. */
export function aFilaPartida(p: PartidaGuardada & { material: FotoMaterial }, orden: number, importeCentavos: number): FilaPartida {
  return {
    orden,
    plantilla_clave: p.plantillaId,
    descripcion: p.descripcion,
    material_id: p.materialId || null,
    unidad: p.material.unidad,
    precio_centavos: p.material.precioCentavos,
    pieza_singular: p.material.pieza?.[0] ?? null,
    pieza_plural: p.material.pieza?.[1] ?? null,
    ancho_cm: p.anchoCm,
    alto_cm: p.altoCm,
    cantidad: p.cantidad,
    mano_obra_centavos: p.manoObraCentavos,
    importe_centavos: importeCentavos,
  };
}

export function aMaterial(m: FilaMaterial): Material {
  return { id: m.id, nombre: m.nombre, linea: m.linea, unidad: m.unidad, precioCentavos: m.precio_centavos, ...pieza(m.pieza_singular, m.pieza_plural) };
}

const esDelTaller = (f: FilaPlantilla) => Number(f.workshop_id !== null);

/** Plantillas del taller encima de las globales con la misma clave; sin material en el catálogo no se ofrecen. */
export function aPlantillas(filas: readonly FilaPlantilla[], materiales: readonly FilaMaterial[]): Plantilla[] {
  const porClave = new Map<string, FilaPlantilla>();
  for (const f of [...filas].sort((a, b) => esDelTaller(a) - esDelTaller(b))) porClave.set(f.clave, f);
  const idDeMaterial = new Map(materiales.map((m) => [m.clave, m.id]));
  return [...porClave.values()]
    .sort((a, b) => a.orden - b.orden)
    .flatMap((f) => {
      const materialId = idDeMaterial.get(f.material_clave);
      return materialId ? [aPlantilla(f, materialId)] : [];
    });
}

function aPlantilla(f: FilaPlantilla, materialId: string): Plantilla {
  return {
    id: f.clave,
    nombre: f.nombre,
    descripcion: f.descripcion,
    materialId,
    manoObraCentavos: f.mano_obra_centavos,
    croquis: f.croquis as Croquis,
  };
}

export function aTaller(t: FilaTaller): Taller {
  return {
    nombre: t.nombre,
    ciudad: t.ciudad,
    telefono: t.telefono,
    condiciones: t.condiciones,
    plan: t.plan,
    ...(t.logo_url ? { logoUrl: t.logo_url } : {}),
  };
}

const COLUMNA: Record<keyof CambiosCotizacion, string> = {
  cliente: "cliente_nombre",
  descuentoPct: "descuento_pct",
  conIva: "con_iva",
  acabado: "acabado",
  garantiaSalitre: "garantia_salitre",
};

export function aCambiosFila(cambios: CambiosCotizacion): Record<string, unknown> {
  return Object.fromEntries(Object.entries(cambios).map(([k, v]) => [COLUMNA[k as keyof CambiosCotizacion], v]));
}

export interface JsonPublico {
  quote: Omit<FilaQuote, "quote_items">;
  items: FilaItem[];
  taller: FilaTaller;
}

export function aVistaPublica(json: JsonPublico): { cotizacion: Cotizacion; taller: Taller } {
  return { cotizacion: aCotizacion({ ...json.quote, quote_items: json.items }), taller: aTaller(json.taller) };
}
