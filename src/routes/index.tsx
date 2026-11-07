import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const navigate = useNavigate();
    const [id, setId] = useState("");

    const join = async (id?: string) => {
        const uuid = id ? id : crypto.randomUUID();

        const request = await fetch(`/api/room/${uuid}/session/new`, {
            method: "POST",
        });

        console.log(await request.json());

        navigate({
            to: "/room/$id",
            params: { id: uuid },
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
                <button
                    onClick={() =>
                        navigate({ to: "/room/$id", params: { id } })
                    }
                >
                    join
                </button>
            </div>
        </div>
    );
}
