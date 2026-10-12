# Quickstart: Base local

1. `npm ci`; `npm run build`; `npm test` desde raíz con Node24.
2. `docker compose up --build` cuando Docker esté disponible.
3. Abrir puerto localhost documentado en README; comprobar banner demo y catálogo.
4. Cambiar visitante/comprador/proveedor/admin sin credenciales.
5. Crear un dato mediante módulo siguiente; reiniciar conjunto; comprobar conservación.
6. Confirmar que actor desconocido y datos inválidos no cambian almacenamiento.

Resultado esperado: app local, roles demo, persistencia, cero llamadas externas obligatorias.
Docker no disponible en entorno del 2026-10-12: registrar arranque pendiente de ejecución.
