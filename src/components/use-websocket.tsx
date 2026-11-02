import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionState =
    | WebSocket["CONNECTING"]
    | WebSocket["OPEN"]
    | WebSocket["CLOSING"]
    | WebSocket["CLOSED"];

export type SocketMessage = string | Blob | ArrayBuffer;
export type SocketData =
    string | Record<string, unknown> | unknown[] | number | boolean | null;

export function useWebSocket(
    url: string | URL,
    options?: { reconnectDelay?: number },
) {
    const reconnectDelay = options?.reconnectDelay ?? 1500;
    const urlString = String(url);

    const [state, setState] = useState<ConnectionState>(
        WebSocket["CONNECTING"],
    );
    const [message, setMessage] = useState<SocketMessage | null>(null);

    const webSocketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const manuallyClosedRef = useRef(false);

    const clearReconnectTimer = useCallback(() => {
        if (reconnectTimerRef.current !== null) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        let disposed = false;
        let initialConnectTimer: ReturnType<typeof setTimeout> | null = null;
        let socket: WebSocket | null = null;

        manuallyClosedRef.current = false;

        const connect = () => {
            if (disposed || manuallyClosedRef.current) {
                return;
            }

            clearReconnectTimer();
            socket = new WebSocket(urlString);
            webSocketRef.current = socket;
            setState(socket.readyState);

            const currentSocket = socket;
            const isCurrent = () =>
                !disposed &&
                !manuallyClosedRef.current &&
                webSocketRef.current === currentSocket;

            const onOpen = () => {
                if (isCurrent()) {
                    setState(WebSocket["OPEN"]);
                }
            };

            const onMessage = (event: MessageEvent) => {
                if (isCurrent()) {
                    setMessage(event.data);
                }
            };

            const onError = (event: Event) => {
                if (isCurrent()) {
                    console.error("WebSocket connection error:", event);
                }
            };

            const onClose = (event: CloseEvent) => {
                currentSocket.removeEventListener("open", onOpen);
                currentSocket.removeEventListener("message", onMessage);
                currentSocket.removeEventListener("error", onError);
                currentSocket.removeEventListener("close", onClose);

                if (!isCurrent()) {
                    return;
                }

                webSocketRef.current = null;
                setState(WebSocket["CLOSED"]);
                reconnectTimerRef.current = setTimeout(
                    connect,
                    reconnectDelay,
                );
                console.info(
                    `WebSocket closed (${event.code}): ${event.reason || "no reason supplied"}`,
                );
            };

            currentSocket.addEventListener("open", onOpen);
            currentSocket.addEventListener("message", onMessage);
            currentSocket.addEventListener("error", onError);
            currentSocket.addEventListener("close", onClose);
        };

        // Avoid opening a socket during StrictMode's discarded effect setup.
        initialConnectTimer = setTimeout(connect, 0);

        return () => {
            disposed = true;
            if (initialConnectTimer !== null) {
                clearTimeout(initialConnectTimer);
            }
            clearReconnectTimer();

            const currentSocket = socket;
            socket = null;

            if (webSocketRef.current === currentSocket) {
                webSocketRef.current = null;
            }

            if (currentSocket) {
                currentSocket.close();
            }
        };
    }, [urlString, reconnectDelay, clearReconnectTimer]);

    const send = useCallback((data: SocketData) => {
        const socket = webSocketRef.current;

        if (!socket) {
            return false;
        }

        if (socket?.readyState !== WebSocket.OPEN) {
            return false;
        }

        const payload = typeof data === "string" ? data : JSON.stringify(data);
        socket.send(payload);

        return true;
    }, []);

    const close = useCallback(() => {
        manuallyClosedRef.current = true;
        clearReconnectTimer();
        const socket = webSocketRef.current;
        webSocketRef.current = null;

        if (socket) {
            socket.close();
        }

        setState(WebSocket["CLOSED"]);
    }, [clearReconnectTimer]);

    return {
        state,
        message,
        send,
        close,
    };
}
