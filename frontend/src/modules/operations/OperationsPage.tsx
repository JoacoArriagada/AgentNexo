import { useState } from "react";
import type { OperationsView, Order } from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import { Card, Dialog, ErrorNotice, Loading, date } from "../../shared/ui";
export function OperationsPage({ actorId }: { actorId: string }) {
  const resource = useResource<OperationsView>(actorId, "/operations");
  const [selected, setSelected] = useState<Order>();
  const [outcome, setOutcome] = useState<"pay" | "refund">("refund");
  const [control, setControl] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();
  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      await request(
        actorId,
        selected ? `/orders/${selected.id}/resolve` : "/operations/control",
        "POST",
        selected
          ? { outcome, reason }
          : {
              admissionPaused: !resource.data!.admissionPaused,
              spendingPaused: !resource.data!.spendingPaused,
              reason,
            },
      );
      setSelected(undefined);
      setControl(false);
      setReason("");
      await resource.reload();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  if (resource.error)
    return <ErrorNotice error={resource.error} retry={resource.reload} />;
  if (!resource.data) return <Loading />;
  const ops = resource.data;
  return (
    <div className="stack">
      <div>
        <h1>Disponibilidad y operaciones</h1>
        <p>Preparación local, incidentes y resolución motivada de disputas.</p>
      </div>
      {error && <ErrorNotice error={error} />}
      <Card title="Capacidad y control">
        <div className="grid">
          <div>
            <h3>Trabajos admitidos</h3>
            <p>
              {ops.activeJobs} / {ops.capacity}
            </p>
          </div>
          <div>
            <h3>Admisión</h3>
            <p>{ops.admissionPaused ? "Pausada" : "Disponible"}</p>
          </div>
          <div>
            <h3>Nuevo gasto</h3>
            <p>{ops.spendingPaused ? "Pausado" : "Disponible"}</p>
          </div>
          <div>
            <h3>Operaciones pendientes</h3>
            <p>{ops.pendingOperations.length}</p>
          </div>
        </div>
        <div className="actions">
          <button className="secondary" onClick={() => setControl(true)}>
            {ops.admissionPaused
              ? "Reanudar admisión y gasto"
              : "Pausar admisión y gasto"}
          </button>
          <button className="secondary" onClick={() => void resource.reload()}>
            Actualizar estado
          </button>
        </div>
        <p>
          Pausar no impide aceptación, reclamación o cierre de contratos
          existentes.
        </p>
      </Card>
      <Card title="Disputas pendientes">
        {!ops.disputes.length ? (
          <p>No hay disputas pendientes.</p>
        ) : (
          ops.disputes.map((order) => (
            <div className="row" key={order.id}>
              <div className="stack">
                <strong>
                  {order.id} · {order.offer.name}
                </strong>
                <p>{order.dispute?.reason}</p>
                <p>Evidencia compartida: {order.dispute?.evidence}</p>
                {order.dispute?.response && (
                  <p>Proveedor: {order.dispute.response}</p>
                )}
                <p>Vence {date(order.disputeDeadline)}</p>
              </div>
              <button onClick={() => setSelected(order)}>
                Resolver disputa
              </button>
            </div>
          ))
        )}
      </Card>
      {(selected || control) && (
        <Dialog
          title={
            selected ? `Resuelve ${selected.id}` : "Cambiar preparación local"
          }
          onClose={() => {
            setSelected(undefined);
            setControl(false);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {error && <ErrorNotice error={error} />}{" "}
            {selected && (
              <label>
                Resolución total
                <select
                  value={outcome}
                  onChange={(e) =>
                    setOutcome(e.target.value as "pay" | "refund")
                  }
                >
                  <option value="refund">
                    Devolución total a la compradora
                  </option>
                  <option value="pay">Pago total al proveedor</option>
                </select>
              </label>
            )}
            <label>
              Motivo
              <textarea
                required
                minLength={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <p>
              La decisión queda auditada. El árbitro debe ser independiente y no
              puede modificar importe ni destinatarios.
            </p>
            <button disabled={busy}>
              {busy ? "Confirmando…" : "Confirmar decisión"}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
