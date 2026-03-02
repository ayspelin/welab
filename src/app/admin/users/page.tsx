"use client";

import styles from "../admin.module.css";
import { mockUsers } from "@/lib/mockData";

export default function UsersPage() {
    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Kullanıcı Yönetimi</h1>
            </div>

            <div className={styles.listCard}>
                <h2>Mevcut Kullanıcılar</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>İsim</th>
                                <th>Email</th>
                                <th>Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={styles.roleBadge}>{u.role}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
