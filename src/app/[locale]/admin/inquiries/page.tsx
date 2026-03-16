'use client';

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await fetch("/api/inquiries");
            if (res.ok) {
                const data = await res.json();
                setInquiries(data);
            }
        } catch (error) {
            console.error("Failed to fetch inquiries");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Yükleniyor...</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>📩 Gelen Talepler & Başvurular</h1>
                <p className={styles.subtitle}>Alt markalar (WeCare, WeApply vb.) üzerinden gelen müşteri talepleri.</p>
            </div>

            <div className={styles.card}>
                {inquiries.length === 0 ? (
                    <p>Henüz bir başvuru bulunmamaktadır.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Hizmet</th>
                                    <th>Ad Soyad</th>
                                    <th>Şirket</th>
                                    <th>E-posta / Telefon</th>
                                    <th>Mesaj</th>
                                    <th>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.map((inq) => (
                                    <tr key={inq.id}>
                                        <td>{new Date(inq.createdAt).toLocaleDateString("tr-TR")}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                fontSize: '0.85rem'
                                            }}>
                                                {inq.serviceName}
                                            </span>
                                        </td>
                                        <td><strong>{inq.name}</strong></td>
                                        <td>{inq.company || "-"}</td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <div>{inq.email}</div>
                                                <div style={{ color: 'var(--text-muted)' }}>{inq.phone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ 
                                                maxWidth: '300px', 
                                                whiteSpace: 'pre-wrap', 
                                                fontSize: '0.85rem' 
                                            }}>
                                                {inq.message}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[inq.status.toLowerCase()]}`}>
                                                {inq.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
