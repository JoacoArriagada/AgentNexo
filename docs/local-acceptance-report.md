# Informe de validación local

Fecha: 2026-10-12. Implementación local completada para las cuatro especificaciones
de `specs/`. Las 52 tareas están realizadas; el arranque de contenedores queda sin
verificar porque Docker no está instalado en este equipo. Este informe acredita el
prototipo y los ensayos descritos, no la aceptación de la ERS de producción completa.

## Entrega y trazabilidad

| Módulo | Tareas | Evidencia principal |
| --- | --- | --- |
| 001 Base local | 10/10 | Workspaces, SQLite, contexto demo, shell, builds, Dockerfiles, Compose; `backend/tests/base.test.ts` y reflujo E2E. |
| 002 Catálogo y ofertas | 11/11 | Publicación, versiones, moderación y retirada; `backend/tests/offers.test.ts`, `backend/tests/convergence.test.ts` y recorrido E2E. |
| 003 Contratación y revisión | 19/19 | Entrada, política, financiación, ejecución, presupuestos, informes y ampliación; `backend/tests/reviews.test.ts`, `backend/tests/convergence.test.ts` y E2E. |
| 004 Cierre y operación | 12/12 | Aceptación, cancelación, disputa, arbitraje, plazos, avisos, preferencias y operación; `backend/tests/closure.test.ts` y E2E. |

Cada módulo conserva especificación, aclaraciones, plan, investigación, modelo de datos,
contrato, inicio rápido, tareas y dos listas de calidad. Constitution 1.0.0 y
[`reglamentario.md`](../reglamentario.md) fijan las decisiones autorizadas. El flujo y
las exclusiones de baseline y taskstoissues están en [spec-workflow.md](spec-workflow.md).

Fuentes leídas: `orden-directorios.txt` en la carpeta padre `Stella`, propuesta Word,
ERS vigente y documentación relacionada en `Documentos`, exportaciones locales Figma
00/01/02/03/06/07/08/09 y documentos del repositorio. El árbol no incluía carpetas Figma
04/05. Los Word y las exportaciones originales no se modificaron.

## Comprobaciones ejecutadas

Entorno: Windows, Node 24.18.0, npm 11.16.0, SQLite 3.53.1, Playwright 1.64.0 y
Microsoft Edge. Las versiones directas están fijadas en los manifiestos y lockfile.

| Comprobación | Resultado |
| --- | --- |
| `npm install` | Dependencias y lockfile instalados; auditoría de esa instalación: 0 vulnerabilidades. |
| `npm run build` | Compilación de contratos, backend y frontend aprobada. Incluye comprobación de tipos de ambas aplicaciones. |
| `npm test` | 17 pruebas aprobadas, 0 fallos, con bases SQLite temporales reales. |
| `npm run test:e2e` | 6 recorridos aprobados, 0 fallos; ejecución final en 27,1 segundos. |
| `npm run dev` | Frontend 5173 y API 3001 iniciados con una base aislada. HTTP 200 en frontend, health directo y health a través del proxy. `Ctrl+C` detuvo ambos puertos. |
| Compose y Dockerfiles | Revisión de estructura YAML, red interna, volumen y puerto de navegador limitado a loopback. Arranque real no ejecutado. |

La prueba de arranque usó `.local/quickstart-smoke.sqlite`; los E2E usaron sus propias
bases `.local/e2e-*`. No se ejecutó el reinicio destructivo de la base habitual.
Los procesos de verificación se detuvieron al terminar.

### Backend

Las 17 pruebas comprueban contexto y actores demo, persistencia del seed, publicación
y moderación, snapshots, validación de entradas, autorización invalidada al editar,
idempotencia, importes exactos y reservas en competencia, límite de capacidad, cierre
único T1–T10, fronteras temporales con reloj controlado, pausa operativa y recuperación
de checkpoints tras reinicio. También cubren incertidumbre de pago, recuperación de
la misma entrega, supresión de contenido, retirada de ofertas y aceptación de ampliaciones.

Los informes se construyen sobre el texto recibido: las citas identifican archivos y
líneas existentes; los casos propuestos indican `executed: false`. Una coincidencia
aislada de palabras no demuestra un criterio de negocio.

### Navegador

1. Subir código propio, aceptar condiciones, financiar e iniciar, descargar JSON/Markdown,
   comprobar cita de `eval` en la línea 2, ampliar presupuesto con nueva aceptación y
   liberar el precio simulado.
2. Crear y enviar oferta, aprobarla como administradora, verla en catálogo y retirarla
   como proveedor, conservando las contrataciones anteriores.
3. Abrir disputa, responder como proveedor y resolver con devolución total como árbitra.
4. Usar el salto al contenido con teclado y verificar ausencia de desbordamiento horizontal
   del catálogo y formulario a 320, 375, 414, 768 y 1440 píxeles.
5. Cancelar antes del inicio, consultar y marcar avisos, abrir su origen y guardar zona
   horaria UTC, conservándola al recargar y mostrando las fechas con esa preferencia.
6. Ejecutar DEMO-01, conciliar un pago incierto y recuperar una entrega fallida sin
   crear nuevas identidades de operación.

Las capturas de catálogo de escritorio/móvil y formulario móvil se inspeccionaron
visualmente en `.artifacts/screens/`. No se declara una auditoría completa de accesibilidad
ni compatibilidad con todos los navegadores.

## Hallazgos corregidos

- La evaluación de criterios es conservadora: proposiciones que las reglas no pueden
  demostrar permanecen `no_evaluado`.
- El proveedor puede retirar una oferta de nuevas ventas sin modificar órdenes existentes.
- La ampliación de presupuesto exige una nueva aceptación; preserva entrada, precio,
  reservas, consumos y vencimientos, además del snapshot original de contratación.
- La supresión elimina el contenido de checkpoints y respuestas idempotentes; una
  repetición antigua no lo restaura ni vuelve a ejecutar la creación.
- La revisión privada y el perfil experimental sólo se combinan con contextos compatibles.
- La cancelación sin financiación registra movimiento cero; un déficit impide nuevo gasto.

## Límites de la verificación

Docker no está instalado: queda pendiente ejecutar `docker compose up --build` y
comprobar el ciclo de vida de los contenedores y su volumen. Los archivos están
preparados; la prueba nativa no reemplaza esa comprobación.

El análisis es determinista y local. Modelo, financiación, garantía y compras A/B son
simulados; no se conectaron LLM, Stellar, Soroban ni x402 reales. No hay login, credenciales,
dominio, Redis, PostgreSQL, S3 ni servicios distribuidos. No se evaluaron precisión de IA,
rendimiento comercial, usuarios humanos ni controles de exposición pública.

Los cambios permanecen en el directorio de trabajo, sin commits, push, despliegue externo
ni issues remotas. Se conservaron los cambios que ya existían en el repositorio.
