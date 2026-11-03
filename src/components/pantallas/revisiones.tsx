"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import { historialCotizacion } from "@/app/(app)/acciones";
import { useFuente } from "@/lib/cotizaciones/fuente";
import { formatFolio } from "@/lib/format";

export function AccionRevision({id}:{id:string}) {
  const {acciones,rutas}=useFuente(); const router=useRouter();
  const [ocupada,setOcupada]=useState(false),[error,setError]=useState("");
  const crear=async()=>{
    if(!acciones.revisar || ocupada)return;
    setOcupada(true);setError("");
    try {router.push(rutas.editar(await acciones.revisar(id)));}
    catch {setError("No se creó la revisión. Revisa tu cupo, los materiales y si ya hay otra versión en el historial.");}
    finally {setOcupada(false);}
  };
  if(!acciones.revisar)return null;
  return <div><button type="button" onClick={crear} disabled={ocupada} className="inline-flex min-h-14 items-center font-semibold underline disabled:opacity-50">{ocupada?"Preparando revisión…":"Crear o continuar revisión"}</button>
    <p className="text-base text-tinta-2">Se copia con los precios actuales del catálogo. La oferta anterior se conserva.</p>
    {error&&<p role="alert" className="text-tinta">{error}</p>}</div>;
}

export function HistorialRevisiones({id}:{id:string}) {
  const {acciones,rutas}=useFuente();
  const [versiones,setVersiones]=useState<Awaited<ReturnType<typeof historialCotizacion>>>([]);
  const [error,setError]=useState(false);
  useEffect(()=>{
    if(!acciones.revisar)return;
    let activo=true;
    historialCotizacion(id).then(v=>{if(activo)setVersiones(v);}).catch(()=>{if(activo)setError(true);});
    return()=>{activo=false;};
  },[id,acciones.revisar]);
  if(error)return <p role="alert" className="mt-4">No se pudo cargar el historial. Recarga la página.</p>;
  if(versiones.length<2)return null;
  return <nav aria-label="Historial de revisiones" className="mt-5 border-y-2 border-tinta py-3">
    <h2 className="titulo text-xl">Historial de esta cotización</h2>
    <ol>{versiones.map(v=><li key={v.id}><Link href={rutas.ver(v.id)} aria-current={v.id===id?"page":undefined} className="inline-flex min-h-14 items-center gap-2 underline"><span className="num">No. {formatFolio(v.folio)}</span><span>{v.estado}{v.id===id?" · esta versión":""}</span></Link></li>)}</ol>
  </nav>;
}
