import { useEffect, useRef } from "react";
import { useWebSocket } from "./use-websocket";

export type ConferenceRoomProps = {
    id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const websocketEndpoint = `${protocol}://${location.host}/api/room/${id}`;

    const socket = useWebSocket(websocketEndpoint);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const joinedRef = useRef<boolean>(false);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
            });
        }

        return () => {
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
        };
    }, []);

    async function joinCall() {
        const stream = await getMediaStream();

        if (!peerConnectionRef.current) {
            return;
        }

        stream.getTracks().forEach((track) => {
            peerConnectionRef.current?.addTrack(track, stream);
        });

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        socket.send({
            type: "offer",
            data: peerConnectionRef.current.localDescription,
        });
    }

    useEffect(() => {
        if (socket.state !== WebSocket["OPEN"] || joinedRef.current) {
            return;
        }

        joinedRef.current = true;
        socket.send({
            type: "join",
            data: { name: "Anton", timeStamp: Date.now().toPrecision() },
        });
    }, [socket.state, socket.send]);

    async function getMediaStream() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
            },
        });

        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        return stream;
    }

    return (
        <div>
            <h1 className="text-red-500">Conference: {id}</h1>
            <div>
                <video ref={videoRef} autoPlay className="w-2xl h-80" />
                <button onClick={async () => await getMediaStream()}>
                    Allow Microphone and Camera
                </button>
                <button onClick={joinCall}>Join</button>
            </div>
        </div>
    );
}
