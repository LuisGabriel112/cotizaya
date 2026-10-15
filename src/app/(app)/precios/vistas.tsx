import type { EntradaMaterial, MaterialGuardado } from "@/lib/catalogo/casos";
import { etiquetaUnidad } from "@/lib/catalogo/edicion";
import { formatCentavos } from "@/lib/format";

const campo = "mt-1 min-h-16 w-full rounded-sm border-2 border-tinta bg-papel px-4 text-xl text-tinta";
const boton = "min-h-14 rounded-sm border-2 border-tinta px-5 titulo text-xl";
type Grupo = { linea: string; materiales: MaterialGuardado[] };

export function FormularioPrecio({ material, precio, cambiar, error, ocupado, progreso, quitar, guardar, cancelar }: {
  material: MaterialGuardado; precio: string; cambiar: (precio: string) => void; error: string; ocupado: boolean;
  progreso: string; quitar: () => void; guardar: () => void; cancelar: () => void;
}) {
  return <section className="mt-6">
    <h2 className="titulo text-2xl">{material.nombre}</h2>
    <p className="text-tinta-2">{etiquetaUnidad(material.unidad)}</p>
    <label className="mt-6 block font-medium" htmlFor="precio-editar">Precio</label>
    <input id="precio-editar" autoFocus className={`${campo} num text-right`} inputMode="decimal" value={precio} onChange={(e) => cambiar(e.target.value)} />
    <ErrorCatalogo mensaje={error} />
    <button type="button" className="mt-6 min-h-14 text-xl font-semibold underline decoration-rojo" onClick={quitar} disabled={ocupado}>Quitar</button>
    <BarraGuardar guardar={guardar} cancelar={cancelar} ocupado={ocupado} progreso={progreso} />
  </section>;
}

export function Lista({ grupos, abrir, abrirNuevo }: { grupos: Grupo[]; abrir: (material: MaterialGuardado) => void; abrirNuevo: () => void }) {
  return <>
    {grupos.length === 0 && <p className="mt-8 text-lg">Aún no tienes materiales. Agrega el primero.</p>}
    {grupos.map((grupo) => <section key={grupo.linea} className="mt-6">
      <h2 className="titulo border-b-2 border-tinta pb-2 text-2xl">{grupo.linea}</h2>
      <ul>{grupo.materiales.map((material) => <li key={material.id}>
        <button id={`material-${material.id}`} type="button" onClick={() => abrir(material)} className="flex min-h-20 w-full items-center justify-between gap-3 border-b border-dashed border-aluminio py-3 text-left">
          <span className="min-w-0 break-words"><span className="block text-lg font-semibold">{material.nombre}</span><span className="text-base text-tinta-2">{etiquetaUnidad(material.unidad)}</span></span>
          <span className="num shrink-0 text-right text-lg font-bold">{formatCentavos(material.precioCentavos)}</span>
        </button>
      </li>)}</ul>
    </section>)}
    <div className="fixed inset-x-0 bottom-0 border-t-2 border-tinta bg-papel px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <button id="agregar-material" type="button" onClick={abrirNuevo} className={`${boton} mx-auto block w-full max-w-md bg-amarillo`}>Agregar material</button>
    </div>
  </>;
}

export function FormularioNuevo({ entrada, cambiar, error, ocupado, progreso, guardar, cancelar }: {
  entrada: EntradaMaterial; cambiar: (entrada: EntradaMaterial) => void; error: string;
  ocupado: boolean; progreso: string; guardar: () => void; cancelar: () => void;
}) {
  return <section className="mt-6">
    <h2 className="titulo text-2xl">Agregar material</h2>
    <CampoTexto id="nombre-material" nombre="Nombre" autoFocus valor={entrada.nombre} cambiar={(nombre) => cambiar({ ...entrada, nombre })} />
    <CampoTexto id="linea-material" nombre="Línea (opcional)" valor={entrada.linea ?? ""} cambiar={(linea) => cambiar({ ...entrada, linea })} />
    <SelectorUnidad entrada={entrada} cambiar={cambiar} />
    {entrada.unidad === "pieza" && <NombresPieza entrada={entrada} cambiar={cambiar} />}
    <label className="mt-6 block font-medium" htmlFor="precio-nuevo">Precio</label>
    <input id="precio-nuevo" className={`${campo} num text-right`} inputMode="decimal" value={entrada.precio} onChange={(e) => cambiar({ ...entrada, precio: e.target.value })} />
    <ErrorCatalogo mensaje={error} />
    <BarraGuardar guardar={guardar} cancelar={cancelar} ocupado={ocupado} progreso={progreso} />
  </section>;
}

function SelectorUnidad({ entrada, cambiar }: { entrada: EntradaMaterial; cambiar: (entrada: EntradaMaterial) => void }) {
  return <fieldset className="mt-6"><legend className="font-medium">Unidad</legend>
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">{(["m2", "ml", "pieza"] as const).map((unidad) =>
      <button key={unidad} type="button" aria-pressed={entrada.unidad === unidad} onClick={() => cambiar({ ...entrada, unidad })}
        className={`${boton} flex-1 capitalize ${entrada.unidad === unidad ? "bg-papel-2" : "bg-papel"}`}>{etiquetaUnidad(unidad)}</button>)}</div>
  </fieldset>;
}

function NombresPieza({ entrada, cambiar }: { entrada: EntradaMaterial; cambiar: (entrada: EntradaMaterial) => void }) {
  return <fieldset className="mt-6"><legend className="titulo text-xl">¿Cómo se llama la pieza?</legend>
    <CampoTexto id="pieza-singular" nombre="Singular (ej. jaladera)" valor={entrada.piezaSingular ?? ""} cambiar={(piezaSingular) => cambiar({ ...entrada, piezaSingular })} />
    <CampoTexto id="pieza-plural" nombre="Plural (ej. jaladeras)" valor={entrada.piezaPlural ?? ""} cambiar={(piezaPlural) => cambiar({ ...entrada, piezaPlural })} />
  </fieldset>;
}

function CampoTexto({ id, nombre, valor, cambiar, autoFocus = false }: { id: string; nombre: string; valor: string; cambiar: (valor: string) => void; autoFocus?: boolean }) {
  return <div className="mt-6"><label className="block font-medium" htmlFor={id}>{nombre}</label>
    <input id={id} autoFocus={autoFocus} className={campo} value={valor} onChange={(e) => cambiar(e.target.value)} />
  </div>;
}

function ErrorCatalogo({ mensaje }: { mensaje: string }) {
  return mensaje ? <p role="alert" className="mt-4 border-l-4 border-rojo pl-3 text-lg text-tinta">{mensaje}</p> : null;
}

function BarraGuardar({ guardar, cancelar, ocupado, progreso }: { guardar: () => void; cancelar: () => void; ocupado: boolean; progreso: string }) {
  return <div className="fixed inset-x-0 bottom-0 border-t-2 border-tinta bg-papel px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
    <div className="mx-auto flex max-w-md gap-2">
      <button type="button" onClick={cancelar} className={`${boton} bg-papel`} disabled={ocupado}>Cancelar</button>
      <button type="button" onClick={guardar} className={`${boton} flex-1 bg-amarillo`} disabled={ocupado}>{progreso || "Guardar"}</button>
    </div>
    <span role="status" className="sr-only">{progreso}</span>
  </div>;
}
