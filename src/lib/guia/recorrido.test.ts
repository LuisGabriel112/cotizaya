import { describe, expect, it } from "vitest";
import type { Paso } from "./pasos";
import { avanzar, colocar, desplazamiento, leerVistas, marcarVista, pasosPresentes, recorte, retroceder, rotuloPaso, serializarVistas } from "./recorrido";

const paso = (objetivo: string): Paso => ({ objetivo, titulo: objetivo, texto: `Texto de ${objetivo}` });
const PANTALLA = { width: 360, height: 740 };

describe("pasos presentes", () => {
  it("omite los pasos cuyo elemento no está en pantalla, sin cambiar el orden", () => {
    const pasos = [paso("nueva"), paso("precios"), paso("fila")];
    expect(pasosPresentes(pasos, (o) => o !== "precios").map((p) => p.objetivo)).toEqual(["nueva", "fila"]);
  });

  it("sin ningún elemento no queda guía", () => {
    expect(pasosPresentes([paso("nueva")], () => false)).toEqual([]);
  });
});

describe("avanzar y retroceder", () => {
  it("avanza al siguiente paso", () => {
    expect(avanzar(0, 3)).toBe(1);
  });

  it("después del último paso, termina", () => {
    expect(avanzar(2, 3)).toBe("fin");
  });

  it("regresa uno, pero no antes del primero", () => {
    expect(retroceder(2)).toBe(1);
    expect(retroceder(0)).toBe(0);
  });

  it("el rótulo cuenta desde 1", () => {
    expect(rotuloPaso(0, 4)).toBe("1 de 4");
    expect(rotuloPaso(3, 4)).toBe("4 de 4");
  });
});

describe("recorte del oscurecido", () => {
  it("abre un hueco con margen alrededor del elemento", () => {
    const { hueco } = recorte({ top: 100, left: 20, width: 200, height: 56 }, PANTALLA, 8);
    expect(hueco).toEqual({ top: 92, left: 12, width: 216, height: 72 });
  });

  it("el hueco no se sale de la pantalla", () => {
    const { hueco } = recorte({ top: 700, left: 0, width: 360, height: 56 }, PANTALLA, 8);
    expect(hueco).toEqual({ top: 692, left: 0, width: 360, height: 48 });
  });

  it("cuatro tapas cubren todo menos el hueco", () => {
    const { tapas } = recorte({ top: 100, left: 20, width: 200, height: 56 }, PANTALLA, 8);
    expect(tapas).toEqual([
      { top: 0, left: 0, width: 360, height: 92 },
      { top: 164, left: 0, width: 360, height: 576 },
      { top: 92, left: 0, width: 12, height: 72 },
      { top: 92, left: 228, width: 132, height: 72 },
    ]);
    const area = tapas.reduce((suma, t) => suma + t.width * t.height, 0);
    expect(area + 216 * 72).toBe(360 * 740);
  });
});

describe("dónde va la hoja de la guía: siempre abajo, al alcance del pulgar", () => {
  it("pegada abajo si el elemento queda arriba de ella", () => {
    expect(colocar({ top: 80, left: 0, width: 360, height: 60 }, PANTALLA, 300, 16)).toEqual({ lado: "abajo", bottom: 16 });
  });

  it("justo encima del elemento si el elemento está abajo, como la barra de acción", () => {
    expect(colocar({ top: 664, left: 0, width: 360, height: 72 }, PANTALLA, 300, 16)).toEqual({ lado: "encima", bottom: 92 });
  });

  it("si tampoco cabe encima, se queda pegada abajo: nunca se sale de la pantalla", () => {
    expect(colocar({ top: 150, left: 0, width: 360, height: 300 }, PANTALLA, 300, 16)).toEqual({ lado: "abajo", bottom: 16 });
  });

  it("encima también cuando el elemento queda a media pantalla y no cabe debajo", () => {
    expect(colocar({ top: 400, left: 0, width: 360, height: 100 }, PANTALLA, 300, 16)).toEqual({ lado: "encima", bottom: 356 });
  });
});

describe("cuánto desplazar para que el elemento y la hoja quepan", () => {
  it("nada si ya cabe abajo", () => {
    expect(desplazamiento({ top: 80, left: 0, width: 360, height: 60 }, PANTALLA, 300, 16)).toBe(0);
  });

  it("nada si cabe encima del elemento, aunque sea fijo como la barra", () => {
    expect(desplazamiento({ top: 664, left: 0, width: 360, height: 72 }, PANTALLA, 300, 16)).toBe(0);
  });

  it("un elemento que se sale por arriba baja de una sola vez hasta el margen", () => {
    expect(desplazamiento({ top: -100, left: 8, width: 344, height: 72 }, PANTALLA, 288, 16)).toBe(-116);
  });

  it("un elemento que se sale por abajo sube de una sola vez", () => {
    expect(desplazamiento({ top: 700, left: 8, width: 344, height: 120 }, PANTALLA, 288, 16)).toBe(684);
  });

  it("un elemento alto a media pantalla sube hasta arriba para dejar la hoja abajo sin taparlo", () => {
    expect(desplazamiento({ top: 220, left: 8, width: 344, height: 299 }, PANTALLA, 288, 16)).toBe(204);
  });
});

describe("guías vistas", () => {
  it("lee la lista guardada", () => {
    expect(leerVistas('["lista","medida"]')).toEqual(["lista", "medida"]);
  });

  it("sin nada guardado, o con basura, no hay ninguna vista", () => {
    expect(leerVistas(null)).toEqual([]);
    expect(leerVistas("{no es json")).toEqual([]);
    expect(leerVistas('{"lista":true}')).toEqual([]);
  });

  it("ignora ids que ya no existen", () => {
    expect(leerVistas('["lista","vieja",3]')).toEqual(["lista"]);
  });

  it("marcar una vista no la repite", () => {
    expect(marcarVista(["lista"], "captura")).toEqual(["lista", "captura"]);
    expect(marcarVista(["lista"], "lista")).toEqual(["lista"]);
  });

  it("se guarda como JSON que se vuelve a leer igual", () => {
    expect(leerVistas(serializarVistas(["plan", "precios"]))).toEqual(["plan", "precios"]);
  });
});
