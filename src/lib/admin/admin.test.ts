import { describe, expect, it } from "vitest";
import { aFilasMaterial, esquemaAlta, esquemaDatos, esquemaPlan, rutaDeLogo, validarLogo } from ".";

describe("esquemaAlta", () => {
  it("normaliza el teléfono del dueño y limpia espacios", () => {
    const alta = esquemaAlta.parse({ nombre: "  Vidrios Boca ", telefono: "229 111 2222", ciudad: "Boca del Río", condiciones: "" });
    expect(alta).toEqual({ nombre: "Vidrios Boca", ownerPhone: "522291112222", ciudad: "Boca del Río", condiciones: "" });
  });

  it.each([
    [{ nombre: "", telefono: "2291112222" }, "nombre"],
    [{ nombre: "Vidrios", telefono: "22911" }, "telefono"],
  ])("rechaza %j", (datos, campo) => {
    const r = esquemaAlta.safeParse({ ciudad: "", condiciones: "", ...datos });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual([campo]);
  });
});

describe("esquemaDatos", () => {
  it("limpia espacios y no pide teléfono", () => {
    expect(esquemaDatos.parse({ nombre: " Taller Joshi ", ciudad: " Veracruz ", condiciones: " 50% " })).toEqual({ nombre: "Taller Joshi", ciudad: "Veracruz", condiciones: "50%" });
  });

  it.each([
    [{ nombre: "  " }, "nombre"],
    [{ nombre: "X", ciudad: "c".repeat(81) }, "ciudad"],
    [{ nombre: "X", condiciones: "c".repeat(301) }, "condiciones"],
  ])("rechaza %j", (datos, campo) => {
    const r = esquemaDatos.safeParse({ ciudad: "", condiciones: "", ...datos });
    expect(r.error?.issues[0]?.path).toEqual([campo]);
  });
});

describe("esquemaPlan", () => {
  it("fundador necesita fecha; gratis la deja vacía", () => {
    expect(esquemaPlan.parse({ plan: "fundador", hasta: "2027-10-12" })).toEqual({ plan: "fundador", hasta: "2027-10-12" });
    expect(esquemaPlan.parse({ plan: "gratis", hasta: "" })).toEqual({ plan: "gratis", hasta: null });
    expect(esquemaPlan.safeParse({ plan: "fundador", hasta: "" }).success).toBe(false);
    expect(esquemaPlan.safeParse({ plan: "premium", hasta: "2027-01-01" }).success).toBe(false);
    expect(esquemaPlan.safeParse({ plan: "fundador", hasta: "12/10/2027" }).success).toBe(false);
  });
});

describe("aFilasMaterial", () => {
  it("convierte lo leído del CSV a filas del taller, con pieza si viene", () => {
    const filas = aFilasMaterial("w1", [
      { clave: "c3", nombre: "Corrediza 3", linea: '3"', unidad: "m2", precioCentavos: 215_000 },
      { clave: "felpa", nombre: "Felpa", linea: "", unidad: "pieza", precioCentavos: 18_000, pieza: ["hoja", "hojas"] },
    ]);
    expect(filas).toEqual([
      { workshop_id: "w1", clave: "c3", nombre: "Corrediza 3", linea: '3"', unidad: "m2", precio_centavos: 215_000, pieza_singular: null, pieza_plural: null },
      { workshop_id: "w1", clave: "felpa", nombre: "Felpa", linea: "", unidad: "pieza", precio_centavos: 18_000, pieza_singular: "hoja", pieza_plural: "hojas" },
    ]);
  });
});

describe("logo", () => {
  it("acepta PNG, JPG o WebP de hasta 500 KB", () => {
    expect(validarLogo({ type: "image/png", size: 120_000 })).toBeNull();
    expect(validarLogo({ type: "image/webp", size: 500 * 1024 })).toBeNull();
  });

  it("explica por qué no", () => {
    expect(validarLogo({ type: "image/svg+xml", size: 1_000 })).toBe("Sube el logo en PNG, JPG o WebP.");
    expect(validarLogo({ type: "image/png", size: 500 * 1024 + 1 })).toBe("El logo pesa más de 500 KB. Redúcelo y vuelve a subirlo.");
    expect(validarLogo({ type: "image/png", size: 0 })).toBe("Elige un archivo.");
  });

  it("guarda cada logo en la carpeta del taller con nombre nuevo para no pelear con la caché", () => {
    expect(rutaDeLogo("w1", "image/jpeg", "abc")).toBe("w1/abc.jpg");
    expect(rutaDeLogo("w1", "image/webp", "x")).toBe("w1/x.webp");
  });
});
