# Decisiones arquitectónicas consolidadas

Fecha: 10 de octubre de 2026. Alcance vigente: requerimientos y Figma; construcción retirada o pendiente. «Adoptada» fija dirección del diseño; no afirma implementación funcional. «Recomendada» requiere la prueba indicada. «Pendiente» bloquea solo la etapa que depende de ella.

| ID / estado | Decisión y razón | Alternativa descartada o condición de cambio | Dependencias y pregunta pendiente |
| --- | --- | --- | --- |
| ADR01 Adoptada | MVP estático, base de una salida estructurada con hallazgos/casos; dos roles como variante experimental. Dos APIs del proyecto para ensayar compra/rechazo por separado. | Exigir dos agentes o compras para ser útil no tiene evidencia; ejecución de código y múltiples sectores amplían aislamiento/operación. | Promover two-role solo con evaluación y revisión humana según alcance crítico; entrevistas complementarias, no prueba suficiente. |
| ADR02 Adoptada | Monorepo npm con apps separadas y backend modular. Los límites siguen responsabilidades, no procesos desplegados. | Microservicios, Nx/Turbo y varios repositorios no resuelven un problema actual. | Sin fuentes ni manifiestos; independencia por verificar en una fase autorizada. |
| ADR03 Adoptada | React/Vite y CSS local/tokens para estados de formulario, autorización, progreso y gastos. | Vanilla requiere más coordinación manual; Next/SSR no aporta requisito al flujo privado. No framework CSS obligatorio. | Candidato futuro, sin dependencias instaladas; diseño actual en Figma. |
| ADR04 Adoptada | Express con coordinador determinista y composición explícita. | Nest/DI ceremonial y LangGraph añaden abstracciones sin grafo dinámico demostrado. | Reconsiderar LangGraph ante pausas/grafos complejos; broker siempre conserva autoridad. |
| ADR05 Recomendada | SQLite + archivos privados, una instancia. Transacciones breves serializan reservas. | PostgreSQL añade servicio; MongoDB/Redis/Neo4j sin caso de uso demostrado. | Driver/motor real y backup/restore. Pasar a PostgreSQL antes de múltiples instancias escritoras. |
| ADR06 Adoptada | Dinero entero exacto, reservas y consumos idempotentes, monedas separadas. | Floats, saldo en RAM o cupos como fondos independientes pueden sobregirar/duplicar gasto. | Pruebas de carrera, replay, incertidumbre y sobrecosto externo. |
| ADR07 Objetivo pendiente | Cuenta contractual por trabajo con política en __check_auth dentro del flujo exact, si la combinación lo soporta. | BudgetVault.pay o contador posterior no equivalen a limitar token.transfer. | Probar SDK/firma/facilitator/protocolo con compra, rechazo y evasión bajo la misma autoridad. |
| ADR08 Alternativa recomendada | G-account dedicada prefinanciada Testnet, firma del broker y rótulo de control en aplicación. | Firmar cada compra manualmente no cumple autonomía; presentar G como control contractual sería incorrecto. | Dueño/custodio y límites visibles; nunca fondos Mainnet en esta fase. |
| ADR09 Adoptada | Sesión propia y recuperación autoservicio por correo para responsable preconfigurado; wallet separada. | Conectar una dirección no autentica al usuario; CRUD público de usuarios no pertenece al MVP. | Verificador, recuperación temporal única y CSRF pendientes; evaluar OIDC antes de servicio público. |
| ADR10 Pendiente | Elegir una API/modelo mediante evaluación de calidad, privacidad y cota de costo. | OpenRouter no es obligatorio ni supone pago Stellar; fallback no autorizado puede exceder política. | Modelo, tarifas, tokens facturables, consulta/idempotencia y retención reales. |
| ADR11 Adoptada | Estado financiero separado de ejecución y entrega. Cierre del trabajo no libera incertidumbre. | Timeout=fallo, repetir firma o refund supuesto producen cobros duplicados o contabilidad falsa. | Identidad estable de pago y recuperación de entrega demostrada por A/B. |
| ADR12 Adoptada | Código privado fuera de cadena, sin ejecución; retención mínima y salida validada. | Prompts/código en logs o blockchain son exposición innecesaria e irreversible. | Verificar borrado y política del modelo final. |
| ADR13 Adoptada | Buscar últimas versiones y elegir grupo compatible con LTS. | Actualizar cada paquete a latest aisladamente rompe x402/SDK y no prueba seguridad. | Lock exacto en instalación, pruebas y documentación de actualizaciones. |

