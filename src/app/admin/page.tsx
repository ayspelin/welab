"use client";

import styles from "./admin.module.css";
import { mockProducts, mockUsers } from "@/lib/mockData";

export default function AdminDashboard() {
    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <button className="btn btn-primary">Download Report</button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Total Products</span>
                    <span className={styles.statValue}>{mockProducts.length}</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#16a34a' }}>+12% from last month</p>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Active Users</span>
                    <span className={styles.statValue}>{mockUsers.length}</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>All mock users loaded</p>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Pending Orders</span>
                    <span className={styles.statValue}>12</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>-2% from last month</p>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Support Tickets</span>
                    <span className={styles.statValue}>5</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#d97706' }}>Needs attention</p>
                </div>
            </div>

            <div className={styles.recentActivity}>
                <h2 className={styles.sectionTitle}>Recent System Activity</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>dealer@test.com</td>
                                <td>Downloaded Tech Ana HPLC Manual</td>
                                <td>Today, 10:45 AM</td>
                                <td><span className={`${styles.statusBadge} ${styles.active}`}>Success</span></td>
                            </tr>
                            <tr>
                                <td>admin@test.com</td>
                                <td>Updated product prices (SpectraGen)</td>
                                <td>Yesterday, 15:20 PM</td>
                                <td><span className={`${styles.statusBadge} ${styles.active}`}>Success</span></td>
                            </tr>
                            <tr>
                                <td>superadmin@test.com</td>
                                <td>Created new dealer account</td>
                                <td>Oct 24, 09:15 AM</td>
                                <td><span className={styles.statusBadge} style={{ backgroundColor: '#FEF08A', color: '#854D0E' }}>Pending</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
