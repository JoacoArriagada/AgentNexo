import type {
  BudgetBucket,
  BudgetView,
  Job,
  Order,
  Payment,
} from "@agentnexo/api-contracts";
import { Store, digest, id } from "../../shared/database/store.js";
import { amount, balance } from "../../shared/money.js";
import { ensure } from "../../shared/errors.js";

export class BudgetService {
  constructor(private store: Store) {}
  list(jobId: string): Payment[] {
    return this.store.db
      .prepare(
        "SELECT data FROM financial_operations WHERE job_id=? ORDER BY rowid",
      )
      .all(jobId)
      .map((row) => JSON.parse(row.data as string));
  }
  get(operationId: string): Payment | undefined {
    const row = this.store.db
      .prepare("SELECT data FROM financial_operations WHERE id=?")
      .get(operationId);
    return row ? JSON.parse(row.data as string) : undefined;
  }
  private totals(jobId: string, category: string) {
    const statement = this.store.db.prepare(
      "SELECT COALESCE(SUM(reserved),0) reserved,COALESCE(SUM(confirmed),0) confirmed FROM financial_operations WHERE job_id=? AND category=?",
    );
    statement.setReadBigInts(true);
    const row = statement.get(jobId, category)!;
    return {
      reserved: row.reserved as bigint,
      confirmed: row.confirmed as bigint,
    };
  }
  view(job: Job): BudgetView {
    const policy = job.policy;
    const buckets: BudgetBucket[] = [
      {
        category: "models",
        currencyKey: "USD",
        scale: 9,
        ...balance(
          amount(policy?.modelLimitMinor ?? "0"),
          this.totals(job.id, "models").reserved,
          this.totals(job.id, "models").confirmed,
        ),
      },
      {
        category: "tools",
        currencyKey: "USDC_DEMO",
        scale: 7,
        ...balance(
          amount(policy?.toolLimitMinor ?? "0"),
          this.totals(job.id, "tools").reserved,
          this.totals(job.id, "tools").confirmed,
        ),
      },
      {
        category: "fees",
        currencyKey: "XLM_DEMO",
        scale: 7,
        ...balance(amount(policy?.feeLimitMinor ?? "0"), 0n, 0n),
      },
    ];
    const order = job.orderId
      ? this.store.get<Order>("order", job.orderId)
      : undefined;
    const price = amount(order?.price.minor ?? "0");
    const closed = order && ["paid", "refunded"].includes(order.escrowState);
    buckets.push({
      category: "contract",
      currencyKey: "USDC_DEMO",
      scale: 7,
      ...balance(
        price,
        order && order.financingState === "confirmed" && !closed ? price : 0n,
        order?.escrowState === "paid" ? price : 0n,
      ),
    });
    return {
      jobId: job.id,
      financialState: buckets.some((bucket) => bucket.deficit !== "0")
        ? "over_limit"
        : buckets.some((bucket) => bucket.reserved !== "0")
          ? "pending"
          : "settled",
      buckets,
    };
  }
  reserve(
    job: Job,
    providerId: string,
    role: string,
    kind: "model" | "tool",
    minor: string,
    logicalKey: string,
  ): Payment {
    return this.store.transaction(() => {
      const payloadDigest = digest({
        jobId: job.id,
        providerId,
        role,
        kind,
        minor,
        logicalKey,
      });
      const previous = this.store.db
        .prepare(
          "SELECT data,digest FROM financial_operations WHERE job_id=? AND logical_key=?",
        )
        .get(job.id, logicalKey);
      if (previous) {
        ensure(
          previous.digest === payloadDigest,
          409,
          "OPERATION_CONFLICT",
          "La operación lógica ya tiene otra entrada.",
        );
        return JSON.parse(previous.data as string);
      }
      const category = kind === "model" ? "models" : "tools";
      const currencyKey =
        kind === "model" ? ("USD" as const) : ("USDC_DEMO" as const);
      const scale = kind === "model" ? 9 : 7;
      const value = amount(minor);
      ensure(
        value > 0n,
        422,
        "INVALID_AMOUNT",
        "La reserva debe ser positiva.",
      );
      const current = this.store.get<Job>("job", job.id);
      ensure(
        current && ["queued", "running"].includes(current.state),
        409,
        "DISPATCH_STOPPED",
        "El encargo no admite nuevos consumos.",
      );
      const config = this.store.get<{ spendingPaused: boolean }>(
        "config",
        "operation",
      )!;
      const policy = job.policy;
      ensure(
        policy?.accepted,
        409,
        "NOT_AUTHORIZED",
        "No hay política aceptada.",
      );
      if (kind === "tool")
        ensure(
          job.context === "public-demo" &&
            policy.allowTools &&
            policy.mode === "two-role-demo" &&
            ["service-a", "service-b"].includes(providerId),
          409,
          "TOOL_NOT_APPLICABLE",
          "La herramienta no es aplicable a esta entrada.",
        );
      const limit = amount(
        kind === "model" ? policy.modelLimitMinor : policy.toolLimitMinor,
      );
      const totals = this.totals(job.id, category);
      const roleLimit =
        kind === "model" && policy.mode === "two-role-demo"
          ? limit / 2n
          : limit;
      const statement = this.store.db.prepare(
        "SELECT COALESCE(SUM(reserved+confirmed),0) committed FROM financial_operations WHERE job_id=? AND category=? AND json_extract(data,'$.role')=?",
      );
      statement.setReadBigInts(true);
      const roleCommitted = statement.get(job.id, category, role)!
        .committed as bigint;
      const reason = config.spendingPaused
        ? "SPENDING_PAUSED"
        : this.view(job).financialState === "over_limit"
          ? "OVER_LIMIT"
          : kind === "tool" && value > amount(policy.maxOperationMinor)
            ? "OPERATION_LIMIT_EXCEEDED"
            : value + totals.reserved + totals.confirmed > limit ||
                value + roleCommitted > roleLimit
              ? "BUDGET_EXCEEDED"
              : undefined;
      const operation: Payment = {
        id: id("operation"),
        jobId: job.id,
        providerId,
        role,
        kind,
        amount: { currencyKey, scale, minor },
        financialState: reason ? "rejected" : "reserved",
        deliveryState: reason ? "failed" : "pending",
        reason,
        createdAt: this.store.now(),
        logicalKey,
      };
      this.store.db
        .prepare(
          "INSERT INTO financial_operations(id,job_id,logical_key,digest,category,currency_key,amount,reserved,confirmed,data) VALUES(?,?,?,?,?,?,?,?,?,?)",
        )
        .run(
          operation.id,
          job.id,
          logicalKey,
          payloadDigest,
          category,
          currencyKey,
          value,
          reason ? 0n : value,
          0n,
          JSON.stringify(operation),
        );
      this.store.event(
        job.id,
        role,
        reason ?? "budget_reserved",
        reason
          ? `${providerId}: ${reason}; no hubo envío ni consumo.`
          : `${providerId}: reserva local ${minor} ${currencyKey}.`,
      );
      return operation;
    });
  }
  confirm(
    operationId: string,
    deliveryState: "available" | "failed" = "available",
    confirmedMinor?: string,
  ) {
    return this.store.transaction(() => {
      const operation = this.get(operationId);
      ensure(operation, 404, "NOT_FOUND", "La operación no existe.");
      if (operation.financialState === "confirmed") return operation;
      ensure(
        ["reserved", "prepared", "submitted", "uncertain"].includes(
          operation.financialState,
        ),
        409,
        "INVALID_STATE",
        "No se puede confirmar esta operación.",
      );
      const confirmed = amount(confirmedMinor ?? operation.amount.minor);
      operation.amount.minor = confirmed.toString();
      operation.financialState = "confirmed";
      operation.deliveryState = deliveryState;
      operation.receipt = {
        id: id("receipt-demo"),
        simulation: true,
        createdAt: this.store.now(),
      };
      this.store.db
        .prepare(
          "UPDATE financial_operations SET reserved=0,confirmed=?,data=? WHERE id=?",
        )
        .run(confirmed, JSON.stringify(operation), operation.id);
      this.store.event(
        operation.jobId,
        operation.role,
        "payment_confirmed",
        `${operation.providerId}: consumo simulado confirmado; entrega ${deliveryState}.`,
      );
      return operation;
    });
  }
  uncertain(operationId: string) {
    const operation = this.get(operationId)!;
    operation.financialState = "uncertain";
    operation.reason = "DEMO_UNCERTAIN";
    this.store.db
      .prepare("UPDATE financial_operations SET data=? WHERE id=?")
      .run(JSON.stringify(operation), operation.id);
    this.store.event(
      operation.jobId,
      operation.role,
      "payment_uncertain",
      "Resultado simulado incierto; reserva retenida hasta conciliación explícita.",
    );
    return operation;
  }
  fail(operationId: string, reason: string) {
    const operation = this.get(operationId);
    ensure(operation, 404, "NOT_FOUND", "La operación no existe.");
    ensure(
      operation.financialState === "uncertain" ||
        operation.financialState === "reserved",
      409,
      "INVALID_STATE",
      "No se puede liberar un consumo confirmado.",
    );
    operation.financialState = "failed";
    operation.deliveryState = "failed";
    operation.reason = reason;
    this.store.db
      .prepare("UPDATE financial_operations SET reserved=0,data=? WHERE id=?")
      .run(JSON.stringify(operation), operation.id);
    this.store.event(operation.jobId, "admin", "payment_reconciled", reason);
    return operation;
  }
  recoverDelivery(operationId: string) {
    const operation = this.get(operationId);
    ensure(
      operation?.financialState === "confirmed" &&
        operation.deliveryState === "failed",
      409,
      "INVALID_STATE",
      "Sólo se recupera una entrega pagada y fallida.",
    );
    operation.deliveryState = "available";
    operation.reason = undefined;
    this.store.db
      .prepare("UPDATE financial_operations SET data=? WHERE id=?")
      .run(JSON.stringify(operation), operation.id);
    this.store.event(
      operation.jobId,
      operation.role,
      "delivery_recovered",
      "Entrega recuperada de la misma operación, sin otro consumo.",
    );
    return operation;
  }
}
