"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Pathname might include the locale e.g. /en/admin, /tr/admin
    const isAdminRoute = pathname?.match(/^\/([a-z]{2}\/)?admin($|\/)/) || pathname?.match(/^\/([a-z]{2}\/)?dealer-portal($|\/)/);

    if (isAdminRoute) {
        return (
            <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <main className="main-content" style={{ flex: 1, display: 'flex' }}>
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="app-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
        </div>
    );
}
