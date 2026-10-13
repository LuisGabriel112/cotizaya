import { describe, expect, it } from "vitest";
import type { Taller } from "@/lib/cotizaciones/tipos";
import { avisoDeCupo, calcularCupo, cupoAgotado, CupoAgotado, LIMITE_GRATIS, planVigente } from "./cupo";

type PlanTaller = Pick<Taller, "plan" | "planHasta">;

const GRATIS: PlanTaller = { plan: "gratis" };
// 13 de octubre de 2026, mediodía en Veracruz (UTC-6).
const HOY = new Date("2026-10-13T18:00:00Z");

const creadas = (n: number, iso = "2026-10-05T16:00:00Z") => Array.from({ length: n }, () => ({ creadaEn: iso }));

describe("planVigente", () => {
  it("gratis nunca es plan de pago", () => {
    expect(planVigente({ plan: "gratis", planHasta: "2030-01-01" }, HOY)).toBe(false);
  });

  it("fundador con fecha futura o sin fecha está vigente", () => {
    expect(planVigente({ plan: "fundador", planHasta: "2026-11-30" }, HOY)).toBe(true);
    expect(planVigente({ plan: "fundador" }, HOY)).toBe(true);
  });

  it("fundador vencido ya no cuenta", () => {
    expect(planVigente({ plan: "fundador", planHasta: "2026-09-30" }, HOY)).toBe(false);
  });

  it("el último día pagado sigue vigente en hora de Veracruz", () => {
    // 30 de septiembre, 21:00 en Veracruz; en UTC ya es 1 de octubre.
    const noche = new Date("2026-10-01T03:00:00Z");
    expect(planVigente({ plan: "fundador", planHasta: "2026-09-30" }, noche)).toBe(true);
  });
});

describe("calcularCupo", () => {
  it("cuenta solo las del mes en curso", () => {
    const delMesPasado = creadas(5, "2026-09-20T16:00:00Z");
    expect(calcularCupo(GRATIS, [...delMesPasado, ...creadas(2)], HOY)).toEqual({
      tipo: "limitado",
      usadas: 2,
      restantes: 3,
      renuevaEl: "2026-11-01",
    });
  });

  it("el mes se corta en hora de Veracruz, no en UTC", () => {
    // 31 de octubre 23:30 en Veracruz.
    const ultimaDeOctubre = creadas(1, "2026-11-01T05:30:00Z");
    expect(calcularCupo(GRATIS, ultimaDeOctubre, new Date("2026-11-15T18:00:00Z"))).toMatchObject({ usadas: 0 });
    expect(calcularCupo(GRATIS, ultimaDeOctubre, new Date("2026-10-31T18:00:00Z"))).toMatchObject({ usadas: 1 });
  });

  it("los restantes nunca son negativos", () => {
    expect(calcularCupo(GRATIS, creadas(LIMITE_GRATIS + 2), HOY)).toMatchObject({ usadas: 7, restantes: 0 });
  });

  it("en diciembre se renueva el 1 de enero del año siguiente", () => {
    expect(calcularCupo(GRATIS, [], new Date("2026-12-10T18:00:00Z"))).toMatchObject({ renuevaEl: "2027-01-01" });
  });

  it("fundador vigente no tiene límite", () => {
    expect(calcularCupo({ plan: "fundador", planHasta: "2026-11-30" }, creadas(9), HOY)).toEqual({ tipo: "ilimitado" });
  });

  it("fundador vencido vuelve al límite gratis", () => {
    expect(calcularCupo({ plan: "fundador", planHasta: "2026-09-30" }, creadas(5), HOY)).toMatchObject({ tipo: "limitado", restantes: 0 });
  });
});

describe("avisoDeCupo y cupoAgotado", () => {
  const cupo = (usadas: number) => calcularCupo(GRATIS, creadas(usadas), HOY);

  it("callado mientras sobran más de 2", () => {
    expect(avisoDeCupo(cupo(2))).toBeNull();
    expect(cupoAgotado(cupo(2))).toBe(false);
  });

  it("avisa cuando faltan 2, en plural", () => {
    expect(avisoDeCupo(cupo(3))).toBe("Te quedan 2 cotizaciones este mes en el plan gratis.");
  });

  it("avisa cuando falta 1, en singular", () => {
    expect(avisoDeCupo(cupo(4))).toBe("Te queda 1 cotización este mes en el plan gratis.");
    expect(cupoAgotado(cupo(4))).toBe(false);
  });

  it("agotado dice cuándo se renueva", () => {
    expect(avisoDeCupo(cupo(5))).toBe("Ya usaste tus 5 cotizaciones de este mes. Se renuevan el 1 de noviembre.");
    expect(cupoAgotado(cupo(5))).toBe(true);
  });

  it("ilimitado no avisa ni se agota", () => {
    expect(avisoDeCupo({ tipo: "ilimitado" })).toBeNull();
    expect(cupoAgotado({ tipo: "ilimitado" })).toBe(false);
  });
});

describe("CupoAgotado", () => {
  it("es un Error reconocible por nombre", () => {
    const e = new CupoAgotado();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("CupoAgotado");
  });
});
