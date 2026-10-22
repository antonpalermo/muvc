import { DurableObject } from "cloudflare:workers";

export class ConferenceSocket extends DurableObject {
  async increment(amount: number) {
    return amount * 2;
  }
}
