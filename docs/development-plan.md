# Diseño actual y plan futuro

Estado al 10 de octubre de 2026: solo requerimientos y Figma. Se retiró el código anterior. P1/P2 y despliegue son propuestas futuras, sin autorización para programarlas ahora. La [revisión crítica](scope-and-critical-review.md) define mínimos y exclusiones; evita que la integración contractual bloquee comprobar la utilidad de la revisión.

| Etapa | Dependencia | Salida necesaria |
| --- | --- | --- |
| **P0. Diseño** | Alcance y arquitectura | Figma editable y conectado: acceso/recuperación, Inicio, revisiones, autorización, ejecución, gastos, actividad, informes, notificaciones, confirmaciones, móvil y esqueletos. Verificación visual y de enlaces; sin build o código. |
| **P1a. Modelo y evaluación** | Casos estáticos anotados | 20 módulos y comparación de una llamada frente a dos roles; tres repeticiones, métricas y puertas de calidad. Elegir modelo, tarifas, límites de tokens y privacidad. Sin configuración válida, NOT_READY. |
| **P1b. API, identidad y persistencia** | Contratos y P1a para inferencia | DTO validado, sesión del responsable, SQLite real, migraciones, permisos por recurso, almacenamiento privado y backup/restore. Pruebas de entradas adversarias y límites. |
| **P1c. Ejecución y consumo** | P1a + P1b | Reservar costo de modelo, ejecutar la variante elegida por evaluación (base: single-pass), validar salidas/criterios, generar informe, cancelar y recuperar sin llamadas duplicadas. A/B deshabilitados en single-pass. Medir utilidad antes de añadir autonomía. |
| **P1d. Web conectada** | P1b + P1c | Construir desde el diseño y contratos HTTP; sesión, recuperación, notificaciones, polling cancelable, errores y retención reales. Mantener fronteras y rotular cualquier modo demo. |
| **P2a. Spike x402/Stellar** | Configuración Testnet y amenazas | Compra, rechazo y conciliación con SDK compatibles y facilitator existente. G-account dedicada es base válida con control en aplicación; C-account requiere evidencia adicional. Puede avanzar en paralelo a P1. |
| **P2b. Broker y A/B** | P1b + P2a | Transacciones de reservas, idempotencia, proveedores/destinos distintos, fixture público y entrega recuperable. No enviar archivos propios a herramientas no aplicables. |
| **P2c. Demostración integrada** | P1d + P2b | Compra real, rechazo previo a firma, carrera 0,03 + 0,03 contra 0,05, replay, timeout, pago sin entrega, cancelación y recuperación con hashes y evidencia sin secretos. |
| **Despliegue privado** | P1 + P2 aceptados y configuración segura | Una instancia backend, volumen local fuera de OneDrive, estáticos web, A/B separado, TLS, secretos y rollback. CI remoto y smoke tests. |

El producto completo de esta propuesta requiere P1 + P2. P0 no prueba ninguna integración real. Las entrevistas con posibles usuarios pueden avanzar en paralelo: validan demanda y lenguaje, no sustituyen evaluar precisión, costo y tiempo humano.

## Puertas de decisión

1. **Valor de dos roles:** conservar la separación en producto solo si supera la evaluación definida. Una arquitectura multiagente no es un resultado en sí.
2. **Firma:** no afirmar control contractual sin liquidación y rechazo demostrados bajo intento de evasión. Mantener garantía de aplicación si se usa G-account.
3. **Costo:** fijar cota de una llamada antes de ejecutarla; incertidumbre conserva reserva y factura excesiva no se oculta.
4. **Persistencia:** SQLite local para una instancia; reevaluar PostgreSQL antes de múltiples escritores distribuidos.
5. **Alcance:** no añadir sectores, ejecución de código, marketplace ni más agentes para compensar calidad insuficiente.

Si se autoriza construir, cada etapa deberá añadir implementación, pruebas pertinentes y documentación en el mismo cambio. La [matriz de aceptación](requirements-and-acceptance.md) exige evidencia real; [operación](quality-and-operations.md) define recuperación. Los manifiestos, un mock y un HTTP 200 aislado no completan una etapa.
