"use client";

import { useState, useEffect } from "react";
import styles from "../brands/brands.module.css";
import Image from "next/image";

export default function EventsAdminPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [title_tr, setTitleTr] = useState("");
    const [title_en, setTitleEn] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [description_tr, setDescTr] = useState("");
    const [description_en, setDescEn] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            if (res.ok) setEvents(await res.json());
        } catch (e) { console.error(e); }
    };

    const resetForm = () => {
        setEditingId(null); setTitleTr(""); setTitleEn("");
        setLocation(""); setDate(""); setDescTr(""); setDescEn("");
        setFile(null); setPreviewUrl(""); setMessage("");
    };

    const handleEditClick = (ev: any) => {
        setEditingId(ev.id); setTitleTr(ev.title_tr); setTitleEn(ev.title_en || "");
        setLocation(ev.location || ""); setDescTr(ev.description_tr || ""); setDescEn(ev.description_en || "");
        setDate(ev.date ? new Date(ev.date).toISOString().slice(0, 10) : "");
        setPreviewUrl(ev.imageUrl || ""); setFile(null); setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`"${title}" etkinliğini silmek istiyor musunuz?`)) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silinemedi");
            setMessage("Etkinlik silindi.");
            fetchEvents();
        } catch (e: any) { alert(e.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMessage("");
        try {
            let finalImageUrl = previewUrl;
            if (file) {
                const fd = new FormData(); fd.append("file", file);
                const up = await fetch("/api/upload", { method: "POST", body: fd });
                if (!up.ok) throw new Error("Görsel yüklenemedi");
                finalImageUrl = (await up.json()).url;
            }
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/events/${editingId}` : "/api/events";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title_tr, title_en, location, date, description_tr, description_en, imageUrl: finalImageUrl || null }),
            });
            if (!res.ok) throw new Error(`İşlem başarısız: ${await res.text()}`);
            setMessage(`Etkinlik başarıyla ${editingId ? "güncellendi" : "eklendi"}!`);
            resetForm(); fetchEvents();
        } catch (e: any) {
            setMessage(e.message || "Hata oluştu");
        } finally { setLoading(false); }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Etkinlik Yönetimi</h1>
                <p className={styles.subtitle}>Fuarlar, konferanslar ve katıldığınız etkinlikleri buradan yönetebilirsiniz.</p>
            </div>
            <div className={styles.contentGrid}>
                {/* Form */}
                <div className={styles.card}>
                    <h2>{editingId ? "Etkinliği Düzenle" : "Yeni Etkinlik Ekle"}</h2>
                    {message && (
                        <div className={`${styles.alert} ${message.includes("Hata") || message.includes("başarısız") ? styles.alertError : styles.alertSuccess}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Etkinlik Adı (TR) *</label>
                            <input type="text" value={title_tr} onChange={e => setTitleTr(e.target.value)} required placeholder="Örn: Analytica Munich 2024" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Etkinlik Adı (EN)</label>
                            <input type="text" value={title_en} onChange={e => setTitleEn(e.target.value)} placeholder="Örn: Analytica Munich 2024" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Yer (Şehir / Ülke)</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Örn: Münih, Almanya" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tarih *</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Açıklama (TR)</label>
                            <textarea value={description_tr} onChange={e => setDescTr(e.target.value)} rows={3} placeholder="Etkinlik hakkında kısa bilgi..." />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Açıklama (EN)</label>
                            <textarea value={description_en} onChange={e => setDescEn(e.target.value)} rows={3} placeholder="Short description about the event..." />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Etkinlik Görseli (Opsiyonel)</label>
                            {previewUrl && (
                                <div className={styles.imagePreview}>
                                    <Image src={previewUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                    <button type="button" className={styles.removeImageBtn} onClick={() => setPreviewUrl("")}>×</button>
                                </div>
                            )}
                            <label className={styles.fileUploadBtn}>
                                <span>Görsel Seç</span>
                                <input type="file" accept="image/*" onChange={e => {
                                    if (e.target.files?.[0]) { setFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); }
                                }} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div className={styles.formActions}>
                            {editingId && <button type="button" className={styles.cancelBtn} onClick={resetForm}>İptal</button>}
                            <button type="submit" disabled={loading} className={styles.submitBtn}>
                                {loading ? "İşleniyor..." : (editingId ? "Güncelle" : "Ekle")}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className={styles.listCard}>
                    <h2>Mevcut Etkinlikler ({events.length})</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Görsel</th><th>Etkinlik Adı</th><th>Yer / Tarih</th><th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id}>
                                        <td>
                                            <div className={styles.thumbContainer}>
                                                {ev.imageUrl
                                                    ? <Image src={ev.imageUrl} alt={ev.title_tr} fill style={{ objectFit: 'cover' }} />
                                                    : <div className={styles.noLogo}>📅</div>}
                                            </div>
                                        </td>
                                        <td><strong>{ev.title_tr}</strong></td>
                                        <td>
                                            <span style={{ display: 'block', fontSize: '0.85rem' }}>{ev.location || "—"}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatDate(ev.date)}</span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(ev)}>Düzenle</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(ev.id, ev.title_tr)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Henüz etkinlik eklenmemiş.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
