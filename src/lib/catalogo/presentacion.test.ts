import { describe, expect, it } from "vitest";
import { precioParaEdicion } from "./edicion";

describe("precioParaEdicion", () => {
  it("pone los centavos en un campo editable", () => {
    expect(precioParaEdicion(148050)).toBe("1480.50");
    expect(precioParaEdicion(50)).toBe("0.50");
  });
});
