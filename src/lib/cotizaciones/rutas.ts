// Las mismas pantallas viven en la app real ("") y en el prototipo ("/demo").

export interface Rutas {
  plan?: string;
  lista: string;
  nueva: string;
  editar: (id: string) => string;
  ver: (id: string) => string;
  publica: (slug: string) => string;
}

export function crearRutas(base: "" | "/demo"): Rutas {
  const lista = `${base}/cotizaciones`;
  return {
    plan: base === "" ? "/plan" : undefined,
    lista,
    nueva: `${lista}/nueva`,
    editar: (id) => `${lista}/${id}/editar`,
    ver: (id) => `${lista}/${id}`,
    publica: (slug) => `${base}/c/${slug}`,
  };
}
