"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Boton, clasesBoton } from "@/components/ui/boton";
import { activarPlan, altaTaller, editarDatos, importarCatalogo, subirLogo, type Resultado } from "./acciones";

const CAMPO = "mt-1 min-h-14 w-full rounded-sm border-2 border-tinta bg-papel px-3 text-lg";

type Accion = (previo: Resultado | null, form: FormData) => Promise<Resultado>;

function Formulario({ accion, boton, children }: { accion: Accion; boton: string; children: ReactNode }) {
  const [resultado, enviar, enviando] = useActionState(accion, null);
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {children}
      <Boton type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : boton}
      </Boton>
      {resultado && <Aviso resultado={resultado} />}
    </form>
  );
}

function Aviso({ resultado }: { resultado: Resultado }) {
  return (
    <div role={resultado.ok ? "status" : "alert"} className={`border-2 bg-papel-2 px-4 py-3 text-lg ${resultado.ok ? "border-verde" : "border-rojo"}`}>
      <p>{resultado.mensaje}</p>
      {resultado.errores && (
        <ul className="mt-1 text-base text-tinta-2">
          {resultado.errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-semibold">{etiqueta}</span>
      {children}
    </label>
  );
}

export function FormularioAlta() {
  return (
    <Formulario accion={altaTaller} boton="Dar de alta">
      <CamposDatos nombre="" ciudad="" condiciones="" />
      <Campo etiqueta="Celular del dueño">
        <input name="telefono" type="tel" inputMode="tel" required placeholder="229 000 0000" className={CAMPO} />
      </Campo>
    </Formulario>
  );
}

function CamposDatos({ nombre, ciudad, condiciones }: { nombre: string; ciudad: string; condiciones: string }) {
  return (
    <>
      <Campo etiqueta="Nombre del taller">
        <input name="nombre" required maxLength={80} defaultValue={nombre} className={CAMPO} />
      </Campo>
      <Campo etiqueta="Ciudad">
        <input name="ciudad" maxLength={80} defaultValue={ciudad} className={CAMPO} />
      </Campo>
      <Campo etiqueta="Condiciones de pago">
        <textarea name="condiciones" maxLength={300} rows={2} defaultValue={condiciones} placeholder="50 % de anticipo, resto al instalar." className={`${CAMPO} py-2`} />
      </Campo>
    </>
  );
}

export function FormularioDatos({ taller, nombre, ciudad, condiciones }: { taller: string; nombre: string; ciudad: string; condiciones: string }) {
  return (
    <Formulario accion={editarDatos.bind(null, taller)} boton="Guardar datos">
      <CamposDatos nombre={nombre} ciudad={ciudad} condiciones={condiciones} />
    </Formulario>
  );
}

export function FormularioLogo({ taller }: { taller: string }) {
  const [archivo, setArchivo] = useState("Ningún archivo elegido");
  return (
    <Formulario accion={subirLogo.bind(null, taller)} boton="Subir logo">
      <div>
        <p className="font-semibold">Logo (PNG, JPG o WebP, hasta 500 KB)</p>
        <input id="logo-archivo" name="logo" type="file" accept="image/png,image/jpeg,image/webp" required className="peer sr-only" onChange={(evento) => setArchivo(evento.currentTarget.files?.[0]?.name ?? "Ningún archivo elegido")} />
        <label htmlFor="logo-archivo" className={clasesBoton("secundario", "mt-2 cursor-pointer peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tinta")}>
          Elegir imagen
        </label>
        <p className="mt-2 break-all text-base text-tinta-2" aria-live="polite">{archivo}</p>
      </div>
    </Formulario>
  );
}

export function FormularioCatalogo({ taller }: { taller: string }) {
  return (
    <Formulario accion={importarCatalogo.bind(null, taller)} boton="Importar catálogo">
      <Campo etiqueta="Pega el CSV con columnas clave, nombre, linea, unidad, precio">
        <textarea
          name="csv"
          required
          rows={8}
          spellCheck={false}
          placeholder={'clave,nombre,linea,unidad,precio\ncorrediza-3,Corrediza 3" natural,3",m2,"2,150.00"'}
          className={`${CAMPO} num py-2 text-base`}
        />
      </Campo>
    </Formulario>
  );
}

export function FormularioPlan({ taller, plan, hasta }: { taller: string; plan: "gratis" | "fundador"; hasta: string | null }) {
  return (
    <Formulario accion={activarPlan.bind(null, taller)} boton="Guardar plan">
      <Campo etiqueta="Plan">
        <select name="plan" defaultValue={plan} className={CAMPO}>
          <option value="gratis">Gratis (5 al mes)</option>
          <option value="fundador">Fundador</option>
        </select>
      </Campo>
      <Campo etiqueta="Activo hasta (solo fundador)">
        <input name="hasta" type="date" defaultValue={hasta ?? ""} className={CAMPO} />
      </Campo>
    </Formulario>
  );
}
