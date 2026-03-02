"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles: string[];
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Not logged in -> redirect to login
                router.push("/login");
            } else if (!allowedRoles.includes(user.role)) {
                // Logged in but unauthorized
                router.push("/");
            }
        }
    }, [user, isLoading, allowedRoles, router]);

    if (isLoading || !user || !allowedRoles.includes(user.role)) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Checking permissions...</p>
            </div>
        );
    }

    return <>{children}</>;
}
