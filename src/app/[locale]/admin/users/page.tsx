"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalToggle = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isApproved: !currentStatus }),
            });
            if (res.ok) {
                // Update local state instead of full refetch for better UX
                setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isApproved: !currentStatus } : u));
            } else {
                alert("Durum güncellenirken hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            alert("Sunucu hatası.");
        }
    };

    if (loading) return <div className={styles.adminMain}><p>Yükleniyor...</p></div>;

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Kullanıcı Onay ve Yönetimi</h1>
            </div>

            <div className={styles.listCard}>
                <h2>Kayıtlı ve Bekleyen Kullanıcılar</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Kayıt Tarihi</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>E-posta Doğrulaması</th>
                                <th>Admin Onayı</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={styles.roleBadge}>{u.role}</span>
                                    </td>
                                    <td>
                                        {u.emailVerified ? (
                                            <span style={{ color: "green", fontWeight: "bold" }}>✔ Doğrulandı</span>
                                        ) : (
                                            <span style={{ color: "red" }}>Bekliyor</span>
                                        )}
                                    </td>
                                    <td>
                                        {u.isApproved ? (
                                            <span style={{ color: "green", fontWeight: "bold" }}>✔ Onaylı</span>
                                        ) : (
                                            <span style={{ color: "orange", fontWeight: "bold" }}>⏳ Onay Bekliyor</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleApprovalToggle(u.id, u.isApproved)}
                                            style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "4px",
                                                border: "none",
                                                cursor: "pointer",
                                                backgroundColor: u.isApproved ? "#fee2e2" : "#dcfce7",
                                                color: u.isApproved ? "#991b1b" : "#166534",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            {u.isApproved ? "Onayı Kaldır" : "Kullanıcıyı Onayla"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                                        Henüz kayıtlı kullanıcı bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
