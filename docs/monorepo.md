# Propuesta de monorepositorio

**Estado al 10 de octubre de 2026: especificación futura, sin migración implementada vigente.** Se retiraron aplicaciones, paquetes, fuentes, manifiestos, lockfile, dependencias, scripts y workflow generados anteriormente. Se conserva documentación y configuración editorial. No recrear esas carpetas en esta fase.

## Razón de la propuesta

Si se autoriza programar, reunir frontend, backend y contratos públicos permitirá revisar cambios coordinados de interfaz/API sin convertirlos en un solo proceso. Se propone un backend modular de una instancia. No exige microservicios, Nx, Turborepo, bus de eventos, cola distribuida ni gestores adicionales por anticipación.

| Unidad lógica futura | Responsabilidad | Frontera |
| --- | --- | --- |
| Frontend | Presentación, formularios y estados públicos. | Sin servidor, SQL, firmante, modelos ni secretos. |
| Backend | Sesión, recursos, ejecución, presupuesto y conciliación. | Sin depender del proceso frontend ni fuentes de proveedores. |
| Contratos públicos | DTO y validación portable compartida. | Sin IO de Node, SQL, SDK de firma ni entidades persistentes. |
| Servicios A/B | Entregas distintas del fixture público admitido. | Proceso separado; sin base ni firmante del backend. |
| Soroban candidato | Prueba de autoridad y rechazo contractual. | Toolchain separada; garantía condicionada a evidencia. |

Los nombres de rutas sugeridos en arquitectura designan una organización posible; no son enlaces a fuentes existentes. Crear módulos cuando tengan responsabilidades y consumidores reales, sin paquetes compartidos genéricos ni capas vacías.

## Independencia futura

npm workspaces es la recomendación inicial por escala. Un lock revisado y dependencias en cada consumidor evitarían resoluciones divergentes. Reconsiderar pnpm, Nx/Turbo solo ante necesidades medidas. [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/).

Probar en checkout limpio instalación, construcción y desarrollo de cada aplicación sin iniciar la otra; resolver contratos sin incorporar servidor al navegador; desplegar artefactos separados. Un manifiesto o un comando sobre un equipo con todas las dependencias no prueba aislamiento.

No se ofrecen comandos ahora. La futura autorización deberá fijar versiones compatibles, preservar código original que se aporte y exigir [aceptación](requirements-and-acceptance.md). Esta revisión no cambia ramas, crea commits ni publica despliegues.
