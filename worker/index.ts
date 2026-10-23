import { Hono } from "hono";
import type { ConferenceSocket } from "./conference-socket.ts";

export { ConferenceSocket } from "./conference-socket.ts";

export type HonoBindings = CloudflareBindings & {
    CONFERENCE_SOCKET: DurableObjectNamespace<ConferenceSocket>;
};

const app = new Hono<{
    Bindings: HonoBindings;
}>().basePath("/api");

app.get("/room/:id", async (ctx) => {
    const roomId = ctx.req.param().id;
    const upgradeHeader = ctx.req.header("Upgrade");

    if (!upgradeHeader || upgradeHeader !== "websocket") {
        return ctx.text("worker expected upgrade header: websocket", 426);
    }

    let stub = ctx.env.CONFERENCE_SOCKET.getByName(`${roomId}`);
    // pass the fetch request to durable object's fetch()
    return stub.fetch(ctx.req.raw);
});

export default app;
