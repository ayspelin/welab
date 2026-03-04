"use client";

import styles from "./admin.module.css";
import { mockProducts, mockUsers } from "@/lib/mockData";

export default function AdminDashboard() {
    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Kontrol Paneli Özeti</h1>
                <button className="btn btn-primary">Rapor İndir</button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Toplam Ürün</span>
                    <span className={styles.statValue}>{mockProducts.length}</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#16a34a' }}>Geçen aya göre +12%</p>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Aktif Kullanıcı</span>
                    <span className={styles.statValue}>{mockUsers.length}</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Tüm test kullanıcıları yüklendi</p>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Bekleyen Siparişler</span>
                    <span className={styles.statValue}>12</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>Geçen aya göre -2%</p>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Destek Talepleri</span>
                    <span className={styles.statValue}>5</span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#d97706' }}>İlgilenilmeli</p>
                </div>
            </div>

            <div className={styles.recentActivity}>
                <h2 className={styles.sectionTitle}>Son Sistem Aktiviteleri</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>İşlem</th>
                                <th>Tarih</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>dealer@test.com</td>
                                <td>Tech Ana HPLC Kılavuzu indirildi</td>
                                <td>Bugün, 10:45</td>
                                <td><span className={`${styles.statusBadge} ${styles.active}`}>Başarılı</span></td>
                            </tr>
                            <tr>
                                <td>admin@test.com</td>
                                <td>Ürün fiyatları güncellendi (SpectraGen)</td>
                                <td>Dün, 15:20</td>
                                <td><span className={`${styles.statusBadge} ${styles.active}`}>Başarılı</span></td>
                            </tr>
                            <tr>
                                <td>superadmin@test.com</td>
                                <td>Yeni bayi hesabı oluşturuldu</td>
                                <td>24 Eki, 09:15</td>
                                <td><span className={styles.statusBadge} style={{ backgroundColor: '#FEF08A', color: '#854D0E' }}>Bekliyor</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
