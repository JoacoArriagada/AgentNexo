<!--
Sync Impact Report
Version change: unratified scaffold -> 1.0.0 (initial adoption)
Modified principles: five placeholder principles replaced by project rules.
Added sections: Alcance y restricciones; Flujo de desarrollo y verificación.
Removed sections: unused example comments.
Deferred TODOs: none.
Current local prototype authorization supersedes historical documentation-only,
login, credentials and live payment requirements. Remove report before commit if desired.
-->
# AgentNexo Constitution

## Core Principles

### I. Prototipo local de arranque directo

La entrega DEBE arrancar con `docker compose up --build` en localhost, sin login,
registro, credenciales, wallet, dominio ni servicios externos. Los actores de demostración
DEBEN seleccionarse localmente y no representar autenticación real. Modelos y pagos
DEBEN tener implementaciones locales deterministas. La persistencia DEBE sobrevivir
al reinicio de contenedores con almacenamiento local de Compose. Esta regla permite
probar todos los recorridos sin preparación de infraestructura externa.

### II. Monorepo modular por funcionalidades

Frontend y backend DEBEN ser aplicaciones separadas dentro del mismo repositorio,
organizadas por módulos funcionales. Cada módulo backend DEBE agrupar controladores,
DTO y servicios cuando esas responsabilidades existan. Los contratos públicos DEBEN
definir la API; el frontend NO DEBE importar infraestructura privada del backend.
`shared` DEBE contener sólo elementos con consumidores reales en varios módulos.
La composición DEBE evitar ciclos, microservicios, buses distribuidos y capas sin una
necesidad concreta. La separación permite desarrollar y verificar ambas aplicaciones.

### III. Recorridos completos y simulaciones honestas

El prototipo DEBE cubrir catálogo, publicación y moderación de ofertas, contratación,
revisión estática, presupuestos, informes, cierre, disputas y operación, con las reglas
que concrete cada especificación. La revisión DEBE aceptar entre uno y tres archivos
JS/TS UTF-8, máximo conjunto de 1.000 líneas y 256 KiB, objetivo y criterios.
NO DEBE ejecutar/importar código, instalar sus dependencias ni modificar el repositorio
recibido. El analizador local DEBE inspeccionar la entrada real y citar evidencia;
NO DEBE presentar fixtures ajenos como análisis de esa entrada ni atribuir IA remota
al análisis determinista. Los casos propuestos DEBEN indicar que no fueron ejecutados.
Pagos, escrow, recibos y arbitraje de demostración DEBEN rotularse como simulados.

### IV. Estados, autoridad y dinero coherentes

El backend DEBE gobernar transiciones y autorización de acciones por actor de demostración
mediante lógica determinista. Roles y herramientas NO DEBEN ampliar recursos por sí mismos.
Órdenes y revisiones DEBEN conservar versiones de oferta y política relevantes.
Ejecución, entrega y estado financiero DEBEN distinguirse. Operaciones financieras
DEBEN conservar identidad estable y ser idempotentes ante reintentos. Importes DEBEN
usar unidades enteras o decimales exactos; USD, USDC y XLM de demostración DEBEN mostrarse
por separado. Disponible DEBE ser máximo entre cero y autorizado menos confirmado menos
reservado; el déficit DEBE seguir visible. Cancelar DEBE detener nuevo trabajo sin
prometer revertir operaciones confirmadas. Aceptación, disputa, respuesta, arbitraje
 y plazos DEBEN tener efectos explícitos y coherentes sobre los fondos simulados.

### V. Simplicidad verificable y experiencia usable

Cada módulo y dependencia DEBE resolver un recorrido verificable. La interfaz DEBE incluir
carga, vacío, error, confirmaciones con efectos claros y presentación adaptable a móvil.
Los controles DEBEN ser proporcionales al uso local: validación, errores y datos coherentes,
sin gestión de identidad, custodia o seguridad empresarial innecesaria. Las pruebas
DEBEN verificar invariantes, contratos y recorridos; no se exige TDD ceremonial ni pruebas
que reproduzcan solamente implementación. La documentación DEBE distinguir pruebas
realizadas, límites y verificaciones pendientes.

## Alcance y restricciones

El trabajo se organiza inicialmente en cuatro funcionalidades: base local y actores demo;
catálogo, publicación, versionado y moderación; contratación y revisión con política,
financiación, ejecución, presupuesto e informe; cierre y operación con aceptación,
disputas, respuestas, arbitraje, plazos, ventas, avisos, ajustes y control.
Las especificaciones DEBEN contrastar las fuentes ERS y Figma recientes con instrucciones
actuales. Los documentos antiguos son antecedentes y no pueden bloquear la implementación
recién autorizada ni reintroducir login, claves o despliegue público.

Se utilizará una API REST versionada bajo `/api/v1`, un frontend React/Vite y un backend
Node modular con persistencia local sencilla. El plan DEBE fijar versiones compatibles
y lock reproducible. Quedan fuera pagos reales, Mainnet, modelos remotos obligatorios,
correo, dominios, marketplace público, token propio, aplicación móvil nativa e infraestructura
distribuida. Integraciones reales futuras DEBEN especificarse por separado.

## Flujo de desarrollo y verificación

Cada funcionalidad DEBE seguir Spec Kit: especificación, aclaración de ambigüedades
materiales, plan, tareas, checklist, análisis de consistencia e implementación.
Las decisiones delegadas al orquestador DEBEN documentarse sin exigir otra confirmación
al usuario. Las tareas DEBEN estar ordenadas por dependencias y trazadas a aceptación.

La aceptación DEBE verificar build de ambas aplicaciones, contratos y entradas,
recorridos integrados de contratación y cierre, invariantes financieros y de estado,
persistencia tras reinicio y arranque Compose cuando el entorno lo permita.
Limitaciones del entorno DEBEN registrarse sin afirmar ejecuciones inexistentes.
README DEBE proporcionar comandos exactos, puertos, datos demo y límites de simulación.

## Governance

Esta constitución gobierna artefactos y fuente del alcance actual. Las instrucciones
explícitas más recientes del responsable prevalecen sobre documentos históricos;
diferencias materiales DEBEN reconciliarse en los artefactos afectados. La adopción inicial
es 2026-10-12: el documento anterior era un scaffold sin versión ratificada.

Las enmiendas DEBEN indicar motivo, principios afectados e impacto en spec, plan y tareas.
Versionado semántico: MAJOR para redefiniciones incompatibles, MINOR para reglas nuevas,
PATCH para aclaraciones. Cada revisión DEBE comprobar estos principios y justificar
complejidad adicional. Decisiones rutinarias ya autorizadas no requieren aprobación extra;
integraciones reales y publicación externa requieren nuevo alcance del responsable.

**Version**: 1.0.0 | **Ratified**: 2026-10-12 | **Last Amended**: 2026-10-12
