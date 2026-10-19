import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [id, setId] = useState("");

  const join = (id?: string) => {
    navigate({
      to: "/room/$id",
      params: { id: id ?? crypto.randomUUID() },
    });
  };

  return (
    <div>
      <h1>Multi User Video Conferencing App</h1>
      <button onClick={() => join()}>create room</button>
      <div>
        <input
          id="id"
          name="id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={() => navigate({ to: "/room/$id", params: { id } })}>
          join
        </button>
      </div>
    </div>
  );
}
