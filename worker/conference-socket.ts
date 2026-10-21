import { DurableObject } from "cloudflare:workers";

export class ConferenceSocket extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async increment(amount: number) {
    return amount * 2;
  }
}
