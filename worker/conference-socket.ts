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

    webSocketMessage(
        ws: WebSocket,
        message: string | ArrayBuffer,
    ): void | Promise<void> {
        if (typeof message !== "string") {
            return;
        }

        console.log(message)

        if (message === "message") ws.send("this is a secret message");
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
