# Investigación backend local

Fecha 2026-10-12. Fuente primaria: `../Documentos/Ingenieria de Requerimientos/Exportación/AgentNexo_Especificacion_de_Requerimientos.docx`; complementos: docs/backend-and-agents.md, data-model.md, payments-and-budget.md y requirements-and-acceptance.md. La ERS contiene 18 RU, 44 RS, 12 CU y 33 PR: supera el alcance antiguo de revisión estática. Los documentos anteriores se conservan como fuentes históricas.

## Decisiones autorizadas

- Solo local; Docker Compose inicia el conjunto con un comando, sin login, credenciales, dominio ni pagos reales.
- Node 24, TypeScript 7.0.2, Express 5.3, Zod 4.6.6 y SQLite incorporado mediante `node:sqlite`; instalación/lockfile centralizados por orquestador.
- Monorepo `frontend/`, `backend/`, `packages/api-contracts/`; paquete portable `@agentnexo/api-contracts`. Backend modular con DTO/controlador/servicio/repositorio donde proteja una frontera real.
- Actores demo seleccionados por `X-Actor-Id` en cada petición; visitante público, comprador, proveedor y administrador/árbitro independiente. Ningún contexto singleton global que mezcle pestañas o peticiones.
- Sin Redis, PostgreSQL, S3, SDK Stellar, LangGraph, gateway de modelos ni microservicios. Adaptadores locales explícitos conservan operaciones y resultados en SQLite.

## Persistencia y ejecución

`DatabaseSync` evita addons nativos. Una instancia API/despachador permite transacciones cortas `BEGIN IMMEDIATE`, `PRAGMA foreign_keys=ON`, WAL y timeout acotado. Base en volumen Docker fuera de OneDrive; importes exactos con `bigint`, cadenas JSON e INTEGER SQLite. No red ni análisis lento dentro de transacción.

Entidades mínimas: actores; ofertas/versiones; jobs/archivos; políticas/aceptaciones; órdenes/garantía; tareas/checkpoints; operaciones/reservas/consumos; eventos; informes; notificaciones/preferencias; idempotencia. Cada relación conserva trabajo/propietario; proveedor accede ventas y evidencia mínima de disputa, nunca código del comprador. Precio retenido separado de herramientas aunque coincida moneda.

El análisis determinista real recorre los archivos sin ejecutarlos, identifica patrones con archivo/líneas/evidencia y genera pruebas propuestas; diferencia hallazgos sustentados de incertidumbre. No inventa calidad de LLM ni mejora de dos roles. `reviewer` es perfil normal y `two-role-demo` ensayo identificado. Fixture público permite servicios A/B diferenciados; entrada privada los bloquea antes de reserva.

Despacho persistido con límite global 2 tareas activas, máximo 2 por trabajo, máximo 4 llamadas por tarea y un reintento, deadline absoluto 10 minutos. Cancelación/disputa impide nuevo despacho y conserva efectos iniciados. Reiniciar recupera operaciones locales por identidad, sin duplicar consumo. Reporte parcial conserva contribuciones realmente recibidas; MD/JSON coinciden en versión.

## Comprobaciones críticas

Pruebas de integración con SQLite real: límites de archivo; permisos actor/propiedad; ofertas aprobadas y snapshots congelados; aceptación invalidada por edición; contratación idempotente y admisión antes de fondos; dos reservas de 0,03 frente 0,05 con una ganadora; tope operación; incertidumbre y entrega perdida sin compra repetida; cancelación/reinicio; T1–T10 con reloj controlable y fronteras exactas; doble cierre; árbitro independiente; déficit real visible; informes con referencias válidas y contribuciones ausentes excluidas. Sin pruebas espejo de componentes triviales.

La ejecución local no aprueba las pruebas ERS de inferencia remota, wallet, escrow/x402 Testnet, almacenamiento S3, PostgreSQL multiworker, correo, disponibilidad comercial o evaluación de perfiles. Estas desviaciones son decisiones de alcance del usuario y se documentan explícitamente, conservando los recorridos funcionales de los doce CU.
