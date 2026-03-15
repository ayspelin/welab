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
            <div className={styles.adminLayout} data-admin="true">
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <Link href="/admin">
                            <h2>WE<span style={{ color: "var(--accent)" }}>LAB</span> ADMIN</h2>
                        </Link>
                    </div>
                    <nav className={styles.nav}>
                        <ul className={styles.navList}>
                            <li><Link href="/admin" className={styles.navLink}>Kontrol Paneli</Link></li>
                            <li><Link href="/admin/products" className={styles.navLink}>Ürünler</Link></li>
                            <li><Link href="/admin/brands" className={styles.navLink}>Markalar</Link></li>
                            <li><Link href="/admin/dealers" className={styles.navLink}>Bayiler</Link></li>
                            <li><Link href="/admin/categories" className={styles.navLink}>Kategoriler</Link></li>
                            <li><Link href="/admin/references" className={styles.navLink}>Referanslar</Link></li>
                            <li><Link href="/admin/events" className={styles.navLink}>Etkinlikler</Link></li>
                            <li><Link href="/admin/users" className={styles.navLink}>Kullanıcılar</Link></li>
                            <li><Link href="/admin/settings" className={styles.navLink}>Ayarlar</Link></li>
                        </ul>
                    </nav>
                    <div className={styles.sidebarFooter}>
                        <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                            <span style={{ display: 'block', color: 'var(--gray-400)' }}>Oturum açan:</span>
                            <strong>{user?.email}</strong>
                        </div>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Çıkış Yap
                        </button>
                    </div>
                </aside>

                <div className={styles.mainWrapper}>
                    <header className={styles.topbar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <Link href="/" target="_blank" className={styles.viewLiveBtn}>
                                🌍 Ana Sayfaya Git
                            </Link>
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
