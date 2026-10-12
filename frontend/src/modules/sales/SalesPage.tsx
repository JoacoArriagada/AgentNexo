import { useState } from "react";
import type { SalesView, Order } from "@agentnexo/api-contracts";
import { useResource } from "../../shared/hooks";
import { request } from "../../shared/api";
import {
  Badge,
  Card,
  Dialog,
  Empty,
  ErrorNotice,
  Loading,
  label,
  money,
  date,
} from "../../shared/ui";
export function SalesPage({ actorId }: { actorId: string }) {
  const resource = useResource<SalesView>(actorId, "/sales");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Order>();
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();
  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      await request(
        actorId,
        `/orders/${selected!.id}/${action === "claim" ? action : action}`,
        "POST",
        action === "respond"
          ? { response: reason }
          : action === "claim"
            ? { kind: reason }
            : { reason },
      );
      setSelected(undefined);
      setReason("");
      await resource.reload();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  const items = resource.data?.items.filter(
    (item) => !filter || item.escrowState === filter,
  );
  return (
    <div className="stack">
      <div>
        <h1>Mis ventas</h1>
        <p>
          Precio retenido, cobros y devoluciones separados. Los archivos
          privados de la compradora no se comparten.
        </p>
      </div>
      {error && <ErrorNotice error={error} />}
      <Card>
        <label>
          Estado de garantía
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todas</option>
            {[
              "funded",
              "running",
              "delivered",
              "disputed",
              "paid",
              "refunded",
            ].map((state) => (
              <option key={state} value={state}>
                {label(state)}
              </option>
            ))}
          </select>
        </label>
        {resource.data?.totals.map((total) => (
          <p className="mono" key={total.currencyKey}>
            Retenido {money(total.retained, total.scale, total.currencyKey)} ·
            Cobrado {money(total.paid, total.scale, total.currencyKey)} ·
            Devuelto {money(total.refunded, total.scale, total.currencyKey)}
          </p>
        ))}
      </Card>
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : !items ? (
        <Loading />
      ) : !items.length ? (
        <Empty>Aún no hay ventas en este filtro.</Empty>
      ) : (
        items.map((order) => (
          <Card key={order.id} title={`${order.offer.name} · ${order.id}`}>
            <Badge>{label(order.escrowState)}</Badge>
            <p>
              Compradora {order.buyerId} · {date(order.createdAt)}
            </p>
            <p className="mono">
              {money(
                order.price.minor,
                order.price.scale,
                order.price.currencyKey,
              )}
            </p>
            {order.dispute && (
              <div className="alert warning">
                <strong>{order.dispute.reason}</strong>
                <p>Evidencia autorizada: {order.dispute.evidence}</p>
                {order.dispute.response && (
                  <p>Respuesta: {order.dispute.response}</p>
                )}
              </div>
            )}
            <div className="actions">
              {order.escrowState === "disputed" && (
                <button
                  onClick={() => {
                    setSelected(order);
                    setAction("respond");
                  }}
                >
                  Responder a la disputa
                </button>
              )}
              {!["paid", "refunded"].includes(order.escrowState) && (
                <button
                  className="secondary"
                  onClick={() => {
                    setSelected(order);
                    setAction("renounce");
                  }}
                >
                  Renunciar al precio
                </button>
              )}
              <button
                className="secondary"
                onClick={() => {
                  setSelected(order);
                  setAction("claim");
                  setReason("silence");
                }}
              >
                Reclamar por plazo
              </button>
            </div>
          </Card>
        ))
      )}
      {selected && (
        <Dialog
          title={
            action === "respond"
              ? "Responde a la disputa"
              : action === "renounce"
                ? "¿Renunciar al precio?"
                : "Reclamación por vencimiento"
          }
          onClose={() => setSelected(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {error && <ErrorNotice error={error} />}{" "}
            {action === "claim" ? (
              <label>
                Causal
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="no_start">Sin inicio · 30 minutos</option>
                  <option value="no_delivery">Sin entrega · 15 minutos</option>
                  <option value="silence">Sin decisión · 48 horas</option>
                  <option value="unresolved">
                    Disputa sin resolución · 7 días
                  </option>
                </select>
              </label>
            ) : (
              <label>
                {action === "respond" ? "Respuesta" : "Motivo de renuncia"}
                <textarea
                  required
                  minLength={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            )}
            <p>
              {action === "renounce"
                ? "La renuncia devuelve todo el precio simulado a la compradora."
                : "El backend verifica actor, estado y plazo absoluto antes de aplicar el cambio."}
            </p>
            <button disabled={busy}>
              {busy ? "Confirmando…" : "Confirmar"}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
