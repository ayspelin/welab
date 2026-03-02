"use client";

import styles from "./portal.module.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { mockDocuments } from "@/lib/mockData";

export default function DealerPortal() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={["DEALER", "ADMIN", "SUPER_ADMIN"]}>
            <div className={`container ${styles.portalLayout}`}>
                <aside className={styles.sidebar}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{user?.name.charAt(0)}</div>
                        <h3>{user?.name}</h3>
                        <span className={styles.roleBadge}>{user?.role}</span>
                    </div>
                    <nav className={styles.portalNav}>
                        <ul>
                            <li><a href="#" className={styles.active}>Documents</a></li>
                            <li><a href="#">Order History</a></li>
                            <li><a href="#">Support Tickets</a></li>
                            <li><a href="#">Settings</a></li>
                        </ul>
                    </nav>
                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <button
                            onClick={logout}
                            style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.header}>
                        <h2>Dealer Documents</h2>
                        <p>Download price lists, manuals, and marketing materials.</p>
                    </div>

                    <div className={styles.docGrid}>
                        {mockDocuments.map(doc => (
                            <div key={doc.id} className={styles.docCard}>
                                <div className={styles.docIcon}>📄</div>
                                <div className={styles.docInfo}>
                                    <h4>{doc.title}</h4>
                                    <span className={styles.docType}>{doc.type}</span>
                                </div>
                                <button className="btn btn-secondary" onClick={() => alert(`Downloading ${doc.title}...`)}>
                                    Download
                                </button>
                            </div>
                        ))}

                        {mockDocuments.length === 0 && (
                            <p style={{ color: 'var(--gray-500)' }}>No documents available right now.</p>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
