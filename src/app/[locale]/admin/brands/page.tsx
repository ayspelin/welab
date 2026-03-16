"use client";

import { useState, useEffect } from "react";
import styles from "./brands.module.css";
import Image from "next/image";

export default function BrandsAdminPage() {
    const [brands, setBrands] = useState<any[]>([]);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description_tr, setDescriptionTr] = useState("");
    const [description_en, setDescriptionEn] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await fetch("/api/brands");
            if (res.ok) {
                const data = await res.json();
                setBrands(data);
            }
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setDescriptionTr("");
        setDescriptionEn("");
        setUrlInput("");
        setFile(null);
        setPreviewUrl("");
        setMessage("");
    };

    const handleEditClick = (brand: any) => {
        setEditingId(brand.id);
        setName(brand.name);
        setDescriptionTr(brand.description_tr || "");
        setDescriptionEn(brand.description_en || "");
        setUrlInput(brand.url || "");
        setPreviewUrl(brand.logoUrl || "");
        setFile(null);
        setMessage("");
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" markasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/brands/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Marka silinemedi");

            setMessage("Marka başarıyla silindi!");
            fetchBrands();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            let finalLogoUrl = previewUrl;

            // 1. Upload new Logo to S3 if file selected
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Görsel yüklenemedi");
                const uploadData = await uploadRes.json();
                finalLogoUrl = uploadData.url;
            }

            if (!finalLogoUrl) {
                finalLogoUrl = "/images/placeholder.jpg"; // Default placeholder if no image
            }

            // 2. Create or Update Brand
            const method = editingId ? "PUT" : "POST";
            const apiurl = editingId ? `/api/brands/${editingId}` : "/api/brands";

            const res = await fetch(apiurl, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description_tr,
                    description_en,
                    logoUrl: finalLogoUrl,
                    url: urlInput || null
                }),
            });

            if (!res.ok) {
                const errStr = await res.text();
                throw new Error(`Marka ${editingId ? 'güncellenemedi' : 'oluşturulamadı'}. Yanıt: ${errStr}`);
            }

            setMessage(`Marka başarıyla ${editingId ? 'güncellendi' : 'eklendi'}!`);
            resetForm();
            fetchBrands();

        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Marka Yönetimi</h1>
                <p className={styles.subtitle}>Ana sayfada ve markalar sayfasında görünecek markalarımızı buradan yönetebilirsiniz.</p>
            </div>

            <div className={styles.contentGrid}>
                {/* Form Section */}
                <div className={styles.card}>
                    <h2>{editingId ? "Markayı Düzenle" : "Yeni Marka Ekle"}</h2>

                    {message && (
                        <div className={`${styles.alert} ${message.includes("hata") || message.includes("edi") ? styles.alertError : styles.alertSuccess}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Marka Adı *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Örn: Heidolph"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Website URL (Opsiyonel)</label>
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="Örn: https://www.heidolph.com"
                            />
                            <small style={{ color: "var(--gray-500)", marginTop: "0.25rem", display: "block", fontSize: "0.8rem" }}>Kullanıcılar logoya tıkladığında bu adrese yönlendirilir.</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Açıklama - Türkçe (Opsiyonel)</label>
                            <textarea
                                value={description_tr}
                                onChange={(e) => setDescriptionTr(e.target.value)}
                                rows={2}
                                placeholder="Marka hakkında kısa bilgi (Türkçe)"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Açıklama - İngilizce (Opsiyonel)</label>
                            <textarea
                                value={description_en}
                                onChange={(e) => setDescriptionEn(e.target.value)}
                                rows={2}
                                placeholder="Marka hakkında kısa bilgi (İngilizce)"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Marka Logosu</label>

                            {previewUrl && (
                                <div className={styles.imagePreview}>
                                    <Image src={previewUrl} alt="Marka Logosu Önizleme" fill style={{ objectFit: 'contain' }} />
                                    <button type="button" className={styles.removeImageBtn} onClick={() => setPreviewUrl("")}>×</button>
                                </div>
                            )}

                            <label className={styles.fileUploadBtn}>
                                <span>Logo Seç (Tavsiye edilen: Yatay formda PNG)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        <div className={styles.formActions}>
                            {editingId && (
                                <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                                    İptal
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitBtn}
                            >
                                {loading ? "İşleniyor..." : (editingId ? "Güncelle" : "Ekle")}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className={styles.listCard}>
                    <h2>Mevcut Markalar ({brands.length})</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Logo</th>
                                    <th>Marka Adı</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands.map((brand) => (
                                    <tr key={brand.id}>
                                        <td>
                                            <div className={styles.thumbContainer}>
                                                {brand.logoUrl ? (
                                                    <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} />
                                                ) : (
                                                    <div className={styles.noLogo}>Yok</div>
                                                )}
                                            </div>
                                        </td>
                                        <td><strong>{brand.name}</strong></td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(brand)}>Düzenle</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteClick(brand.id, brand.name)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {brands.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                                            Henüz marka eklenmemiş.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
