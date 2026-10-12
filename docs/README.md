# Documentación vigente de AgentNexo

## Prototipo local vigente

Desde el 12 de octubre de 2026 el alcance autorizado incluye implementación local.
Estas fuentes prevalecen sobre el estado histórico que se conserva más abajo:

- [Reglamentario](../reglamentario.md) y [constitución](../.specify/memory/constitution.md).
- [Cuatro módulos Spec Kit](spec-workflow.md), requisitos, planes y tareas.
- [Contrato API](local-api-contract.md) y [diseño frontend local](frontend-local-design.md).
- [Validación ejecutada](local-acceptance-report.md) y [README de arranque](../README.md).

## Antecedentes de especificación y Figma

El texto siguiente documenta el estado del 10 de octubre, anterior a la nueva autorización.
Sus exigencias de producción e integraciones reales son referencias para otro alcance;
no reintroducen autenticación o credenciales al prototipo local.

# Documentación de AgentNexo

Revisión del **10 de octubre de 2026**. El alcance vigente es especificación y diseño en [el archivo Figma solicitado](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa), sin implementación. El código anterior, dependencias y scripts fueron retirados. Aplicaciones, módulos, API y bases de datos son responsabilidades propuestas para una fase futura.

| Documento | Contenido |
| --- | --- |
| [Revisión crítica y mínimos](scope-and-critical-review.md) | Valor de los agentes, etapas, límites y evaluación comparada |
| [Arquitectura](architecture.md) | Módulos propuestos, propiedad de datos y dependencias |
| [Monorepositorio propuesto](monorepo.md) | Organización futura e independencia; sin migración vigente |
| [Datos](data-model.md) | Entidades, invariantes, retención y persistencia futura |
| [Backend y agentes](backend-and-agents.md) | API futura, identidad, estados, límites y recuperación |
| [Pagos y presupuesto](payments-and-budget.md) | Fondos, firma, reservas y pruebas Testnet pendientes |
| [Frontend y UX](frontend-ux.md) | Funcionalidades, acceso, componentes, estados y accesibilidad |
| [Entrega en Figma](figma-delivery.md) | Diseño de los 12 CU ERS v0.3: 180 variantes por formato, 24 esqueletos, aplicabilidad por etapa y límites de evidencia |
| [Alcance del prototipo de diseño](prototype-implementation.md) | Retracción del prototipo local y límites de Figma |
| [Mapa de pantallas](prototype-screen-map.md) | Pantallas, variantes, confirmaciones, móvil y esqueletos |
| [Seguridad](security.md) | Amenazas, recuperación de cuenta y protección de datos |
| [Calidad y operación](quality-and-operations.md) | Revisión de diseño y futura aceptación integrada |
| [Herramientas y fuentes](toolchain-and-sources.md) | Consulta histórica y actualización compatible |
| [Decisiones](decisions.md) | Dirección, alternativas y pendientes |
| [Requisitos y aceptación](requirements-and-acceptance.md) | Trazabilidad y evidencia requerida |
| [Plan futuro](development-plan.md) | Diseño actual y construcción no autorizada |
| [Registro de revisión](review-record.md) | Cambio de alcance y límites de evidencia |

La entrega Figma cubre los doce CU de la [ERS de trabajo v0.3](<../../Documentos/Ingenieria de Requerimientos/Exportación/AgentNexo_Especificacion_de_Requerimientos.docx>): catálogo controlado, comprador/proveedor/administrador, contratación financiada y cierre de precio. El diseño está terminado con 13 entradas de flujo por formato, portal y doce CU. La auditoría estructural posterior a las etiquetas v0.3 confirmó 180/180 estados accesibles desde cada portal, sin destinos inexistentes, desbordamientos, colisiones, navegación a modales incorrecta o placeholders. La fuente quedó identificada con hash estable; versión, inventario y evidencia están en la entrega. Esto no sustituye pruebas manuales del reproductor. La fuente v0.3 contiene 44 requisitos de software y 33 pruebas planificadas; sus parámetros propuestos siguen por validar. Redis queda fuera del prototipo base: RS43/PR32 aplican solo al incorporarlo y PR32 se registra no aplicable con justificación, sin aprobación. La selección inicial exige una sola API LLM real; Docker Compose corresponde al entorno inicial y las opciones futuras no bloquean el mínimo. La auditoría previa se conserva como evidencia anterior a esta ampliación. Recuperación, notificaciones, confirmaciones y esqueletos forman parte del diseño. Las fuentes técnicas tienen fecha; no garantizan compatibilidad futura. No existen comandos de instalación/build/pruebas ni servidor de vista previa. La evidencia de Figma debe referir nodos realmente devueltos y revisados.
