# AgentNexo

Prototipo local de un catálogo de revisiones estáticas, con contratación, presupuesto,
informes y resolución de entregas. Implementado el 12 de octubre de 2026 siguiendo
[Spec Kit](docs/spec-workflow.md), la ERS y las exportaciones locales de Figma.

## Arranque

Con Docker Desktop o Docker Engine y Compose disponibles, desde la raíz:

```powershell
docker compose up --build
```

Abre http://localhost:8080. No necesitas `.env`, cuenta, contraseña, wallet ni credenciales.
Compose conserva los datos en el volumen `agentnexo-data`. `docker compose down` detiene
los servicios y conserva ese volumen. La primera construcción necesita Internet para
obtener imágenes y dependencias; el prototipo funciona después sin servicios externos.

**Verificación Docker:** los archivos y su estructura están revisados, pero el arranque
real de contenedores no se pudo probar en este equipo porque Docker no está instalado.
La aplicación se verificó de forma nativa con Node, SQLite y navegador.

### Alternativa nativa comprobada

Requiere Node 24.18 o posterior de la rama 24 y npm 11 o posterior.

```powershell
npm ci
npm run dev
```

Abre http://127.0.0.1:5173. API: http://127.0.0.1:3001/api/v1/health.
La base se crea en `.local/agentnexo.sqlite`; reiniciar conserva datos y operaciones.
`Ctrl+C` detiene ambos procesos. Puedes iniciar cada aplicación por separado con
`npm run dev:frontend` y `npm run dev:backend`, después de compilar contratos mediante
`npm run build -w @agentnexo/api-contracts`.

Para volver a los datos iniciales de la ejecución nativa, detén la aplicación y ejecuta
`npm run demo:reset -- --confirm`. Ese comando elimina sólo la base demo predeterminada;
no afecta bases configuradas con `DB_PATH` ni el volumen de Compose.

## Recorrido sugerido

1. Como **Visitante**, consulta catálogo, perfiles, precios y límites.
2. Elige **Ana · Compradora** en el selector. Prepara un encargo privado con uno a tres
   archivos JS/TS, o carga el ejemplo. Revisa y acepta explícitamente las condiciones.
3. Crea la contratación, confirma el depósito simulado e inicia la revisión.
4. Consulta Resumen, Gastos, Actividad e Informe; exporta Markdown o JSON. Acepta la
   entrega o abre una disputa compartiendo sólo la evidencia que escribas.
5. Como **Marcos · Proveedor**, publica/versiona/retira ofertas y responde disputas.
   Como **Rocío · Administradora y árbitra**, modera publicaciones o resuelve disputas.
6. Para probar herramientas A/B, selecciona **DEMO-01** y la oferta experimental de dos
   roles. Usa el fixture público fijo. Antes de contratar puedes elegir incertidumbre,
   pago sin entrega o precio excesivo; Gastos permite conciliar y recuperar la misma
   operación sin volver a comprarla.

También funcionan las ampliaciones de límites con nueva aceptación, cancelación,
reclamaciones por plazo, archivo/supresión de contenido, avisos, preferencias y pausa
operativa. La selección de actor es una herramienta de demostración, no autenticación.

## Qué es real y qué se simula

Los formularios, API, SQLite, versiones, estados, reservas, permisos por actor demo,
descargas e informes funcionan. El analizador aplica reglas al texto que recibe,
con archivo y línea; nunca ejecuta ni importa el código. Admite hasta 3 archivos,
1.000 líneas y 256 KiB combinados. Los casos de prueba del informe son **propuestos,
no ejecutados**; los criterios que no puede demostrar permanecen **no evaluados**.

El modelo, la financiación, la garantía, los recibos y las compras A/B son simulaciones
locales. No hay inferencia remota ni transacciones Stellar/x402, fondos reales o contrato
Soroban. USD, USDC de prueba y XLM de prueba conservan sus bolsas separadas; el precio
retenido tampoco se usa para financiar consumo. No se declara validada la ERS de
producción ni el valor de dos agentes. [Reglamentario](reglamentario.md).

## Organización

```text
frontend/                React, Vite y módulos por funcionalidad
backend/                 API Express, módulos, DTO, servicios y SQLite
packages/api-contracts/   Tipos y contratos públicos, sin infraestructura de servidor
specs/001-base-local/
specs/002-catalogo-ofertas/
specs/003-contratacion-revision/
specs/004-cierre-operacion/
tests/e2e/               Recorridos en navegador sobre una base aislada
```

Cada aplicación tiene manifiesto y build propio; comparten contratos portables y un
lockfile npm. No hay microservicios, PostgreSQL, Redis, S3 ni configuración de secretos.

## Comprobaciones

```powershell
npm run build
npm test
npm run test:e2e
```

En Windows, E2E usa Microsoft Edge instalado. En Linux utiliza Chromium de Playwright:
instálalo una vez con `npx playwright install chromium`. Los E2E levantan API en 3101 y
frontend en 5174, con una base temporal diferente de tus datos. La evidencia y los
límites de comprobación están en [la validación local](docs/local-acceptance-report.md).

## Documentación

- [Constitución](.specify/memory/constitution.md) y [reglamentario](reglamentario.md).
- [Cuatro módulos y flujo Spec Kit](docs/spec-workflow.md).
- [Contrato API local](docs/local-api-contract.md) y [diseño frontend](docs/frontend-local-design.md).
- [Análisis y convergencia](docs/specification-analysis.md).

La propuesta Word y la ERS originales siguen intactas en la carpeta vecina `Documentos`.
Los documentos del 9–10 de octubre son antecedentes: el
[README anterior](docs/history/README-2026-10-10.md) conserva su estado histórico.
La instrucción actual autoriza esta implementación local y prevalece sobre aquellas
restricciones de sólo documentación. No se publicaron cambios, commits ni issues remotas.
