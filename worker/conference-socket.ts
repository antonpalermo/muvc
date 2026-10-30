import { DurableObject } from "cloudflare:workers";
import type { HonoBindings } from "./index.ts";

export class ConferenceSocket extends DurableObject {
    participants: Map<WebSocket, { [key: string]: string }>;

    constructor(ctx: DurableObjectState, env: HonoBindings) {
        super(ctx, env);
        this.participants = new Map();

        this.ctx.getWebSockets().forEach((ws) => {
            let attachment = ws.deserializeAttachment();
            if (attachment) {
                this.participants.set(ws, { ...attachment });
            }
        });

        this.ctx.setWebSocketAutoResponse(
            new WebSocketRequestResponsePair("ping", "pong"),
        );
    }

    fetch(_request: Request): Response | Promise<Response> {
        const wsPair = new WebSocketPair();
        const [client, server] = Object.values(wsPair);

        this.ctx.acceptWebSocket(server);

        const id = crypto.randomUUID();
        server.serializeAttachment({ id });

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    webSocketMessage(
        ws: WebSocket,
        message: string | ArrayBuffer,
    ): void | Promise<void> {
        if (typeof message !== "string") {
            return;
        }

        const data = JSON.parse(message);

        if (data.type === "join") {
            ws.send(JSON.stringify("this should be the participants "));
        }
    }

    webSocketClose(
        ws: WebSocket,
        code: number,
        reason: string,
        _wasClean: boolean,
    ): void | Promise<void> {
        ws.close(code, reason);
        console.log(`connection closed: ${code} with ${reason}`);
    }

    webSocketError(_ws: WebSocket, error: unknown): void | Promise<void> {
        console.error(`Websocket error`, error);
    }
}
