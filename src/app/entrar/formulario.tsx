"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { BarraAccion } from "@/components/ui/barra-accion";
import { Boton } from "@/components/ui/boton";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { formatTelefono, normalizarTelefono } from "@/lib/telefono";
import { continuarConTaller, type Continuacion } from "./acciones";

type Paso = "telefono" | "codigo" | "nombre";

const FORM = "entrar";
const CAMPO = "mt-4 h-16 w-full rounded-sm border-2 border-tinta bg-papel px-4 text-2xl placeholder:text-tinta-2";
const BOTON: Record<Paso, string> = { telefono: "Mandarme el código", codigo: "Entrar", nombre: "Empezar a cotizar" };

const MENSAJES = {
  telefono: "Escribe tu número a 10 dígitos.",
  envio: "No pudimos mandarte el código. Espera un minuto y vuelve a intentarlo.",
  codigo: "Ese código no es. Revisa el mensaje y vuelve a escribirlo.",
  nombre: "Escribe el nombre de tu taller.",
};

interface Contexto {
  texto: string;
  telefono: string;
  setTelefono: (t: string) => void;
  setPaso: (p: Paso) => void;
  setTexto: (t: string) => void;
  seguir: (r: Continuacion) => void;
}

/** Cada paso regresa el mensaje de error, o null si avanzó. */
const PASOS: Record<Paso, (c: Contexto) => Promise<string | null>> = {
  telefono: async ({ texto, setTelefono, setPaso, setTexto }) => {
    const tel = normalizarTelefono(texto);
    if (!tel) return MENSAJES.telefono;
    const { error } = await clienteNavegador().auth.signInWithOtp({ phone: `+${tel}` });
    if (error) return MENSAJES.envio;
    setTelefono(tel);
    setTexto("");
    setPaso("codigo");
    return null;
  },
  codigo: async ({ texto, telefono, seguir }) => {
    const { error } = await clienteNavegador().auth.verifyOtp({ phone: `+${telefono}`, token: texto.trim(), type: "sms" });
    if (error) return MENSAJES.codigo;
    seguir(await continuarConTaller());
    return null;
  },
  nombre: async ({ texto, seguir }) => {
    if (texto.trim().length < 2) return MENSAJES.nombre;
    seguir(await continuarConTaller(texto));
    return null;
  },
};

export function FormularioEntrar({ conSesion }: { conSesion: boolean }) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("telefono");
  const [telefono, setTelefono] = useState("");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const seguir = (r: Continuacion) => (r === "listo" ? router.replace("/cotizaciones") : setPaso("nombre"));

  // Ya entró pero aún no tiene taller (cerró la app a medio camino).
  useEffect(() => {
    if (conSesion) continuarConTaller().then(seguir, () => setPaso("nombre"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [conSesion]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    setError(await PASOS[paso]({ texto, telefono, setTelefono, setPaso, setTexto, seguir }));
    setOcupado(false);
  };
  const cambiarNumero = () => {
    setPaso("telefono");
    setTexto("");
  };

  return (
    <form id={FORM} onSubmit={enviar} noValidate className="mt-8">
      <Campo paso={paso} telefono={telefono} valor={texto} onCambio={setTexto} />
      {error && (
        <p role="alert" className="mt-3 text-lg text-rojo">
          {error}
        </p>
      )}
      {paso === "codigo" && (
        <button type="button" onClick={cambiarNumero} className="mt-4 min-h-14 text-base text-tinta-2 underline">
          Cambiar número
        </button>
      )}
      <BarraAccion>
        <Boton type="submit" form={FORM} disabled={ocupado}>
          {BOTON[paso]}
        </Boton>
      </BarraAccion>
    </form>
  );
}

function Campo({ paso, telefono, valor, onCambio }: { paso: Paso; telefono: string; valor: string; onCambio: (v: string) => void }) {
  const comun = { autoFocus: true, value: valor, onChange: (e: ChangeEvent<HTMLInputElement>) => onCambio(e.target.value), className: CAMPO };
  if (paso === "telefono") {
    return (
      <Etiqueta texto="Tu celular">
        <input {...comun} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="229 000 0000" />
      </Etiqueta>
    );
  }
  if (paso === "codigo") {
    return (
      <Etiqueta texto={`Código que llegó al ${formatTelefono(telefono)}`}>
        <input {...comun} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={`${CAMPO} num tracking-[0.3em]`} />
      </Etiqueta>
    );
  }
  return (
    <Etiqueta texto="¿Cómo se llama tu taller?">
      <input {...comun} autoComplete="organization" maxLength={80} placeholder="Ej. Aluminio y Vidrio El Faro" />
    </Etiqueta>
  );
}

function Etiqueta({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="titulo text-2xl">{texto}</span>
      {children}
    </label>
  );
}
