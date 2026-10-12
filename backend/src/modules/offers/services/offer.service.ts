import type { Actor, CreateOfferDto, Offer } from "@agentnexo/api-contracts";
import { Store, id } from "../../../shared/database/store.js";
import { ensure } from "../../../shared/errors.js";
import { requireRole } from "../../context/context.js";
import { OfferRepository } from "../repositories/offer.repository.js";
export class OfferService {
  readonly repo: OfferRepository;
  constructor(private store: Store) {
    this.repo = new OfferRepository(store);
  }
  list(actor: Actor, search = "", profile = "") {
    return this.repo
      .list()
      .filter(
        (offer) =>
          (offer.status === "approved" ||
            offer.providerId === actor.id ||
            actor.roles.includes("admin")) &&
          (!profile || offer.profile === profile) &&
          `${offer.name} ${offer.providerName}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      );
  }
  get(actor: Actor, offerId: string) {
    const offer = this.repo.get(offerId);
    ensure(
      offer &&
        (offer.status === "approved" ||
          offer.providerId === actor.id ||
          actor.roles.includes("admin")),
      404,
      "NOT_FOUND",
      "La oferta no existe.",
    );
    return offer;
  }
  create(actor: Actor, dto: CreateOfferDto) {
    requireRole(actor, "provider");
    const offer: Offer = {
      id: id("offer"),
      version: 1,
      providerId: actor.id,
      providerName: actor.name,
      name: dto.name,
      description: dto.description,
      profile: dto.profile,
      status: "draft",
      price: { currencyKey: "USDC_DEMO", scale: 7, minor: dto.priceMinor },
      createdAt: this.store.now(),
      updatedAt: this.store.now(),
    };
    this.repo.save(offer);
    this.store.event(
      offer.id,
      actor.id,
      "offer_created",
      "Oferta local creada.",
    );
    return offer;
  }
  edit(
    actor: Actor,
    offerId: string,
    dto: Partial<CreateOfferDto> & { expectedVersion: number },
  ) {
    requireRole(actor, "provider");
    const offer = this.get(actor, offerId);
    ensure(
      offer.providerId === actor.id,
      404,
      "NOT_FOUND",
      "La oferta no existe.",
    );
    ensure(
      offer.version === dto.expectedVersion,
      412,
      "VERSION_CONFLICT",
      "La oferta cambió; vuelve a cargarla.",
    );
    const next = {
      ...offer,
      version: offer.version + 1,
      status: "draft" as const,
      name: dto.name ?? offer.name,
      description: dto.description ?? offer.description,
      profile: dto.profile ?? offer.profile,
      price: { ...offer.price, minor: dto.priceMinor ?? offer.price.minor },
      moderationReason: undefined,
      updatedAt: this.store.now(),
    };
    this.store.event(
      offer.id,
      actor.id,
      "offer_versioned",
      "Nueva versión pendiente de aprobación; órdenes previas intactas.",
    );
    return this.repo.save(next);
  }
  submit(actor: Actor, offerId: string, expectedVersion: number) {
    requireRole(actor, "provider");
    const offer = this.get(actor, offerId);
    ensure(
      offer.providerId === actor.id,
      404,
      "NOT_FOUND",
      "La oferta no existe.",
    );
    ensure(
      offer.version === expectedVersion,
      412,
      "VERSION_CONFLICT",
      "La oferta cambió.",
    );
    ensure(
      ["draft", "rejected"].includes(offer.status),
      409,
      "INVALID_STATE",
      "Esta oferta no se puede enviar ahora.",
    );
    offer.status = "pending";
    offer.updatedAt = this.store.now();
    this.repo.save(offer);
    this.store.notify("admin", "Oferta pendiente", offer.name);
    return offer;
  }
  moderate(
    actor: Actor,
    offerId: string,
    dto: {
      expectedVersion: number;
      decision: "approve" | "reject" | "suspend";
      reason: string;
    },
  ) {
    requireRole(actor, "admin");
    const offer = this.get(actor, offerId);
    ensure(
      offer.providerId !== actor.id,
      403,
      "CONFLICT_OF_INTEREST",
      "No puedes moderar tu propia oferta.",
    );
    ensure(
      offer.version === dto.expectedVersion,
      412,
      "VERSION_CONFLICT",
      "La oferta cambió.",
    );
    ensure(
      dto.decision === "suspend"
        ? offer.status === "approved"
        : offer.status === "pending",
      409,
      "INVALID_STATE",
      "Esta decisión no corresponde al estado de la oferta.",
    );
    offer.status =
      dto.decision === "approve"
        ? "approved"
        : dto.decision === "reject"
          ? "rejected"
          : "suspended";
    offer.moderationReason = dto.reason;
    offer.updatedAt = this.store.now();
    this.repo.save(offer);
    this.store.event(offer.id, actor.id, `offer_${offer.status}`, dto.reason);
    this.store.notify(
      offer.providerId,
      "Moderación de oferta",
      `${offer.name}: ${dto.reason}`,
    );
    return offer;
  }
  withdraw(
    actor: Actor,
    offerId: string,
    expectedVersion: number,
    reason: string,
  ) {
    requireRole(actor, "provider");
    const offer = this.get(actor, offerId);
    ensure(
      offer.providerId === actor.id,
      404,
      "NOT_FOUND",
      "La oferta no existe.",
    );
    ensure(
      offer.version === expectedVersion,
      412,
      "VERSION_CONFLICT",
      "La oferta cambió.",
    );
    ensure(
      ["approved", "pending"].includes(offer.status),
      409,
      "INVALID_STATE",
      "Sólo se retira una oferta publicada o pendiente.",
    );
    offer.status = "suspended";
    offer.moderationReason = `Retirada por proveedor: ${reason}`;
    offer.updatedAt = this.store.now();
    this.repo.save(offer);
    this.store.event(offer.id, actor.id, "offer_withdrawn", reason);
    return offer;
  }
}
