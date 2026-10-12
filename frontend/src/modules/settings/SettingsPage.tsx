import { useEffect, useState } from "react";
import type { Preferences } from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import { Card, ErrorNotice, Loading } from "../../shared/ui";
export function SettingsPage({ actorId }: { actorId: string }) {
  const resource = useResource<Preferences>(actorId, "/preferences");
  const [timezone, setTimezone] = useState("America/Santiago");
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (resource.data) {
      setTimezone(resource.data.timezone);
      setEnabled(resource.data.notificationsEnabled);
    }
  }, [resource.data]);
  async function save() {
    setBusy(true);
    setError(undefined);
    setSaved(false);
    try {
      const updated = await request<Preferences>(
        actorId,
        "/preferences",
        "PATCH",
        { timezone, notificationsEnabled: enabled },
      );
      dispatchEvent(
        new CustomEvent("agentnexo.preferences-updated", {
          detail: { actorId, timezone: updated.timezone },
        }),
      );
      setSaved(true);
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
  return (
    <div className="stack">
      <h1>Preferencias y privacidad</h1>
      {error && <ErrorNotice error={error} />}{" "}
      {saved && (
        <div className="alert success" role="status">
          Preferencias guardadas.
        </div>
      )}
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label>
          Zona horaria
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option>America/Santiago</option>
            <option>UTC</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Recibir notificaciones dentro del prototipo
        </label>
        <button disabled={busy}>
          {busy ? "Guardando…" : "Guardar preferencias"}
        </button>
      </form>
      <Card title="Tus datos y sus límites">
        <p>
          Los archivos se guardan localmente para realizar lectura estática. El
          proveedor de la oferta no recibe tu entrada. En una disputa se
          comparte únicamente la evidencia que tú escribas.
        </p>
        <p>
          No hay inicio de sesión, correos, wallet ni proveedores remotos.
          Cambiar de actor permite recorrer responsabilidades y no representa
          autenticación.
        </p>
        <p>
          La supresión de contenido conserva estados y contabilidad para
          mantener trazabilidad.
        </p>
      </Card>
    </div>
  );
}
