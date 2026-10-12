import { useEffect, useState } from "react";
import type { Offer, List, Profile } from "@agentnexo/api-contracts";
import { request, ApiError } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Empty,
  ErrorNotice,
  Loading,
  label,
  money,
  Dialog,
} from "../../shared/ui";
export function Offers({
  actorId,
  navigate,
  offerId,
}: {
  actorId: string;
  navigate: (path: string) => void;
  offerId?: string;
}) {
  const resource = useResource<List<Offer> | Offer>(
    actorId,
    offerId && offerId !== "new" ? `/offers/${offerId}` : "/offers",
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState<Profile>("reviewer");
  const [price, setPrice] = useState("0.0200000");
  const [error, setError] = useState<Error>();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const offer =
    offerId && offerId !== "new"
      ? (resource.data as Offer | undefined)
      : undefined;
  useEffect(() => {
    if (offer) {
      setName(offer.name);
      setDescription(offer.description);
      setProfile(offer.profile);
      const raw = offer.price.minor.padStart(offer.price.scale + 1, "0");
      setPrice(
        `${raw.slice(0, -offer.price.scale)}.${raw.slice(-offer.price.scale)}`,
      );
    }
  }, [offer]);
  async function save() {
    setError(undefined);
    setBusy(true);
    try {
      if (!/^\d+(\.\d{1,7})?$/.test(price))
        throw new Error(
          "Precio: usa un importe positivo con hasta siete decimales.",
        );
      const [whole, fraction = ""] = price.split(".");
      const priceMinor = BigInt(whole + fraction.padEnd(7, "0")).toString();
      const payload = {
        name,
        description,
        profile,
        priceMinor,
        ...(offer ? { expectedVersion: offer.version } : {}),
      };
      const result = await request<Offer>(
        actorId,
        offer ? `/offers/${offer.id}` : "/offers",
        offer ? "PATCH" : "POST",
        payload,
      );
      navigate(`/offers/${result.id}`);
      await resource.reload();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      await request(actorId, `/offers/${offer!.id}/submit`, "POST", {
        expectedVersion: offer!.version,
      });
      setConfirm(false);
      await resource.reload();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  async function withdraw() {
    setBusy(true);
    setError(undefined);
    try {
      await request(actorId, `/offers/${offer!.id}/withdraw`, "POST", {
        expectedVersion: offer!.version,
        reason: withdrawReason,
      });
      setWithdrawConfirm(false);
      setWithdrawReason("");
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
  if (!offerId) {
    const offers = (resource.data as List<Offer>).items.filter(
      (item) => item.providerId === actorId,
    );
    return (
      <div className="stack">
        <div className="pagehead">
          <div>
            <h1>Mis ofertas</h1>
            <p>Publica versiones con alcance, perfil y precio explícitos.</p>
          </div>
          <button onClick={() => navigate("/offers/new")}>Nueva oferta</button>
        </div>
        {offers.length ? (
          <Card>
            {offers.map((item) => (
              <div className="row" key={item.id}>
                <div className="stack">
                  <strong>
                    {item.name} · v{item.version}
                  </strong>
                  <p>
                    {money(
                      item.price.minor,
                      item.price.scale,
                      item.price.currencyKey,
                    )}
                  </p>
                  <Badge>{label(item.status)}</Badge>
                </div>
                <button
                  className="secondary"
                  onClick={() => navigate(`/offers/${item.id}`)}
                >
                  Abrir oferta
                </button>
              </div>
            ))}
          </Card>
        ) : (
          <Empty>Aún no has creado ofertas.</Empty>
        )}
      </div>
    );
  }
  return (
    <div className="stack">
      <div>
        <h1>
          {offer ? `${offer.name} · Versión ${offer.version}` : "Nueva oferta"}
        </h1>
        <p>Las versiones contratadas conservan su contenido original.</p>
      </div>
      {error && <ErrorNotice error={error} />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        className="card"
      >
        <label>
          Nombre
          <input
            required
            minLength={3}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Descripción
          <textarea
            required
            minLength={20}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <span className="help">{description.length}/2000 caracteres</span>
        </label>
        <div className="grid">
          <label>
            Perfil
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value as Profile)}
            >
              <option value="reviewer">Revisor único</option>
              <option value="two-role-demo">Dos roles de demostración</option>
            </select>
          </label>
          <label>
            Precio de contratación · USDC de prueba
            <input
              required
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
        </div>
        {offer && (
          <>
            <Badge>{label(offer.status)}</Badge>
            {offer.moderationReason && (
              <div className="alert warning">{offer.moderationReason}</div>
            )}
          </>
        )}
        <div className="actions">
          <button disabled={busy}>
            {busy
              ? "Guardando…"
              : offer
                ? "Guardar nueva versión"
                : "Guardar borrador"}
          </button>
          {offer && ["draft", "rejected"].includes(offer.status) && (
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => setConfirm(true)}
            >
              Enviar a moderación
            </button>
          )}
          {offer && ["approved", "pending"].includes(offer.status) && (
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => setWithdrawConfirm(true)}
            >
              Retirar de nuevas ventas
            </button>
          )}
          <button
            className="secondary"
            type="button"
            onClick={() => navigate("/offers")}
          >
            Volver a mis ofertas
          </button>
        </div>
        {error instanceof ApiError &&
          error.details?.map((detail) => (
            <p key={detail.field} role="alert">
              {detail.field}: {detail.reason}
            </p>
          ))}
      </form>
      {confirm && (
        <Dialog
          title="¿Enviar esta versión a moderación?"
          onClose={() => setConfirm(false)}
        >
          <p>
            La administración revisará alcance y evidencia. La publicación sólo
            aparecerá en el catálogo después de aprobarla.
          </p>
          <button disabled={busy} onClick={() => void submit()}>
            Enviar versión
          </button>
        </Dialog>
      )}
      {withdrawConfirm && (
        <Dialog
          title="¿Retirar esta oferta de nuevas ventas?"
          onClose={() => setWithdrawConfirm(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void withdraw();
            }}
          >
            {error && <ErrorNotice error={error} />}
            <p>
              La oferta dejará de admitir nuevas contrataciones. Los encargos ya
              creados conservan precio y versión originales.
            </p>
            <label>
              Motivo de retirada
              <textarea
                required
                minLength={3}
                maxLength={1000}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
              />
            </label>
            <button className="danger" disabled={busy}>
              {busy ? "Retirando…" : "Confirmar retirada"}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
