import { createContext, useContext, useState, type ReactNode } from "react";

export const IdentityContext = createContext<{
    name: string;
    set: (name: string) => void;
}>({ name: "", set: () => {} });

export function useIdentityProvider() {
    const context = useContext(IdentityContext);

    if (typeof context === "undefined") {
        throw new Error(
            "useIdentityProvider must be used within IdentityProvider",
        );
    }

    return context;
}

export type IndentityProviderProps = {
    children: ReactNode;
};

export default function IdentityProvider({ children }: IndentityProviderProps) {
    const [name, setName] = useState("");

    function set(name: string) {
        setName(name);
    }

    return (
        <IdentityContext.Provider value={{ name, set }}>
            {children}
        </IdentityContext.Provider>
    );
}
