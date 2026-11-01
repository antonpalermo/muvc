import { useEffect, useRef, } from "react";
import { useWebSocket } from "./use-websocket";

export type ConferenceRoomProps = {
    id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
    const socket = useWebSocket(id);
    const me = useRef<HTMLVideoElement | null>(null)

    async function allowUserMedia() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            },
        })

        if (stream && me.current) {
            me.current.srcObject = stream
        }

        return stream
    }

    useEffect(() => {
        if (socket.state === WebSocket["OPEN"]) {
            socket.send({ type: "join", data: { name: "Anton" } });
        }
    }, [id]);

    return (
        <div>
            <h1 className="text-red-500">Conference: {id}</h1>
            <div>
                <video ref={me} autoPlay className="w-2xl h-80" />
                <button onClick={async () => await allowUserMedia()}>Allow Microphone and Camera</button>
            </div>
        </div>
    );
}
