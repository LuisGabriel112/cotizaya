---
name: calculo-cotizacion
description: Reglas de cálculo de cotizaciones de aluminio. Úsala al tocar src/lib/quote, partidas, totales, IVA o descuentos.
---
# Cálculo de cotización

- Todo en centavos (int). Redondea solo al final de cada partida, con half-up.
- Material por m²: (ancho_cm × alto_cm / 10000) × precio × cantidad.
- Material por metro lineal: perímetro en m × precio × cantidad.
- Material por pieza: precio × cantidad.
- Importe de la partida = material + mano de obra × cantidad (la mano de obra es por pieza).
- Subtotal = suma de partidas. El descuento se aplica antes del IVA. IVA de 16 % opcional.
- Cada regla nueva lleva un test en Vitest con un caso real de taller.
- Si una medida es 0 o negativa, marca error en la partida; no calcules.
