import { useEffect } from "react";

export type ConferenceRoomProps = {
  id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
  useEffect(() => {
    const protocol = location.protocol === "https" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${location.host}/api/room/${id}`);

    ws.addEventListener("message", (e) => console.log("message: ", e));

    return () => {
      ws.removeEventListener("message", (e) => {
        console.log("removed: ", e);
      });
      ws.close();
    };
  }, [id]);

  return <h1>Conference Room {id}</h1>;
}
