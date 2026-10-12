import type { Offer } from "@agentnexo/api-contracts";
import { Store } from "../../../shared/database/store.js";
export class OfferRepository {
  constructor(private store: Store) {}
  get(id: string) {
    return this.store.get<Offer>("offer", id);
  }
  list() {
    return this.store.list<Offer>("offer");
  }
  save(offer: Offer) {
    this.store.save("offer-version", {
      ...offer,
      id: `${offer.id}:${offer.version}`,
      offerId: offer.id,
    });
    return this.store.save("offer", offer);
  }
}
