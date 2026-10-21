import { Hono } from "hono";
import type { ConferenceSocket } from "./conference-socket.ts";

export type Bindings = {
  CONFERENCE_SOCKET: DurableObjectNamespace<ConferenceSocket>;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/status", (ctx) => {
  return ctx.json({ message: "sample" });
});

app.get("/room/:id/:amount", (ctx) => {
  let stub = ctx.env.CONFERENCE_SOCKET.getByName(`${ctx.req.param().id}`);
  const amount = parseInt(ctx.req.param().amount);

  const result = stub.increment(amount);

  return new Response(`Durable Object: ${result}`);
});

export default app;
