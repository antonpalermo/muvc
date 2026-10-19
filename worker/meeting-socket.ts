import { DurableObject } from "cloudflare:workers";

export default class MeetingSocket extends DurableObject {
  sessions: Map<WebSocket, { [key: string]: string }>;

  /**
   * this websocket will auto hybernate there's no connection available
   * for cost reason.
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();

    this.ctx.getWebSockets().forEach((ws) => {
      let attachment = ws.deserializeAttachment();
      if (attachment) {
        this.sessions.set(ws, { ...attachment });
      }
    });

    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
  }

  async fetch(_: Request): Promise<Response> {
    const id = crypto.randomUUID();
    const socketPair = new WebSocketPair();
    const [client, server] = Object.values(socketPair);

    this.ctx.acceptWebSocket(server);
    this.sessions.set(server, { id });
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    // Get the session associated with the WebSocket connection.
    const session = this.sessions.get(ws)!;

    // Upon receiving a message from the client, the server replies with the same message, the session ID of the connection,
    // and the total number of connections with the "[Durable Object]: " prefix
    ws.send(
      `[Durable Object] message: ${message}, from: ${session.id}, to: the initiating client. Total connections: ${this.sessions.size}`,
    );

    // Send a message to all WebSocket connections, loop over all the connected WebSockets.
    this.sessions.forEach((_attachment, connectedWs) => {
      connectedWs.send(
        `[Durable Object] message: ${message}, from: ${session.id}, to: all clients. Total connections: ${this.sessions.size}`,
      );
    });

    // Send a message to all WebSocket connections except the connection (ws),
    // loop over all the connected WebSockets and filter out the connection (ws).
    this.sessions.forEach((_attachment, connectedWs) => {
      if (connectedWs !== ws) {
        connectedWs.send(
          `[Durable Object] message: ${message}, from: ${session.id}, to: all clients except the initiating client. Total connections: ${this.sessions.size}`,
        );
      }
    });
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    _wasClean: boolean,
  ) {
    // With web_socket_auto_reply_to_close (compat date >= 2026-04-07), the runtime
    // auto-replies to Close frames. Calling close() is safe but no longer required.
    ws.close(code, reason);
    this.sessions.delete(ws);
  }
}
