"use client";

import { useState, useEffect } from "react";
import styles from "../brands/brands.module.css";
import Image from "next/image";

export default function ReferencesAdminPage() {
    const [refs, setRefs] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name_tr, setNameTr] = useState("");
    const [name_en, setNameEn] = useState("");
    const [sector_tr, setSectorTr] = useState("");
    const [sector_en, setSectorEn] = useState("");
    const [order, setOrder] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => { fetchRefs(); }, []);

    const fetchRefs = async () => {
        try {
            const res = await fetch("/api/references");
            if (res.ok) setRefs(await res.json());
        } catch (e) { console.error(e); }
    };

    const resetForm = () => {
        setEditingId(null); setNameTr(""); setNameEn("");
        setSectorTr(""); setSectorEn(""); setOrder(0);
        setFile(null); setPreviewUrl(""); setMessage("");
    };

    const handleEditClick = (r: any) => {
        setEditingId(r.id); setNameTr(r.name_tr); setNameEn(r.name_en || "");
        setSectorTr(r.sector_tr || ""); setSectorEn(r.sector_en || "");
        setOrder(r.order || 0); setPreviewUrl(r.logoUrl || ""); setFile(null); setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" referansını silmek istiyor musunuz?`)) return;
        try {
            const res = await fetch(`/api/references/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silinemedi");
            setMessage("Referans silindi.");
            fetchRefs();
        } catch (e: any) { alert(e.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMessage("");
        try {
            let finalLogoUrl = previewUrl;
            if (file) {
                const fd = new FormData(); fd.append("file", file);
                const up = await fetch("/api/upload", { method: "POST", body: fd });
                if (!up.ok) throw new Error("Logo yüklenemedi");
                finalLogoUrl = (await up.json()).url;
            }
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/references/${editingId}` : "/api/references";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name_tr, name_en, sector_tr, sector_en, logoUrl: finalLogoUrl || null, order }),
            });
            if (!res.ok) throw new Error(`İşlem başarısız: ${await res.text()}`);
            setMessage(`Referans başarıyla ${editingId ? "güncellendi" : "eklendi"}!`);
            resetForm(); fetchRefs();
        } catch (e: any) {
            setMessage(e.message || "Hata oluştu");
        } finally { setLoading(false); }
    };

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Referans Yönetimi</h1>
                <p className={styles.subtitle}>Müşteri referanslarını buradan ekleyip yönetebilirsiniz.</p>
            </div>
            <div className={styles.contentGrid}>
                {/* Form */}
                <div className={styles.card}>
                    <h2>{editingId ? "Referansı Düzenle" : "Yeni Referans Ekle"}</h2>
                    {message && (
                        <div className={`${styles.alert} ${message.includes("Hata") || message.includes("başarısız") ? styles.alertError : styles.alertSuccess}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Kurum / Müşteri Adı (TR) *</label>
                            <input type="text" value={name_tr} onChange={e => setNameTr(e.target.value)} required placeholder="Örn: İTÜ Kimya Mühendisliği" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kurum Adı (EN)</label>
                            <input type="text" value={name_en} onChange={e => setNameEn(e.target.value)} placeholder="Örn: ITU Chemical Engineering" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sektör (TR)</label>
                            <input type="text" value={sector_tr} onChange={e => setSectorTr(e.target.value)} placeholder="Örn: Üniversite, Hastane, Sanayi..." />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sektör (EN)</label>
                            <input type="text" value={sector_en} onChange={e => setSectorEn(e.target.value)} placeholder="Örn: University, Hospital, Industry..." />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sıra Numarası</label>
                            <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} placeholder="0" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kurum Logosu (Opsiyonel)</label>
                            {previewUrl && (
                                <div className={styles.imagePreview}>
                                    <Image src={previewUrl} alt="Preview" fill style={{ objectFit: 'contain' }} />
                                    <button type="button" className={styles.removeImageBtn} onClick={() => setPreviewUrl("")}>×</button>
                                </div>
                            )}
                            <label className={styles.fileUploadBtn}>
                                <span>Logo Seç (PNG / SVG önerilir)</span>
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
                    <h2>Mevcut Referanslar ({refs.length})</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Logo</th><th>Kurum Adı</th><th>Sektör</th><th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refs.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <div className={styles.thumbContainer}>
                                                {r.logoUrl
                                                    ? <Image src={r.logoUrl} alt={r.name_tr} fill style={{ objectFit: 'contain' }} />
                                                    : <div className={styles.noLogo}>{r.name_tr.slice(0, 2).toUpperCase()}</div>}
                                            </div>
                                        </td>
                                        <td><strong>{r.name_tr}</strong>{r.name_en && <><br /><small style={{ color: '#6b7280' }}>{r.name_en}</small></>}</td>
                                        <td>{r.sector_tr || "—"}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(r)}>Düzenle</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(r.id, r.name_tr)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {refs.length === 0 && (
                                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Henüz referans eklenmemiş.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
