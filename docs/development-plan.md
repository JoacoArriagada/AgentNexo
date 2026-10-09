# Plan de desarrollo

**Estado inicial:** documentación preparada. Cada etapa de implementación permanece pendiente.

| Etapa | Trabajo | Evidencia para darla por verificada |
| --- | --- | --- |
| 1. Validar problema | Entrevistar cinco desarrolladores/agencias sobre frecuencia, presupuesto, proveedores y disposición a pagar. | Notas anonimizadas y decisión de continuar/ajustar el paquete. |
| 2. Viabilidad de pago | Fijar versiones x402/Stellar/Rust/wallet/facilitator; probar cuenta, firma, `/verify`, `/settle`, token de prueba y reglas de gasto. | Compra, rechazo contractual por exceso y por destinatario, autorización expirada y carrera documentados con hashes/estados Testnet. Si no hay control on-chain, declarar el control de aplicación y autoridad de la clave. |
| 3. Base local | Web sencilla, API Node.js/TypeScript, persistencia SQLite, configuración local y estados de trabajo. | Crear y recuperar trabajo; importes exactos; reservas concurrentes en transacción. Sin pagos reales. |
| 4. Broker y servicios A/B | Autorizar destinos/máximos; un endpoint por servicio; reserva antes de firmar. | Con 0,05 USDC Testnet, A compra 0,03 y B se rechaza a 0,03; con otro trabajo de 0,06 ambos compran. Rechazar 0,04 si el máximo por operación es 0,03. |
| 5. Agentes e informe | Dos roles con máximo de cuatro llamadas por agente y un reintento; hasta dos simultáneos. | Informe estático útil, dos proveedores distinguibles, límites y estados visibles. No ejecutar archivos del cliente. |
| 6. Recorrido y preparación de demo | Tratar duplicados, timeout/reinicio, pago confirmado sin entrega y saldos por categoría. | Evidencia reproducible; confirmados/reservados/disponibles coinciden; ninguna compra duplicada. |

No construir interfaz amplia antes de resolver la viabilidad y el modelo de confianza del pago. Versiones, precios del proveedor de IA, activo Testnet y facilitator se revalidan al implementar. No instalar dependencias ni presentar esta tabla como pruebas aprobadas.
