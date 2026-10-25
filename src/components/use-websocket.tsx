import { useCallback, useEffect, useRef, useState } from "react";

export function useWebSocket(id: string) {
    const [state, setState] = useState("connecting");
    const websocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const protocol = location.protocol === "https" ? "wss" : "ws";

        const ws = new WebSocket(
            `${protocol}://${location.host}/api/room/${id}`,
        );

        websocketRef.current = ws;

        ws.onopen = () => setState("open");
        ws.onclose = () => setState("closed");

        return () => {
            ws.close();
        };
    }, [id]);

    const send = useCallback((data: string) => {
        const socket = websocketRef.current;

        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(data);
        }
    }, []);

    return { state, send };
}
