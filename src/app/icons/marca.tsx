// Ícono provisional: marcador amarillo con "CY" en tinta. Se cambia cuando haya logo.
// ImageResponse no lee CSS, por eso los colores van como valores.
const AMARILLO = "#F2C230";
const TINTA = "#161616";

export function Marca({ size, margen = 0 }: { size: number; margen?: number }) {
  const lado = size - margen * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: AMARILLO,
      }}
    >
      <div
        style={{
          width: lado,
          height: lado,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `${Math.round(lado * 0.04)}px solid ${TINTA}`,
          color: TINTA,
          fontSize: Math.round(lado * 0.5),
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        CY
      </div>
    </div>
  );
}
