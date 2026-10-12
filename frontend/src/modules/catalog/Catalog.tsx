import { useState } from "react";
import type { Offer, List } from "@agentnexo/api-contracts";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Empty,
  ErrorNotice,
  Loading,
  money,
  label,
} from "../../shared/ui";
export function Catalog({
  actorId,
  role,
  navigate,
  offerId,
}: {
  actorId: string;
  role: string;
  navigate: (path: string) => void;
  offerId?: string;
}) {
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState("");
  const resource = useResource<List<Offer> | Offer>(
    actorId,
    offerId ? `/offers/${offerId}` : "/offers",
  );
  if (resource.error)
    return <ErrorNotice error={resource.error} retry={resource.reload} />;
  if (!resource.data) return <Loading />;
  if (offerId) {
    const offer = resource.data as Offer;
    return (
      <div className="stack">
        <div className="pagehead">
          <div>
            <h1>{offer.name}</h1>
            <p>
              {offer.providerName} · Versión {offer.version}
            </p>
          </div>
          <Badge>{label(offer.status)}</Badge>
        </div>
        <Card title="Qué recibirás">
          <p>{offer.description}</p>
          <p>
            Perfil{" "}
            {offer.profile === "reviewer"
              ? "Revisor único"
              : "Dos roles experimentales · Sólo fixture público"}
            . Lectura estática de archivos JS/TS; no ejecuta tu código.
          </p>
          <strong className="mono">
            {money(
              offer.price.minor,
              offer.price.scale,
              offer.price.currencyKey,
            )}
          </strong>
          <div className="alert">
            Precio de contratación independiente del presupuesto de modelos,
            herramientas y comisiones. Todo movimiento es una simulación local.
          </div>
          <div className="actions">
            <button
              disabled={role !== "buyer" || offer.status !== "approved"}
              onClick={() => navigate(`/jobs/new?offer=${offer.id}`)}
            >
              Preparar encargo
            </button>
            <button className="secondary" onClick={() => navigate("/catalog")}>
              Volver al catálogo
            </button>
          </div>
          {role !== "buyer" && (
            <p>Selecciona el actor comprador para preparar un encargo.</p>
          )}
        </Card>
        <Card title="Garantía y límites">
          <p>
            Inicio antes de 30 minutos; entrega antes de 15 minutos. Aceptación
            de 48 horas y resolución de disputa de 7 días. El resultado declara
            evidencia y limitaciones.
          </p>
          <p>
            1–3 archivos JS/TS · 1.000 líneas · 256 KiB. Los proveedores de
            oferta no reciben tus archivos privados.
          </p>
        </Card>
      </div>
    );
  }
  const offers = (resource.data as List<Offer>).items.filter(
    (item) =>
      item.status === "approved" &&
      (!profile || item.profile === profile) &&
      `${item.name} ${item.description} ${item.providerName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="stack">
      <div>
        <h1>Encuentra una revisión útil</h1>
        <p>
          Perfiles aprobados, alcance explícito y decisiones bajo tu control.
        </p>
      </div>
      <Card>
        <div className="grid">
          <label>
            Buscar ofertas
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, proveedor o alcance"
            />
          </label>
          <label>
            Perfil
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            >
              <option value="">Todos los perfiles</option>
              <option value="reviewer">Revisor único</option>
              <option value="two-role-demo">
                Dos roles experimentales · Fixture público
              </option>
            </select>
          </label>
        </div>
      </Card>
      {!offers.length ? (
        <Empty>
          No encontramos ofertas.{" "}
          <button
            className="secondary"
            onClick={() => {
              setSearch("");
              setProfile("");
            }}
          >
            Limpiar filtros
          </button>
        </Empty>
      ) : (
        <div className="grid">
          {offers.map((offer) => (
            <Card key={offer.id} title={offer.name}>
              <Badge>
                Aprobada · v{offer.version}
                {offer.profile === "two-role-demo" ? " · Experimental" : ""}
              </Badge>
              <p>{offer.description}</p>
              <p>{offer.providerName}</p>
              <strong className="mono">
                {money(
                  offer.price.minor,
                  offer.price.scale,
                  offer.price.currencyKey,
                )}
              </strong>
              <button onClick={() => navigate(`/catalog/${offer.id}`)}>
                Ver oferta
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
