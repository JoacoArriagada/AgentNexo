import { useState } from "react";
import type { List, Offer } from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Dialog,
  Empty,
  ErrorNotice,
  Loading,
  label,
  money,
} from "../../shared/ui";
export function Moderation({ actorId }: { actorId: string }) {
  const resource = useResource<List<Offer>>(actorId, "/offers");
  const [selected, setSelected] = useState<Offer>();
  const [decision, setDecision] = useState<"approve" | "reject" | "suspend">(
    "approve",
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();
  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      await request(actorId, `/offers/${selected!.id}/moderate`, "POST", {
        expectedVersion: selected!.version,
        decision,
        reason,
      });
      setSelected(undefined);
      setReason("");
      await resource.reload();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <div>
        <h1>Publicaciones y confianza</h1>
        <p>Decisiones motivadas; una oferta propia nunca se autoaprueba.</p>
      </div>
      {error && <ErrorNotice error={error} />}{" "}
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : !resource.data ? (
        <Loading />
      ) : resource.data.items.filter((item) =>
          ["pending", "approved", "suspended"].includes(item.status),
        ).length ? (
        resource.data.items
          .filter((item) =>
            ["pending", "approved", "suspended"].includes(item.status),
          )
          .map((offer) => (
            <Card key={offer.id} title={`${offer.name} · v${offer.version}`}>
              <Badge>{label(offer.status)}</Badge>
              <p>
                {offer.providerName} · {offer.profile}
              </p>
              <p>{offer.description}</p>
              <strong className="mono">
                {money(
                  offer.price.minor,
                  offer.price.scale,
                  offer.price.currencyKey,
                )}
              </strong>
              <div className="actions">
                {(["approve", "reject", "suspend"] as const).map((action) => (
                  <button
                    className={action === "approve" ? "" : "secondary"}
                    key={action}
                    disabled={
                      action === "suspend"
                        ? offer.status !== "approved"
                        : offer.status !== "pending"
                    }
                    title={
                      action === "suspend"
                        ? "Sólo para una oferta aprobada"
                        : "Sólo para una publicación pendiente"
                    }
                    onClick={() => {
                      setSelected(offer);
                      setDecision(action);
                    }}
                  >
                    {action === "approve"
                      ? "Aprobar"
                      : action === "reject"
                        ? "Rechazar"
                        : "Suspender nuevas ventas"}
                  </button>
                ))}
              </div>
            </Card>
          ))
      ) : (
        <Empty>No hay publicaciones pendientes.</Empty>
      )}
      {selected && (
        <Dialog
          title={`${decision === "approve" ? "Aprobar" : decision === "reject" ? "Rechazar" : "Suspender"} ${selected.name}`}
          onClose={() => setSelected(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {error && <ErrorNotice error={error} />}
            <label>
              Motivo de la decisión
              <textarea
                required
                minLength={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <p>
              Esta decisión afecta a nuevas contrataciones. Los encargos
              existentes conservan la versión contratada.
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
