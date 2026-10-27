import { useWebSocket } from "./use-websocket";

export type ConferenceRoomProps = {
    id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
    const socket = useWebSocket(id);

    return (
        <div>
            <h1>Conference: {id}</h1>
            <button onClick={() => socket.send("ping")}>click</button>
        </div>
    );
}
