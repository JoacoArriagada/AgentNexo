# Feature Specification: Base local y actores de demostración

**Feature Branch**: Sin rama propia; feature_directory `specs/001-base-local`.
**Created**: 2026-10-12
**Status**: Implementado y verificado localmente; límites en [informe](../../docs/local-acceptance-report.md).
**Input**: Prototipo exclusivamente local, arranque directo, aplicaciones separadas y actores demo sin login.

## Clarifications

### Session 2026-10-12

- Q: ¿Cómo se accede sin credenciales? → A: Selección de visitante, comprador, proveedor y administrador demo; no autentica.
- Q: ¿Qué almacenamiento inicial se requiere? → A: Local persistente, una instancia, sin infraestructura distribuida.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir el prototipo (Priority: P1)

El evaluador inicia el sistema y recorre el catálogo sin preparar cuentas ni servicios.
**Why this priority**: Hace demostrable todo el producto.
**Independent Test**: Inicio limpio y catálogo visible sin credenciales.
**Acceptance Scenarios**:

1. **Given** una instalación local preparada, **When** se inicia, **Then** muestra interfaz y datos demo sin login.
2. **Given** el sistema reiniciado, **When** se consulta un cambio previamente guardado, **Then** se conserva.

### User Story 2 - Cambiar actor demo (Priority: P2)

El evaluador elige un actor y comprende las acciones disponibles.
**Why this priority**: Permite verificar responsabilidades de comprador, proveedor y administrador.
**Independent Test**: Cambiar actores muestra sus herramientas y mantiene datos comunes.
**Acceptance Scenarios**:

1. **Given** un visitante, **When** elige comprador, **Then** puede crear encargos sin registrar cuenta.
2. **Given** un actor sin responsabilidad sobre una acción, **When** la intenta, **Then** se rechaza con explicación.

### Edge Cases

- Actor desconocido, datos inválidos y recurso inexistente producen errores comprensibles.
- Reiniciar no duplica fixtures ni elimina datos; reset explícito explica que borra la demo.
- Datos demo no son usuarios autenticados ni garantías de privacidad pública.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE iniciar localmente sin login, credenciales, wallet, correo o dominio.
- **FR-002**: DEBE ofrecer visitante y tres roles demo, con nombres y responsabilidades visibles.
- **FR-003**: DEBE conservar datos de negocio después de reiniciar y cargar fixtures una sola vez.
- **FR-004**: DEBE mostrar navegación coherente, estados carga/vacío/error y banner de simulación.
- **FR-005**: DEBE rechazar datos inválidos y acciones ajenas al actor demo; la selección no autentica.
- **FR-006**: DEBE permitir reiniciar datos sólo mediante acción explícita local identificada.
- **FR-007**: DEBE permitir operación con teclado, foco visible, etiquetas y ancho móvil 375 px.

### Key Entities *(include if feature involves data)*

- **Actor demo**: identidad fija, nombre y roles; compartida por órdenes/ofertas/eventos.
- **Configuración local**: versión, modo demo y controles persistidos.
- **Evento**: identidad, fecha, actor, acción y recurso; no código completo ni secretos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un evaluador abre el catálogo sin introducir ninguna credencial.
- **SC-002**: Todos los cambios guardados de la prueba de reinicio permanecen una única vez.
- **SC-003**: Los cuatro actores se pueden recorrer en una sesión sin registrar cuentas.
- **SC-004**: Navegación esencial es usable a 375 y 1440 px sin ocultar acciones.

## Assumptions

- Entorno local de una persona con runtime de contenedores disponible; sin acceso público.
- Roles son una herramienta de demostración, no un sistema de seguridad.
- Base común para 002, 003 y 004; no introduce reglas comerciales propias.
- Fuentes: instrucción actual, ERS v0.3 RS19/26/28/30/31/36/38/41, Figma 09; versiones locales prevalecen sobre despliegue histórico.
