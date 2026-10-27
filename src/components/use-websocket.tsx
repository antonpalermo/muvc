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

        webSocket.onopen = () => setState(WebSocket["OPEN"]);
        webSocket.onmessage = (e) => {
            setMessage(e.data);
        };
        webSocket.onerror = (e) => {
            console.log(
                "websocket encountered an error connecting with the following reason: ",
                e,
            );
        };
        webSocket.onclose = (e) => {
            console.log("websocket is closed with the following reason: ", {
                code: e.code,
                reason: e.reason,
                wasClean: e.wasClean,
            });

            if (webSocketRef.current === webSocket) {
                setState(WebSocket["CLOSED"]);
                webSocket.close();
            }
        };

        return () => {
            webSocket.onopen = null;
            webSocket.onclose = null;
            webSocket.onmessage = null;

            if (webSocketRef.current === webSocket) {
                webSocketRef.current = null;
            }

            webSocket.close();
        };
    }, [id]);

    const send = useCallback((data: string) => {
        const socket = webSocketRef.current;

        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(data);
        }
    }, []);

    return { state, message, send };
}
