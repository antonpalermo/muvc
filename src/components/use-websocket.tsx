import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionState =
    | WebSocket["CONNECTING"]
    | WebSocket["OPEN"]
    | WebSocket["CLOSING"]
    | WebSocket["CLOSED"];

export type SocketMessage = string | Blob | ArrayBuffer;

export function useWebSocket(id: string) {
    const [message, setMessage] = useState<SocketMessage>("");
    const [state, setState] = useState<ConnectionState>(
        WebSocket["CONNECTING"],
    );
    const webSocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        setState(WebSocket["CONNECTING"]);

        const protocol = location.protocol === "https:" ? "wss" : "ws";

        const webSocket = new WebSocket(
            `${protocol}://${location.host}/api/room/${id}`,
        );

        webSocketRef.current = webSocket;

        function onOpenHandler() {
            webSocket.send("ping");
        }

        function onMessageHandler(e: MessageEvent) {
            if ((e.data as string) === "pong") {
                setState(WebSocket["OPEN"]);
            }
            setMessage(e.data);
        }

        function onErrorHandler(e: Event) {
            console.log(
                "client encountered error when connecting to websocket: ",
                e,
            );

            if (webSocketRef.current === webSocket) {
                webSocketRef.current = null;
                setState(WebSocket["CLOSED"]);
            }
        }

        function onCloseHandler(e: CloseEvent) {
            console.log(
                "client closed websocket connection with the following reason: ",
                {
                    code: e.code,
                    reason: e.reason,
                    wasClean: e.wasClean,
                },
            );

            if (webSocketRef.current === webSocket) {
                webSocketRef.current = null;
                setState(WebSocket["CLOSED"]);
            }
        }

        webSocket.addEventListener("open", onOpenHandler);
        webSocket.addEventListener("error", onErrorHandler);
        webSocket.addEventListener("message", onMessageHandler);
        webSocket.addEventListener("close", onCloseHandler);

        return () => {
            webSocket.removeEventListener("open", onOpenHandler);
            webSocket.removeEventListener("error", onErrorHandler);
            webSocket.removeEventListener("message", onMessageHandler);
            webSocket.removeEventListener("close", onCloseHandler);

            if (webSocketRef.current === webSocket) {
                webSocketRef.current = null;
            }

            webSocket.close();
        };
    }, [id]);

    const send = useCallback((data: { [key: string]: any }) => {
        const socket = webSocketRef.current;

        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        }
    }, []);

    return { state, message, send };
}
