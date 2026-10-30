import { useEffect } from "react";
import { useWebSocket } from "./use-websocket";

export type ConferenceRoomProps = {
    id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
    const socket = useWebSocket(id);

    useEffect(() => {
        if (socket.state === WebSocket["OPEN"]) {
            socket.send({ type: "join", data: { name: "Anton" } });
        }
    });

    return (
        <div>
            <h1 className="text-red-500">Conference: {id}</h1>
        </div>
    );
}
