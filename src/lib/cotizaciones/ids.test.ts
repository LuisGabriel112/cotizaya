import { describe, expect, it } from "vitest";
import { nuevoUuid } from "./ids";

describe("nuevoUuid", () => {
  it("genera un UUID v4 válido para Postgres", () => {
    expect(nuevoUuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("no repite", () => {
    const ids = new Set(Array.from({ length: 500 }, () => nuevoUuid()));
    expect(ids.size).toBe(500);
  });

  it("usa la fuente de azar que se le pase", () => {
    const ceros = (b: Uint8Array) => b.fill(0);
    expect(nuevoUuid(ceros)).toBe("00000000-0000-4000-8000-000000000000");
  });
});
