# Vista previa de CotizaYa en laguna

Solo visualización: landing y /demo con datos ficticios en localStorage de cada navegador.
No usa Supabase, Mercado Pago, correo ni datos productivos. El proxy rechaza POST y API,
y dirige registro/administración/plan a la demo. No es un staging funcional autenticado.

Desde la raíz del proyecto, en laguna:

```bash
docker compose -f deploy/preview/compose.yaml up -d --build --wait
docker compose -f deploy/preview/compose.yaml ps
```

Entradas: http://100.113.167.30:3100/ y http://100.113.167.30:3100/demo/cotizaciones.
Solo se publica en 127.0.0.1 y la IP Tailscale. No cambiar firewall, red externa ni SMTP.
El contenedor Node no publica puerto propio en el host.

No copiar archivos .env al servidor de preview. El Dockerfile usa valores ficticios
deliberadamente sin conexión a servicios externos y .dockerignore excluye .env*.
El código subido con git archive no contiene archivos sin versionar ni secretos locales.

Los datos demo son locales al navegador; para reiniciarlos usa Reiniciar demo o borra
su almacenamiento. El enlace público de ejemplo funciona dentro de /demo/c/.
El modo autenticado, cobros, PDF real de servidor y revisiones con historial requieren
el staging de pruebas autorizado descrito en docs/OPERACION_PILOTO.md.

HTTP interno permite revisar la UI. Instalar la PWA desde otro dispositivo requiere
HTTPS, que queda fuera de esta vista previa. No hay publicación de dominio ni túnel público.
