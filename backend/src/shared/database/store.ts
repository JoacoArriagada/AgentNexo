import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type {
  Actor,
  JobEvent,
  Notification,
  Offer,
} from "@agentnexo/api-contracts";
import { AppError } from "../errors.js";

export const ACTORS: Actor[] = [
  { id: "visitor", name: "Visitante", roles: ["visitor"] },
  { id: "buyer", name: "Ana · Compradora", roles: ["buyer"] },
  { id: "provider", name: "Marcos · Proveedor", roles: ["provider"] },
  { id: "admin", name: "Rocío · Administradora y árbitra", roles: ["admin"] },
];
export const id = (prefix: string) => `${prefix}_${randomUUID()}`;
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
export const digest = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");

export class Store {
  readonly db: DatabaseSync;
  private inTransaction = false;
  constructor(
    path: string,
    readonly clock: () => Date = () => new Date(),
  ) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db
      .exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=2000;
      CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS entities(kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL CHECK(json_valid(data)),PRIMARY KEY(kind,id)) STRICT;
      CREATE TABLE IF NOT EXISTS idempotency(actor_id TEXT NOT NULL,route TEXT NOT NULL,key TEXT NOT NULL,digest TEXT NOT NULL,status INTEGER NOT NULL,response TEXT NOT NULL,PRIMARY KEY(actor_id,route,key)) STRICT;
      CREATE TABLE IF NOT EXISTS events(resource_id TEXT NOT NULL,sequence INTEGER NOT NULL,actor_id TEXT NOT NULL,type TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(resource_id,sequence)) STRICT;
      CREATE TABLE IF NOT EXISTS financial_operations(id TEXT PRIMARY KEY,job_id TEXT NOT NULL,logical_key TEXT NOT NULL,digest TEXT NOT NULL,category TEXT NOT NULL,currency_key TEXT NOT NULL,amount INTEGER NOT NULL CHECK(amount>=0),reserved INTEGER NOT NULL CHECK(reserved>=0),confirmed INTEGER NOT NULL CHECK(confirmed>=0),data TEXT NOT NULL CHECK(json_valid(data)),UNIQUE(job_id,logical_key)) STRICT;
      CREATE INDEX IF NOT EXISTS financial_job ON financial_operations(job_id,category);
    `);
    this.db
      .prepare("INSERT OR IGNORE INTO schema_migrations VALUES(1,?,?)")
      .run(digest("local-schema-v1"), this.now());
    // A composite FK scopes financial rows to an existing job entity. The migration
    // preserves rows created by the first local schema and prevents a draft delete
    // from accidentally removing the parent of a retained financial operation.
    const columns = this.db
      .prepare("PRAGMA table_info(financial_operations)")
      .all();
    if (!columns.some((column) => column.name === "job_kind"))
      this.transaction(() => {
        this.db.exec(`CREATE TABLE financial_operations_v2(
        id TEXT PRIMARY KEY,job_id TEXT NOT NULL,logical_key TEXT NOT NULL,digest TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('models','tools','fees')),
        currency_key TEXT NOT NULL CHECK(currency_key IN ('USD','USDC_DEMO','XLM_DEMO')),
        amount INTEGER NOT NULL CHECK(amount>=0),reserved INTEGER NOT NULL CHECK(reserved>=0),confirmed INTEGER NOT NULL CHECK(confirmed>=0),
        data TEXT NOT NULL CHECK(json_valid(data)),job_kind TEXT NOT NULL DEFAULT 'job' CHECK(job_kind='job'),
        UNIQUE(job_id,logical_key),FOREIGN KEY(job_kind,job_id) REFERENCES entities(kind,id) ON DELETE RESTRICT
      ) STRICT;
      INSERT INTO financial_operations_v2(id,job_id,logical_key,digest,category,currency_key,amount,reserved,confirmed,data)
        SELECT id,job_id,logical_key,digest,category,currency_key,amount,reserved,confirmed,data FROM financial_operations;
      DROP TABLE financial_operations;
      ALTER TABLE financial_operations_v2 RENAME TO financial_operations;
      CREATE INDEX financial_job ON financial_operations(job_id,category);`);
      });
    this.db
      .prepare("INSERT OR IGNORE INTO schema_migrations VALUES(2,?,?)")
      .run(digest("financial-job-fk-v2"), this.now());
    this.transaction(() => {
      for (const actor of ACTORS) this.save("actor", actor);
      if (!this.get("config", "operation"))
        this.save("config", {
          id: "operation",
          admissionPaused: false,
          spendingPaused: false,
        });
      if (!this.get("config", "seeded")) {
        const seed: Offer = {
          id: "offer-reviewer",
          version: 1,
          providerId: "provider",
          providerName: ACTORS[2].name,
          name: "Revisión estática JS/TS",
          description:
            "Inspección local del código y propuestas de pruebas con evidencia verificable. No ejecuta archivos.",
          profile: "reviewer",
          status: "approved",
          price: { currencyKey: "USDC_DEMO", scale: 7, minor: "200000" },
          createdAt: this.now(),
          updatedAt: this.now(),
        };
        this.save("offer", seed);
        this.save("offer-version", {
          ...seed,
          id: `${seed.id}:1`,
          offerId: seed.id,
        });
        this.save("offer", {
          ...seed,
          id: "offer-two-role",
          name: "Ensayo de dos roles · Fixture público",
          profile: "two-role-demo",
          description:
            "Ensayo local de analista y diseñador de pruebas con herramientas A/B sobre un fixture público fijo. No acredita mejora de calidad.",
        });
        this.save("config", { id: "seeded" });
      }
    });
  }
  now() {
    return this.clock().toISOString();
  }
  get<T>(kind: string, itemId: string): T | undefined {
    const row = this.db
      .prepare("SELECT data FROM entities WHERE kind=? AND id=?")
      .get(kind, itemId);
    return row ? (JSON.parse(row.data as string) as T) : undefined;
  }
  list<T>(kind: string): T[] {
    return this.db
      .prepare("SELECT data FROM entities WHERE kind=? ORDER BY rowid DESC")
      .all(kind)
      .map((row) => JSON.parse(row.data as string) as T);
  }
  save<T extends { id: string }>(kind: string, value: T) {
    this.db
      .prepare(
        "INSERT INTO entities(kind,id,data) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",
      )
      .run(kind, value.id, JSON.stringify(value));
    return value;
  }
  remove(kind: string, itemId: string) {
    this.db
      .prepare("DELETE FROM entities WHERE kind=? AND id=?")
      .run(kind, itemId);
  }
  transaction<T>(work: () => T): T {
    if (this.inTransaction) return work();
    this.db.exec("BEGIN IMMEDIATE");
    this.inTransaction = true;
    try {
      const result = work();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    } finally {
      this.inTransaction = false;
    }
  }
  mutate(
    actorId: string,
    route: string,
    key: string | undefined,
    body: unknown,
    work: () => { status?: number; value: unknown },
  ) {
    if (!key || !/^[\x21-\x7e]{8,128}$/.test(key))
      throw new AppError(
        422,
        "IDEMPOTENCY_KEY_REQUIRED",
        "Envía una clave de idempotencia de 8 a 128 caracteres.",
      );
    return this.transaction(() => {
      const hash = digest(body);
      const previous = this.db
        .prepare(
          "SELECT digest,status,response FROM idempotency WHERE actor_id=? AND route=? AND key=?",
        )
        .get(actorId, route, key);
      if (previous) {
        if (previous.digest !== hash)
          throw new AppError(
            409,
            "IDEMPOTENCY_CONFLICT",
            "Esta clave ya se utilizó con otra entrada.",
          );
        return {
          status: Number(previous.status),
          value: JSON.parse(previous.response as string),
        };
      }
      const result = work();
      const status = result.status ?? 200;
      this.db
        .prepare("INSERT INTO idempotency VALUES(?,?,?,?,?,?)")
        .run(
          actorId,
          route,
          key,
          hash,
          status,
          JSON.stringify(result.value ?? null),
        );
      return { status, value: result.value };
    });
  }
  event(resourceId: string, actorId: string, type: string, message: string) {
    const row = this.db
      .prepare(
        "SELECT COALESCE(MAX(sequence),0)+1 AS next FROM events WHERE resource_id=?",
      )
      .get(resourceId)!;
    const event: JobEvent = {
      sequence: Number(row.next),
      actorId,
      type,
      message,
      createdAt: this.now(),
    };
    this.db
      .prepare("INSERT INTO events VALUES(?,?,?,?,?,?)")
      .run(resourceId, event.sequence, actorId, type, message, event.createdAt);
    return event;
  }
  events(resourceId: string, after = 0): JobEvent[] {
    return this.db
      .prepare(
        "SELECT sequence,actor_id,type,message,created_at FROM events WHERE resource_id=? AND sequence>? ORDER BY sequence LIMIT 100",
      )
      .all(resourceId, after)
      .map((row) => ({
        sequence: Number(row.sequence),
        actorId: row.actor_id as string,
        type: row.type as string,
        message: row.message as string,
        createdAt: row.created_at as string,
      }));
  }
  suppressContent(jobId: string) {
    const containsInput = (value: unknown): boolean => {
      if (!value || typeof value !== "object") return false;
      if (Array.isArray(value)) return value.some(containsInput);
      const object = value as Record<string, unknown>;
      if (
        (object.id === jobId || object.jobId === jobId) &&
        ("files" in object || "findings" in object || "testCases" in object)
      )
        return true;
      return Object.values(object).some(containsInput);
    };
    for (const row of this.db
      .prepare("SELECT actor_id,route,key,response FROM idempotency")
      .all())
      if (containsInput(JSON.parse(row.response as string))) {
        // Keep the key and original request digest: deleting it would permit a replay
        // to create a new resource or effect. Only the sensitive response is removed.
        this.db
          .prepare(
            "UPDATE idempotency SET status=410,response=? WHERE actor_id=? AND route=? AND key=?",
          )
          .run(
            JSON.stringify({
              error: {
                code: "CONTENT_REMOVED",
                message:
                  "La respuesta original contenía información retirada; el efecto no se repite.",
              },
            }),
            row.actor_id as string,
            row.route as string,
            row.key as string,
          );
      }
    for (const task of this.list<{
      id: string;
      jobId: string;
      findings?: unknown;
    }>("task").filter((task) => task.jobId === jobId)) {
      delete task.findings;
      this.save("task", task);
    }
    this.remove("report", jobId);
  }
  notify(
    actorId: string,
    title: string,
    message: string,
    jobId?: string,
    orderId?: string,
  ) {
    if (
      this.get<{ notificationsEnabled: boolean }>("preferences", actorId)
        ?.notificationsEnabled === false
    )
      return;
    const value: Notification = {
      id: id("notice"),
      actorId,
      title,
      message,
      jobId,
      orderId,
      read: false,
      createdAt: this.now(),
    };
    this.save("notification", value);
  }
  close() {
    this.db.close();
  }
}
