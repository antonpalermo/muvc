import { DurableObject } from "cloudflare:workers";
import type { HonoBindings } from "./index.ts";

export type Participant = {
    name: string;
    [key: string]: any;
};

export class ConferenceSocket extends DurableObject {
    participants: Map<WebSocket, Participant>;

    constructor(ctx: DurableObjectState, env: HonoBindings) {
        super(ctx, env);
        this.participants = new Map();

        this.ctx.setWebSocketAutoResponse(
            new WebSocketRequestResponsePair("ping", "pong"),
        );
    }

    fetch(_request: Request): Response | Promise<Response> {
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        this.ctx.acceptWebSocket(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    broadcast(message: string) {
        this.ctx.getWebSockets().forEach((ws) => {
            ws.send(message);
        });
    }

    webSocketMessage(
        _webSocket: WebSocket,
        message: string | ArrayBuffer,
    ): void | Promise<void> {
        if (typeof message === "string") {
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
