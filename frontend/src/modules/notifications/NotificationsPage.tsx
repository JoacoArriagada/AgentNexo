import { useState } from "react";
import type { Notification, List } from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Empty,
  ErrorNotice,
  Loading,
  date,
} from "../../shared/ui";
export function NotificationsPage({
  actorId,
  navigate,
}: {
  actorId: string;
  navigate: (path: string) => void;
}) {
  const resource = useResource<List<Notification>>(actorId, "/notifications");
  const [unread, setUnread] = useState(false);
  const [error, setError] = useState<Error>();
  const [busy, setBusy] = useState(false);
  async function mark(id?: string) {
    setBusy(true);
    try {
      await request(
        actorId,
        id ? `/notifications/${id}` : "/notifications/read-all",
        id ? "PATCH" : "POST",
        id ? { read: true } : {},
      );
      await resource.reload();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  const items = resource.data?.items.filter((item) => !unread || !item.read);
  function origin(item: Notification) {
    navigate(
      actorId === "provider"
        ? "/sales"
        : actorId === "admin"
          ? "/operations"
          : `/jobs/${item.jobId}`,
    );
  }
  return (
    <div className="stack">
      <div className="pagehead">
        <h1>Tus notificaciones</h1>
        <button
          disabled={busy}
          className="secondary"
          onClick={() => void mark()}
        >
          Marcar todas como leídas
        </button>
      </div>
      {error && <ErrorNotice error={error} />}
      <Card>
        <label className="check">
          <input
            type="checkbox"
            checked={unread}
            onChange={(e) => setUnread(e.target.checked)}
          />
          Sólo sin leer
        </label>
        <p>Marcar como leída no cambia ejecución ni estado financiero.</p>
      </Card>
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : !items ? (
        <Loading />
      ) : !items.length ? (
        <Empty>No tienes avisos nuevos.</Empty>
      ) : (
        <Card>
          {items.map((item) => (
            <div className="row" key={item.id}>
              <div className="stack">
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <p>{date(item.createdAt)}</p>
                <Badge>{item.read ? "Leída" : "Sin leer"}</Badge>
              </div>
              <div className="actions">
                {item.jobId && (
                  <button onClick={() => origin(item)}>Abrir origen</button>
                )}
                {!item.read && (
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() => void mark(item.id)}
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
