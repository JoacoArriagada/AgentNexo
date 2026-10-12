# Reglamento del prototipo local AgentNexo

Fecha: 2026-10-12. Este documento registra las decisiones de alcance autorizadas para la
implementación actual; no cambia los archivos Word ni afirma aceptar todas sus pruebas.

## Precedencia y fuentes

La instrucción actual del responsable autoriza flujo Spec Kit completo e implementación
local, con frontend/backend separados, DTO/controladores y arranque Docker Compose directo.
Sustituye restricciones de sólo documentación del10-10 y requisitos de login, claves,
dominio, wallet, pagos/LLM reales e infraestructura de producción en documentos anteriores.

La ERS vigente en ../Documentos/Ingenieria de Requerimientos/Exportación/ contiene18RU,
44RS,12CU y33PR. Las exportaciones Figma06/07/09 describen los doce CU de marketplace;
el README histórico centrado sólo en revisión estática no delimita el alcance actual.
Se conservan catálogo, publicación/versionado/moderación, contratación, revisión, cierre,
disputas, ventas y operación mediante cuatro specs001–004.

## Decisiones locales

- Visitante, Ana compradora, Marcos proveedor y Rocío administradora/árbitra son actores
  demo seleccionados por petición; no autenticación ni seguridad para exposición pública.
- Monorepo frontend/, backend/, packages/api-contracts/; API /api/v1 y contratos canónicos
  en docs/local-api-contract.md. Cada aplicación conserva su código privado.
- Node24.18, npm11, TypeScript7.0.2, React19.3, Vite8.3.4, Express5.3 y Zod4.6.6;
  versiones comprobadas por orquestador y fijadas en lock. node:sqlite usa SQLite3.53.1.
- Una instancia y datos locales en volumen; sin PostgreSQL, Redis, S3, workers distribuidos,
  Stellar SDK, LangGraph, correo ni proveedor LLM obligatorio.
- Analizador determinista inspecciona entrada real sin ejecutarla. Citas válidas y casos
  propuestos sin ejecutar; sin promesas de precisión de IA o valor de dos roles.
- Financiación, escrow, compras/recibos, cierres y arbitraje son simulados y persistentes.
  Cuatro bolsas separadas: precio, modelos, herramientas y comisiones. No fondos reales.
- T1–T10 y plazos30min/15min/10min/48h/7d conservan fechas absolutas y usan reloj inyectado
  para pruebas. Resolución total única; no reparto parcial ni devolución de consumo gastado.

## Evidencia y exclusiones

Las pruebas locales acreditan lógica, persistencia, contratos y recorridos. No aprueban
wallet, cadena Testnet, liquidación x402, inferencia remota, privacidad pública, PostgreSQL
multiworker, S3, RPO/RTO comerciales, correo ni evaluación humana de perfiles.
PR32 Redis sigue no aplicable porque Redis no existe; no se etiqueta aprobada.

Docker no está disponible en el entorno actual conocido. Compose puede prepararse y
revisarse, pero su arranque real debe registrarse pendiente si no se ejecuta. Build y
pruebas nativas no sustituyen esa evidencia. No existe autorización de publicar externamente.
