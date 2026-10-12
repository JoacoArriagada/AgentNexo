# Alcance del prototipo de diseño

**Revisión: 10 de octubre de 2026.** El frontend local de React/Vite y su modelo sintético fueron retirados por instrucción expresa del responsable. También se retiraron dependencias, manifiestos, scripts, compilados y copias de prueba. Se conserva el nombre histórico de este documento para no romper enlaces; ya no describe una implementación disponible.

La entrega vigente es un diseño editable y navegable en [Figma](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa), derivado de requisitos y arquitectura. Los botones enlazan pantallas y estados representativos. Credenciales, archivos, correos, tareas, importes y resultados son ejemplos visuales.

| Se puede revisar en el diseño | Requiere implementación futura |
| --- | --- |
| Jerarquía, tipografía, colores, controles y móvil. | Renderizado semántico, reflujo y accesibilidad del producto. |
| Acceso, errores de formato, credencial rechazada y carga. | Verificación, cookie, CSRF y sesión real. |
| Recuperación, mensaje genérico, enlace vencido y contraseña actualizada. | Correo, tokens temporales únicos, rate limits y revocación. |
| Definir alcance, revisar política y confirmar inicio. | Persistencia, validación autoritativa y aceptación versionada. |
| Ejecución, cancelación, gasto incierto y entrega recuperable. | Modelos, reservas atómicas, firma y conciliación Testnet. |
| Informes, filtros, detalles y descarga representada. | Análisis sustentado y archivo descargable autorizado. |
| Notificaciones, confirmaciones y esqueletos. | Eventos persistidos, preferencias y consultas reales. |

Un click de Figma no ejecuta lógica de negocio ni constituye prueba financiera. Los escenarios preservan ejecución, situación financiera y entrega como estados independientes. No se muestran hashes ficticios como comprobantes, ni se atribuyen hallazgos del fixture a archivos propios.

No hay comandos ni resultados de tests vigentes. La evidencia del prototipo retirado no acepta la futura implementación. Véanse [requisitos](requirements-and-acceptance.md) y [calidad](quality-and-operations.md).

## Límites revisados del prototipo

La revisión privada representa USD 1,00 para modelo y límites externos USDC/XLM de cero, no autorizados. DEMO-01 es otro caso con pricing.ts público fijo, autorización Testnet propia, USD 1,00, 0,06 USDC Testnet y 0,10 XLM Testnet. No mezclar sus datos, resultados ni autorización.

Mostrar/Ocultar contraseña y variables de lectura de avisos/filtro/borrador son interacciones nativas Figma. No equivalen a persistencia o verificación de credenciales. La navegación de una revisión completada conserva identidad y estado. La verificación final de los recorridos aún corresponde al agente principal.
