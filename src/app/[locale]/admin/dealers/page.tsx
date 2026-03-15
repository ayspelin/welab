"use client";

import { useState, useEffect } from "react";
import styles from "./dealers.module.css";

export default function DealersAdminPage() {
    const [dealers, setDealers] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const cities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];

    useEffect(() => {
        fetchDealers();
    }, []);

    const fetchDealers = async () => {
        try {
            const res = await fetch("/api/dealers");
            if (res.ok) {
                const data = await res.json();
                setDealers(data);
            }
        } catch (error) { console.error(error); }
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setCity("");
        setAddress("");
        setPhone("");
        setEmail("");
        setWebsite("");
        setIsActive(true);
        setMessage("");
    };

    const handleEditClick = (dealer: any) => {
        setEditingId(dealer.id);
        setName(dealer.name);
        setCity(dealer.city);
        setAddress(dealer.address || "");
        setPhone(dealer.phone || "");
        setEmail(dealer.email || "");
        setWebsite(dealer.website || "");
        setIsActive(dealer.isActive);
        setMessage("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" bayisini silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/dealers/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Bayi silinemedi");
            setMessage("Bayi başarıyla silindi!");
            fetchDealers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const method = editingId ? "PATCH" : "POST";
            const apiurl = editingId ? `/api/dealers/${editingId}` : "/api/dealers";

            const res = await fetch(apiurl, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, city, address, phone, email, website, isActive }),
            });

            if (!res.ok) throw new Error("İşlem başarısız");

            setMessage(`Bayi başarıyla ${editingId ? 'güncellendi' : 'eklendi'}!`);
            resetForm();
            fetchDealers();
        } catch (error: any) {
            setMessage(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Bayi Yönetimi</h1>
                <p className={styles.subtitle}>Harita üzerinde görünecek bayileri buradan yönetebilirsiniz.</p>
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.card}>
                    <h2>{editingId ? "Bayiyi Düzenle" : "Yeni Bayi Ekle"}</h2>
                    {message && (
                        <div className={`${styles.alert} ${message.includes("hata") ? styles.alertError : styles.alertSuccess}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Bayi Adı *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Şehir *</label>
                            <select value={city} onChange={(e) => setCity(e.target.value)} required>
                                <option value="">Şehir Seçin</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Adres</label>
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Telefon</label>
                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Website</label>
                            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
                        </div>
                        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="isActive" />
                            <label htmlFor="isActive">Aktif</label>
                        </div>
                        <div className={styles.formActions}>
                            {editingId && <button type="button" className={styles.cancelBtn} onClick={resetForm}>İptal</button>}
                            <button type="submit" disabled={loading} className={styles.submitBtn}>
                                {loading ? "İşleniyor..." : (editingId ? "Güncelle" : "Ekle")}
                            </button>
                        </div>
                    </form>
                </div>

                <div className={styles.listCard}>
                    <h2>Mevcut Bayiler ({dealers.length})</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Bayi Adı</th>
                                    <th>Şehir</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dealers.map((dealer) => (
                                    <tr key={dealer.id}>
                                        <td><strong>{dealer.name}</strong></td>
                                        <td>{dealer.city}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(dealer)}>Düzenle</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteClick(dealer.id, dealer.name)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
