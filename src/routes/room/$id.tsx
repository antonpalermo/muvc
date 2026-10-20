import { createFileRoute } from "@tanstack/react-router";
import ConferenceRoom from "../../components/room";

export const Route = createFileRoute("/room/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <ConferenceRoom id={id} />;
}