## Resolución de diferencias

ADR14 adoptada: tres etapas P0/P1/P2 con criterios de salida distintos; ninguna captura o prueba sintética acepta una integración real. ADR15 adoptada: herramientas opcionales para entrada admitida, dos roles bajo evaluación comparada y garantía C-account fuera del mínimo. Véase [revisión crítica](scope-and-critical-review.md).

ADR16 adoptada en la revisión de cierre: P1 no exige dos llamadas independientes; el modo se fija en política y se valida por evaluación. A/B no prueban demanda ni valor comercial. Se eliminan dependencias circulares previstas entre jobs/execution/reports: app compone el flujo y reports recibe snapshots. Esta precisión sustituye la obligación previa de dos agentes en todo trabajo; P0 representa estados en Figma; P2 podría demostrar esa variante experimental.

La última instrucción sustituye las autorizaciones anteriores de migración y programación: solo requerimientos y Figma. Se retiró el código. React/Vite, npm y separación propuesta se conservan como decisiones futuras revisables, sin fuentes, instalación o comandos vigentes.

SQLite permanece como recomendación inicial por la escala y las transacciones; se añade la condición de almacenamiento local fuera de OneDrive y una puerta clara hacia PostgreSQL. El modelo contempla tenant para aislamiento sin incorporar un producto de administración de usuarios.

La existencia de soporte C-account en una interfaz del repositorio x402 mejora la hipótesis, pero no valida el release, la política ni el facilitator juntos. Stellar SDK 17 es la última publicación; x402 declara SDK 16.3 y guía el candidato del spike. La interfaz muestra la modalidad de control efectiva, no una promesa genérica de seguridad on-chain.

## Especialistas y evidencia

Arquitectura y coordinación final: agente principal. Subagente de datos/backend: persistencia, API y agentes. Subagente de pagos/seguridad: Stellar, firma, x402 y amenazas. Subagente de UX/operación: frontend, accesibilidad, calidad y despliegue. Son siete responsabilidades cubiertas por cuatro agentes, con archivos asignados sin ediciones concurrentes incompatibles. [Registro de revisión](review-record.md).

Los detalles y fuentes están en [arquitectura](architecture.md), [datos](data-model.md), [backend](backend-and-agents.md), [pagos](payments-and-budget.md), [UX](frontend-ux.md), [seguridad](security.md), [operación](quality-and-operations.md) y [versiones](toolchain-and-sources.md).

## Decisiones de experiencia actuales

ADR17 adoptada: recuperación autoservicio; errores locales por campo y rechazo genérico de credenciales. Enlace temporal único; contraseña de 15–128 caracteres y regreso a acceso sin sesión automática. Correo y revocación pendientes.

ADR18 adoptada: Inicio y notificaciones propias complementan revisiones; sin dashboard comercial ni equipos. Eliminar, quitar archivo, descartar, cancelar y archivar requieren efectos y confirmaciones distintos. Lectura no altera pagos.

ADR19 adoptada: pestañas con carga/vacío/error y esqueletos específicos; escritorio y móvil comparten variables/componentes editables en Figma. Un recorrido visual no completa aceptación técnica.

ADR20 adoptada tras revisar Figma: revisión privada con modelo USD 1,00 y externos USDC/XLM no autorizados en cero. Integración pública DEMO-01 de pricing.ts fijo con aceptación Testnet propia y bolsas USD 1,00 / USDC Testnet 0,06 / XLM Testnet 0,10. Separar identidad, resultado y navegación; ninguna coincidencia de nombre habilita A/B para un archivo privado.

ADR21 adoptada: pestañas de trabajo completado conservan estado e identidad. Componentes Mostrar/Ocultar y variables Figma de avisos/borrador son interacción del diseño, sin persistencia backend ni verificación de acceso.
