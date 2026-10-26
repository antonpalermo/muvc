import { useIdentityProvider } from "./identity-provider";

export type ConferenceRoomProps = {
    id: string; // room id
};

export default function ConferenceRoom({ id }: ConferenceRoomProps) {
    const identity = useIdentityProvider();

    return (
        <div>
            <div>
                <label htmlFor="name">Name </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={identity.name}
                    onChange={(e) => identity.set(e.currentTarget.value)}
                />
            </div>
            <h1>Conference: {id}</h1>
        </div>
    );
}
