export function crearConfirmaciones(alFallar:()=>void=()=>{}) {
  const pendientes=new Map<string,Promise<boolean>[]>();
  const confirmar=async(id:string)=>{
    const lote=pendientes.get(id)??[];pendientes.delete(id);
    if((await Promise.all(lote)).some(ok=>!ok))throw new Error("cambios-sin-confirmar");
  };
  return {
    agregar(id:string,promesa:Promise<unknown>|void){
      const resultado=Promise.resolve(promesa).then(()=>true,()=>{alFallar();return false;});
      pendientes.set(id,[...(pendientes.get(id)??[]),resultado]);
    },
    confirmar,
    confirmarTodas:()=>Promise.all([...pendientes.keys()].map(confirmar)),
  };
}
