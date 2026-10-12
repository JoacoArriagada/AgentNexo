# Data model: Cierre

Order conserva estados y deadlines definidos en003. T1 fund→running <30min;
T2 refund por cancelación antes inicio o claim>=30min; T3 available→delivered<15min;
T4 refund claim>=15min sin entrega/disputa; T5 accept→paid<48h sin disputa;
T6 claim silence>=48h→paid; T7 dispute→disputed y no nuevo despacho;
T8 arbiter independiente antes7d→paid/refunded; T9 renounce→refunded;
T10 claim unresolved>=7d→refunded. closedAt y salida única: nunca paid→refunded o viceversa.
Dispute: reason/evidence no vacíos, response proveedor propio, resolution con motivo;
no evidencia nueva tras cierre. Financiación/gastos/entrega siguen separados.
Notification: id/actorId/jobId?/orderId?/title/message/read/createdAt; actor dueño.
Preferences: actorId/timezone/notificationsEnabled; default America/Santiago.
OperationControl: admissionPaused/spendingPaused, reason no vacío, actor admin/event timestamp.
Archive: bandera de presentación terminal; supresión contenido exige ejecución detenida,
no elimina registros financieros ni evidencia necesaria durante disputa.
