# AgentNexo

Consulta el README raíz y `docs/` antes de proponer cambios. El producto vende un servicio/paquete por trabajo con alcance, presupuesto y permisos; la cantidad de agentes es una decisión interna.

El MVP propuesto es revisión estática JavaScript/TypeScript con una tarea base y dos roles experimentales bajo evaluación; A/B opcionales solo para fixture público. Alcance vigente: requisitos y frontend en Figma, sin código. El prototipo local fue retirado; toda implementación está pendiente. Revisa docs/scope-and-critical-review.md: P0 no demuestra P1/P2. No ejecutes código del cliente. Mantén tareas, contenido y modelos fuera de Stellar. Usa Testnet en la demostración.

Separa factura de modelos, pagos a proveedores y comisiones. Las APIs tradicionales requieren controles de aplicación. Un registro on-chain posterior no limita un pago x402: la compatibilidad de contrato, firma, SDK y facilitator está pendiente hasta demostrar el flujo integrado.

No entregues claves a modelos/agentes. Respeta permisos y reservas atómicas, no liberes pagos inciertos, no inventes resultados, integraciones ni precios. LangGraph y OpenRouter son opciones pendientes.

Conserva el README sin cambios salvo solicitud explícita. Lee el estado Git, preserva otras ramas/cambios y no uses reescrituras destructivas. Declara lo verificado y lo pendiente por separado.

No crear fuentes, aplicaciones, paquetes, manifiestos, dependencias, scripts ni workflows en el alcance vigente. Las rutas de arquitectura son una propuesta futura, no directorios existentes. No hay comandos npm disponibles. Sin nueva instrucción del responsable, trabajar solo en requerimientos y Figma.
