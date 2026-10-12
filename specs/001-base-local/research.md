# Research: Base local

- Decision: Node24/node:sqlite en una instancia. Rationale: persistencia transaccional sin addon ni servidor extra. Alternatives considered: PostgreSQL/Redis/S3 de ERS históricos, excesivos para alcance local autorizado.
- Decision: actor por X-Actor-Id; visitante sin header. Rationale: probar roles sin login; evita singleton global entre peticiones. Alternatives considered: sesiones/cookies y registro, excluidos por usuario.
- Decision: React/Vite, Express/Zod y contratos públicos. Rationale: stack compatible comprobado por root en registry; módulos DTO/controller. Alternatives considered: Nest, microservicios, orquestador remoto, sin necesidad local.
- Decision: tres workspaces frontend/backend/api-contracts. Rationale: separación exigida. Fuente: docs/local-api-contract.md, backend-local-research.md y frontend-local-design.md.
- Docker no está disponible aquí; pruebas de arranque de contenedores quedan pendientes aunque build/pruebas nativas pueden ejecutarse.
