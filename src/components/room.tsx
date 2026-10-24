import { useEffect } from "react";

export type ConferenceRoomProps = {
    id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
    useEffect(() => {
        const protocol = location.protocol === "https" ? "wss" : "ws";
        const ws = new WebSocket(
            `${protocol}://${location.host}/api/room/${id}`,
        );

        ws.onopen = () => {
            console.log("ws connected on ", id);
        };

        ws.onmessage = (e) => {
            console.log("msg", e.data);
        };

        return () => {
            if (ws.readyState === 1) {
                ws.close();
            }
        };
    }, [id]);

    return <h1>Conference Room {id}</h1>;
}
