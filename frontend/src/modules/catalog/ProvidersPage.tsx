import type { List, Provider } from "@agentnexo/api-contracts";
import { useResource } from "../../shared/hooks";
import { Badge, Card, ErrorNotice, Loading, money } from "../../shared/ui";
export function ProvidersPage({
  actorId,
  navigate,
}: {
  actorId: string;
  navigate: (path: string) => void;
}) {
  const resource = useResource<List<Provider>>(actorId, "/providers");
  return (
    <div className="stack">
      <div>
        <h1>Servicios locales de demostración</h1>
        <p>
          Adaptadores deterministas; no hay llamadas a proveedores externos.
        </p>
      </div>
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : !resource.data ? (
        <Loading />
      ) : (
        <div className="grid">
          {resource.data.items.map((item) => (
            <Card key={item.id} title={item.name}>
              <Badge>
                {item.kind === "tool" ? "Fixture público" : "Analizador local"}{" "}
                · {item.ready ? "Preparado" : "No preparado"}
              </Badge>
              <p>{item.description}</p>
              <p className="mono">
                {money(
                  item.price.minor,
                  item.price.scale,
                  item.price.currencyKey,
                )}
              </p>
              {item.kind === "tool" && (
                <div className="alert warning">
                  Sólo DEMO-01 usa esta herramienta. Los archivos privados no se
                  transfieren a A/B.
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <button className="secondary" onClick={() => navigate("/catalog")}>
        Volver al catálogo
      </button>
    </div>
  );
}
