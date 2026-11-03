interface Ventana {opener:unknown;location:{href:string};close:()=>void}
export async function compartirConfirmado(abrir:()=>Ventana|null,emitir:()=>void|Promise<void>,destino:string):Promise<void> {
  const ventana=abrir();
  if(!ventana)throw new Error("permite-la-ventana-de-whatsapp");
  ventana.opener=null;
  try{await emitir();ventana.location.href=destino;}
  catch(error){ventana.close();throw error;}
}
