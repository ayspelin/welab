"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

interface AuthContextType {
    user: any | null;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    const user = session?.user || null;
    const isLoading = status === "loading";

    const logout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <AuthContext.Provider value={{ user, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProviderInner>{children}</AuthProviderInner>
        </SessionProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
