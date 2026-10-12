# Validación del prototipo local

Plan del orquestador, 2026-10-12. Complementa las especificaciones de `specs/` y el
contrato de [API local](local-api-contract.md). El alcance es un prototipo local;
las pruebas de este cambio no acreditan integraciones blockchain o inferencia remota.

## Entorno y arranque

- Node disponible: 24.18.0; npm: 11.16.0; SQLite embebido comprobado: 3.53.1.
- Workspaces: `frontend/`, `backend/` y `packages/api-contracts/`.
- Desarrollo: frontend en `127.0.0.1:5173`; API en `127.0.0.1:3001`.
- Compose: navegador en `http://localhost:8080`, frontend estático con proxy `/api`,
  backend en red interna y volumen para SQLite. No hay formulario de acceso ni `.env`
  obligatorio. No se publican puertos de base de datos ni servicios externos.
- Docker no está instalado en el equipo de esta revisión. Se verificará la estructura
  del manifiesto; no se declarará probado un arranque de contenedores sin ejecutarlo.

## Comprobaciones de implementación

1. Instalación con lockfile, tipos estrictos y build de contratos y ambas aplicaciones.
2. Backend con base SQLite temporal real, sin tocar datos del usuario. Casos de frontera
   de archivos, roles demo, oferta congelada, aceptación invalidada, idempotencia,
   presupuesto exacto, cierre único y T1–T10 con reloj controlado.
3. Recorrido HTTP completo: catálogo → encargo → política → aceptación → orden →
   financiación simulada → revisión de la entrada → informe descargable → cierre.
4. Recorrido de proveedor y administración: oferta → moderación → venta → respuesta
   a disputa → resolución por árbitro. Un proveedor no recibe archivos privados.
5. Reiniciar el backend conservando la misma base y comprobar recuperación de datos.
6. Navegador: compra/revisión/informe, preferencias, cambio de actor y los estados
   relevantes. Reflujo a 320, 375, 414, 768 y 1440 px y controles utilizables por teclado.

## Fuentes técnicas consultadas

Las versiones directas se contrastaron con el registro npm el 2026-10-12. Se empleará
un lockfile para conservar el conjunto realmente instalado. Referencias:
[Spec Kit](https://github.com/dceoy/speckit-agent-skills),
[Node SQLite](https://nodejs.org/api/sqlite.html),
[Vite](https://vite.dev/guide/),
[Compose y healthchecks](https://docs.docker.com/compose/how-tos/startup-order/).

El informe final registrará cada comando ejecutado y su resultado, separando errores
resueltos, verificaciones aprobadas y capacidades externas fuera de este alcance.
