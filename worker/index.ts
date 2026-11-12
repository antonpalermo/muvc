import { Hono } from "hono";
import type { ConferenceSocket } from "./conference-socket.ts";

export { ConferenceSocket } from "./conference-socket.ts";

// export type HonoBindings = CloudflareBindings & {
//     CONFERENCE_SOCKET: DurableObjectNamespace<ConferenceSocket>;
// };

export type HonoBindings = {
    Bindings: CloudflareBindings;
    Variables: {
        conference: DurableObjectNamespace<ConferenceSocket>;
    };
};

const app = new Hono<HonoBindings>().basePath("/api");

app.post("/room/:id/session/new", async (ctx) => {
    const roomId = ctx.req.param().id;
    const sfu = `https://rtc.live.cloudflare.com/v1/apps/${ctx.env.SFU_APP_ID}/sessions/new`;

    const request = await fetch(sfu, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ctx.env.SFU_APP_TOKEN}`,
            "Content-Type": "application/json",
        },
    });

    const data = await request.json();

    return ctx.json({ roomId, status: "success", data });
});

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
