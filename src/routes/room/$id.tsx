import { createFileRoute } from "@tanstack/react-router";
import Room from "../../components/room";

export const Route = createFileRoute("/room/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <Room id={id} />;
}
