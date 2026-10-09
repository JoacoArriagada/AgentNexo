# Arquitectura propuesta

**Estado:** diseño del MVP; componentes aún no implementados.

## Límites

Una aplicación web sencilla habla con un único backend Node.js/TypeScript. El backend contiene el coordinador determinista, las tareas de los dos agentes, el PaymentBroker y adaptadores para modelos, x402 y Stellar. SQLite guarda los trabajos, permisos, estados, reservas y recibos. Los entregables se guardan como archivos locales en la demo.

Las dos APIs de demostración se identifican como proveedores separados, con dos rutas HTTP, destinatarios y máximos distintos. El servicio A calcula métricas de un ejemplo de código admitido. El servicio B devuelve casos parametrizados para el mismo ejemplo; no ejecuta pruebas.

```text
Usuario → Web → Backend
                   ├─ Coordinador → Agente analista → API A (x402)
                   │              → Agente de pruebas → API B (x402)
                   ├─ PaymentBroker → SDK x402 → Facilitator → Stellar Testnet
                   ├─ SQLite / archivos locales
                   └─ Proveedor de modelos (facturación tradicional)
```

Los modelos, entradas, código, documentos y coordinación permanecen fuera de Stellar. La red permite consultar operaciones y autorizaciones; no certifica el contenido ni la entrega HTTP.

## Ejecución

1. Persiste objetivo, alcance, archivos, entregable, plazo, presupuestos y proveedores.
2. El usuario autoriza ese plan.
3. El coordinador inicia hasta dos tareas independientes y aplica dependencias; los dos agentes no reciben claves ni pueden cambiar permisos.
4. Cada petición de compra pasa por validación y reserva del broker antes de firmarse.
5. El adaptador x402 y el facilitator realizan verificación y liquidación compatibles; el backend concilia el resultado y conserva el estado incierto.
6. El coordinador consolida resultados o explica fallos y entrega informe, comprobantes y saldo.

La persistencia mínima debe ofrecer una transacción breve y atómica para las reservas. Las llamadas de red ocurren después del commit. La demo no requiere workers distribuidos, colas externas ni múltiples servicios de base de datos.

## Límite de confianza

El PaymentBroker mantiene los permisos; los agentes proponen solicitudes estructuradas y no firman. Las claves se mantienen en el firmante seleccionado, fuera del prompt y del navegador. Si el firmante tiene autoridad para gastar fuera de la política contractual, el presupuesto es un control de aplicación y debe presentarse como tal.

La cuenta Soroban por trabajo es una hipótesis técnica. Antes de decir que protege un pago x402 se debe probar el esquema de firma, `__check_auth`, el SDK y el facilitator juntos y verificar que ninguna ruta con la misma autoridad evite los límites.
