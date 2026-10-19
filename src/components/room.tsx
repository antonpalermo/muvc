import { useEffect } from "react";

export type RoomProps = {
  id: string; // room id
};

export default function Room({ id }: RoomProps) {
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
}
