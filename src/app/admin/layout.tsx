"use client";

import Link from "next/link";
import styles from "./admin.module.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <div className={styles.adminLayout}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <Link href="/admin">
                            <h2>LAB<span style={{ color: "var(--accent)" }}>PRO</span> ADMIN</h2>
                        </Link>
                    </div>
                    <nav className={styles.nav}>
                        <ul className={styles.navList}>
                            <li><Link href="/admin" className={styles.navLink}>Dashboard</Link></li>
                            <li><Link href="/admin/products" className={styles.navLink}>Products</Link></li>
                            <li><Link href="/admin/brands" className={styles.navLink}>Brands</Link></li>
                            <li><Link href="/admin/categories" className={styles.navLink}>Categories</Link></li>
                            <li><Link href="/admin/users" className={styles.navLink}>Users</Link></li>
                            <li><Link href="/admin/settings" className={styles.navLink}>Settings</Link></li>
                        </ul>
                    </nav>
                    <div className={styles.sidebarFooter}>
                        <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                            <span style={{ display: 'block', color: 'var(--gray-400)' }}>Logged in as:</span>
                            <strong>{user?.email}</strong>
                        </div>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                </aside>

                <div className={styles.mainWrapper}>
                    <header className={styles.topbar}>
                        <div className={styles.searchBar}>
                            <input type="text" placeholder="Search..." />
                        </div>
                        <div className={styles.profileMenu}>
                            <div className={styles.avatar}>{user?.email?.charAt(0).toUpperCase() || "A"}</div>
                        </div>
                    </header>

                    <main className={styles.contentArea}>
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
