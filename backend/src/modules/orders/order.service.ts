import type {
  Actor,
  CreateOrderDto,
  Job,
  Order,
  SalesView,
} from "@agentnexo/api-contracts";
import { Store, id } from "../../shared/database/store.js";
import { afterMinutes, amount, isBefore } from "../../shared/money.js";
import { ensure } from "../../shared/errors.js";
import { requireRole } from "../context/context.js";
import { JobService } from "../jobs/job.service.js";
import { OfferService } from "../offers/services/offer.service.js";

export class OrderService {
  onStart: (job: Job) => void = () => {};
  constructor(
    private store: Store,
    private jobs: JobService,
    private offers: OfferService,
  ) {}
  internal(orderId: string) {
    const order = this.store.get<Order>("order", orderId);
    ensure(order, 404, "NOT_FOUND", "La orden no existe.");
    return order;
  }
  get(actor: Actor, orderId: string) {
    const order = this.internal(orderId);
    ensure(
      [order.buyerId, order.providerId, order.arbiterId].includes(actor.id) ||
        actor.roles.includes("admin"),
      404,
      "NOT_FOUND",
      "La orden no existe.",
    );
    return order;
  }
  list(actor: Actor) {
    ensure(
      actor.id !== "visitor",
      403,
      "ROLE_REQUIRED",
      "Elige un actor privado de demostración.",
    );
    return this.store
      .list<Order>("order")
      .filter(
        (order) =>
          [order.buyerId, order.providerId, order.arbiterId].includes(
            actor.id,
          ) || actor.roles.includes("admin"),
      );
  }
  private buyer(actor: Actor, order: Order) {
    requireRole(actor, "buyer");
    ensure(order.buyerId === actor.id, 404, "NOT_FOUND", "La orden no existe.");
  }
  private open(order: Order) {
    ensure(
      !["paid", "refunded"].includes(order.escrowState),
      409,
      "ORDER_CLOSED",
      "La contratación ya está cerrada.",
    );
  }
  create(actor: Actor, dto: CreateOrderDto) {
    requireRole(actor, "buyer");
    const job = this.jobs.get(actor, dto.jobId);
    const offer = this.offers.get(actor, dto.offerId);
    ensure(
      offer.status === "approved" && offer.version === dto.offerVersion,
      409,
      "OFFER_CHANGED",
      "La oferta ya no está vigente en esa versión.",
    );
    ensure(
      job.policy?.accepted &&
        job.authorizationId === dto.authorizationId &&
        job.policy.inputDigest === job.inputDigest,
      409,
      "NOT_AUTHORIZED",
      "Acepta la política vigente antes de contratar.",
    );
    ensure(
      job.policy.mode === offer.profile,
      422,
      "PROFILE_MISMATCH",
      "La política y el perfil de la oferta deben coincidir.",
    );
    ensure(
      actor.id !== offer.providerId,
      409,
      "SELF_CONTRACT",
      "El comprador y proveedor deben ser diferentes.",
    );
    if (job.orderId) {
      const existing = this.internal(job.orderId);
      ensure(
        existing.offer.id === offer.id &&
          existing.offer.version === offer.version,
        409,
        "ALREADY_CONTRACTED",
        "Este encargo ya tiene otra contratación.",
      );
      return existing;
    }
    const config = this.store.get<{ admissionPaused: boolean }>(
      "config",
      "operation",
    )!;
    ensure(
      !config.admissionPaused,
      409,
      "ADMISSION_PAUSED",
      "Las nuevas contrataciones están pausadas.",
    );
    const active = this.store
      .list<Order>("order")
      .filter((order) => !["paid", "refunded"].includes(order.escrowState));
    ensure(
      active.length < 10,
      409,
      "CAPACITY_EXCEEDED",
      "Las diez plazas demo están ocupadas; no se inició financiación.",
    );
    const order: Order = {
      id: id("order"),
      version: 1,
      jobId: job.id,
      buyerId: actor.id,
      providerId: offer.providerId,
      arbiterId: "admin",
      offer: structuredClone(offer),
      policy: structuredClone(job.policy),
      price: { ...offer.price },
      financingState: "pending",
      escrowState: "unfunded",
      executionState: "ready",
      deliveryState: "pending",
      createdAt: this.store.now(),
    };
    ensure(
      order.arbiterId !== order.buyerId && order.arbiterId !== order.providerId,
      409,
      "CONFLICT_OF_INTEREST",
      "El árbitro debe ser independiente.",
    );
    job.orderId = order.id;
    job.version++;
    job.updatedAt = this.store.now();
    this.store.save("job", job);
    this.store.save("order", order);
    this.store.event(
      job.id,
      actor.id,
      "order_created",
      "Oferta y política congeladas; plaza reservada antes de financiación demo.",
    );
    this.store.notify(
      order.providerId,
      "Nueva contratación",
      job.title,
      job.id,
      order.id,
    );
    return order;
  }
  fund(actor: Actor, orderId: string) {
    const order = this.get(actor, orderId);
    this.buyer(actor, order);
    this.open(order);
    if (order.financingState === "confirmed") return order;
    ensure(
      order.escrowState === "unfunded",
      409,
      "INVALID_STATE",
      "La orden no admite financiación.",
    );
    order.financingState = "confirmed";
    order.escrowState = "funded";
    order.fundedAt = this.store.now();
    order.startDeadline = afterMinutes(
      order.fundedAt,
      order.policy.deadlines.startMinutes,
    );
    order.version++;
    this.store.save("order", order);
    this.store.event(
      order.jobId,
      actor.id,
      "order_funded",
      "Precio simulado retenido; financiación confirmada localmente, sin blockchain.",
    );
    return order;
  }
  start(actor: Actor, orderId: string) {
    const order = this.get(actor, orderId);
    this.buyer(actor, order);
    this.open(order);
    const job = this.jobs.internal(order.jobId);
    if (order.startedAt) return { order, job };
    ensure(
      order.escrowState === "funded" && order.financingState === "confirmed",
      409,
      "NOT_FUNDED",
      "El precio debe estar financiado antes de iniciar.",
    );
    ensure(
      order.startDeadline && isBefore(this.store.now(), order.startDeadline),
      409,
      "START_DEADLINE_EXPIRED",
      "Venció el plazo de inicio; puedes reclamar devolución.",
    );
    const config = this.store.get<{ spendingPaused: boolean }>(
      "config",
      "operation",
    )!;
    ensure(
      !config.spendingPaused,
      409,
      "SPENDING_PAUSED",
      "El nuevo consumo está pausado.",
    );
    order.escrowState = "running";
    order.executionState = "queued";
    order.startedAt = this.store.now();
    order.deliveryDeadline = afterMinutes(
      order.startedAt,
      order.policy.deadlines.deliveryMinutes,
    );
    order.version++;
    job.state = "queued";
    job.version++;
    job.updatedAt = this.store.now();
    this.store.save("job", job);
    this.store.save("order", order);
    this.onStart(job);
    this.store.event(
      job.id,
      actor.id,
      "execution_queued",
      "Revisión admitida una sola vez; análisis determinista local.",
    );
    return { order, job };
  }
  cancel(actor: Actor, orderId: string, reason = "Cancelación solicitada") {
    const order = this.get(actor, orderId);
    this.buyer(actor, order);
    this.open(order);
    const job = this.jobs.internal(order.jobId);
    if (order.escrowState === "unfunded" || order.escrowState === "funded")
      this.closeOrder(order, "refund", actor.id, reason);
    else {
      ensure(
        ["running", "delivered", "disputed"].includes(order.escrowState),
        409,
        "INVALID_STATE",
        "No se puede cancelar ahora.",
      );
      job.state = "cancelled";
      order.executionState = "cancelled";
      order.version++;
      this.store.save("job", job);
      this.store.save("order", order);
      this.store.event(
        job.id,
        actor.id,
        "execution_cancelled",
        `${reason}. El precio continúa sujeto a garantía; los consumos no se revierten.`,
      );
    }
    return { order: this.internal(order.id), job: this.jobs.internal(job.id) };
  }
  deliver(job: Job, partial: boolean) {
    const order = this.internal(job.orderId!);
    if (
      order.escrowState !== "running" ||
      !order.deliveryDeadline ||
      !isBefore(this.store.now(), order.deliveryDeadline)
    )
      return;
    order.escrowState = "delivered";
    order.deliveryState = "available";
    order.executionState = partial ? "partial" : "completed";
    order.deliveredAt = this.store.now();
    order.acceptanceDeadline = afterMinutes(
      order.deliveredAt,
      order.policy.deadlines.acceptanceHours * 60,
    );
    order.version++;
    this.store.save("order", order);
    this.store.notify(
      order.buyerId,
      "Informe disponible",
      partial
        ? "Entrega parcial: revisa sus limitaciones antes de aceptar."
        : "Revisa el informe y decide aceptar o disputar.",
      job.id,
      order.id,
    );
    this.store.notify(
      order.providerId,
      "Entrega publicada",
      "El comprador puede aceptar o disputar; el precio sigue retenido.",
      job.id,
      order.id,
    );
  }
  accept(actor: Actor, orderId: string) {
    const order = this.get(actor, orderId);
    this.buyer(actor, order);
    this.open(order);
    ensure(
      order.escrowState === "delivered" &&
        order.acceptanceDeadline &&
        isBefore(this.store.now(), order.acceptanceDeadline),
      409,
      "INVALID_STATE",
      "La aceptación requiere entrega disponible antes del vencimiento, sin disputa.",
    );
    return this.closeOrder(
      order,
      "pay",
      actor.id,
      "Entrega aceptada por comprador (simulación local).",
    );
  }
  dispute(actor: Actor, orderId: string, reason: string, evidence: string) {
    const order = this.get(actor, orderId);
    this.buyer(actor, order);
    this.open(order);
    ensure(
      ["running", "delivered"].includes(order.escrowState),
      409,
      "INVALID_STATE",
      "Sólo se disputa durante ejecución o tras entrega.",
    );
    ensure(
      !order.acceptanceDeadline ||
        isBefore(this.store.now(), order.acceptanceDeadline),
      409,
      "DISPUTE_DEADLINE_EXPIRED",
      "El plazo de disputa venció.",
    );
    order.escrowState = "disputed";
    order.disputedAt = this.store.now();
    order.disputeDeadline = afterMinutes(
      order.disputedAt,
      order.policy.deadlines.disputeDays * 24 * 60,
    );
    order.dispute = { reason, evidence };
    order.version++;
    const job = this.jobs.internal(order.jobId);
    if (["queued", "running"].includes(job.state)) {
      job.state = "cancelled";
      order.executionState = "cancelled";
      this.store.save("job", job);
    }
    this.store.save("order", order);
    this.store.event(
      job.id,
      actor.id,
      "dispute_opened",
      "Disputa abierta con evidencia privada; nuevo despacho detenido.",
    );
    this.store.notify(
      order.providerId,
      "Disputa abierta",
      reason,
      job.id,
      order.id,
    );
    this.store.notify(
      order.arbiterId,
      "Disputa pendiente",
      reason,
      job.id,
      order.id,
    );
    return order;
  }
  respond(actor: Actor, orderId: string, response: string) {
    const order = this.get(actor, orderId);
    requireRole(actor, "provider");
    ensure(
      order.providerId === actor.id,
      404,
      "NOT_FOUND",
      "La venta no existe.",
    );
    this.open(order);
    ensure(
      order.escrowState === "disputed" && order.dispute,
      409,
      "INVALID_STATE",
      "No hay una disputa abierta.",
    );
    order.dispute.response = response;
    order.version++;
    this.store.save("order", order);
    this.store.notify(
      order.buyerId,
      "Respuesta del proveedor",
      response,
      order.jobId,
      order.id,
    );
    return order;
  }
  resolve(
    actor: Actor,
    orderId: string,
    outcome: "pay" | "refund",
    reason: string,
  ) {
    const order = this.get(actor, orderId);
    requireRole(actor, "admin");
    ensure(
      actor.id === order.arbiterId &&
        actor.id !== order.buyerId &&
        actor.id !== order.providerId,
      403,
      "CONFLICT_OF_INTEREST",
      "Sólo el árbitro asignado e independiente puede resolver.",
    );
    this.open(order);
    ensure(
      order.escrowState === "disputed" &&
        order.dispute &&
        order.disputeDeadline &&
        isBefore(this.store.now(), order.disputeDeadline),
      409,
      "INVALID_STATE",
      "La resolución requiere una disputa abierta antes del vencimiento.",
    );
    order.dispute.resolution = reason;
    return this.closeOrder(order, outcome, actor.id, reason);
  }
  renounce(actor: Actor, orderId: string, reason: string) {
    const order = this.get(actor, orderId);
    requireRole(actor, "provider");
    ensure(
      order.providerId === actor.id,
      404,
      "NOT_FOUND",
      "La venta no existe.",
    );
    this.open(order);
    return this.closeOrder(order, "refund", actor.id, reason);
  }
  claim(
    actor: Actor,
    orderId: string,
    kind: "no_start" | "no_delivery" | "silence" | "unresolved",
  ) {
    const order = this.get(actor, orderId);
    ensure(
      actor.id === order.buyerId || actor.id === order.providerId,
      403,
      "PARTY_REQUIRED",
      "La reclamación corresponde a una parte de la contratación.",
    );
    this.open(order);
    const rules = {
      no_start: {
        state: "funded",
        deadline: order.startDeadline,
        outcome: "refund",
      },
      no_delivery: {
        state: "running",
        deadline: order.deliveryDeadline,
        outcome: "refund",
      },
      silence: {
        state: "delivered",
        deadline: order.acceptanceDeadline,
        outcome: "pay",
      },
      unresolved: {
        state: "disputed",
        deadline: order.disputeDeadline,
        outcome: "refund",
      },
    } as const;
    const rule = rules[kind];
    ensure(
      order.escrowState === rule.state &&
        rule.deadline &&
        !isBefore(this.store.now(), rule.deadline),
      409,
      "DEADLINE_NOT_REACHED",
      "El estado o vencimiento todavía no permiten esta reclamación.",
    );
    return this.closeOrder(
      order,
      rule.outcome,
      actor.id,
      `Reclamación por plazo: ${kind}.`,
    );
  }
  private closeOrder(
    order: Order,
    outcome: "pay" | "refund",
    actorId: string,
    reason: string,
  ) {
    this.open(order);
    const transferred =
      order.financingState === "confirmed"
        ? { ...order.price }
        : { ...order.price, minor: "0" };
    order.escrowState = outcome === "pay" ? "paid" : "refunded";
    order.closedAt = this.store.now();
    order.closureReason = reason;
    order.version++;
    const job = this.jobs.internal(order.jobId);
    if (["ready", "queued", "running", "paused"].includes(job.state)) {
      job.state = "cancelled";
      order.executionState = "cancelled";
      this.store.save("job", job);
    }
    this.store.save("order", order);
    this.store.save("closure", {
      id: order.id,
      outcome,
      amount: transferred,
      recipientId: outcome === "pay" ? order.providerId : order.buyerId,
      reason,
      actorId,
      simulation: true,
      createdAt: order.closedAt,
    });
    this.store.event(
      job.id,
      actorId,
      `order_${order.escrowState}`,
      `${reason} Movimiento simulado ${transferred.minor}; herramientas y modelos permanecen separados.`,
    );
    this.store.notify(
      order.buyerId,
      "Contratación cerrada",
      reason,
      job.id,
      order.id,
    );
    this.store.notify(
      order.providerId,
      "Contratación cerrada",
      reason,
      job.id,
      order.id,
    );
    return order;
  }
  sales(actor: Actor): SalesView {
    requireRole(actor, "provider");
    const items = this.store
      .list<Order>("order")
      .filter((order) => order.providerId === actor.id);
    let retained = 0n,
      paid = 0n,
      refunded = 0n;
    for (const order of items)
      if (order.financingState === "confirmed") {
        if (order.escrowState === "paid") paid += amount(order.price.minor);
        else if (order.escrowState === "refunded")
          refunded += amount(order.price.minor);
        else retained += amount(order.price.minor);
      }
    return {
      items,
      totals: [
        {
          currencyKey: "USDC_DEMO",
          scale: 7,
          retained: retained.toString(),
          paid: paid.toString(),
          refunded: refunded.toString(),
        },
      ],
    };
  }
}
