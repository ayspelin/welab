"use client";

import { useState, useEffect } from "react";
import styles from "./categories.module.css";
import Image from "next/image";

export default function CategoriesAdminPage() {
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name_tr, setNameTr] = useState("");
    const [name_en, setNameEn] = useState("");
    const [description_tr, setDescriptionTr] = useState("");
    const [description_en, setDescriptionEn] = useState("");
    const [parentId, setParentId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
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
        setNameTr("");
        setNameEn("");
        setDescriptionTr("");
        setDescriptionEn("");
        setParentId("");
        setFile(null);
        setPreviewUrl("");
        setMessage("");
    };

    const handleEditClick = (category: any) => {
        setEditingId(category.id);
        setNameTr(category.name_tr || "");
        setNameEn(category.name_en || "");
        setDescriptionTr(category.description_tr || "");
        setDescriptionEn(category.description_en || "");
        setParentId(category.parentId || "");
        setPreviewUrl(category.imageUrl || "");
        setFile(null);
        // Ensure message is cleared when editing
        setMessage("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id: string, name: string) => {
        if (!window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Kategori silinemedi");
            }

            setMessage("Kategori başarıyla silindi!");
            fetchCategories();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            let finalImageUrl = previewUrl;

            // 1. Upload new Image to S3 if file selected
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Görsel yüklenemedi");
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.url;
            }

            // 2. Create or Update Category
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/categories/${editingId}` : "/api/categories";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name_tr,
                    name_en,
                    description_tr,
                    description_en,
                    imageUrl: finalImageUrl || null,
                    parentId: parentId || null
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Kategori ${editingId ? 'güncellenemedi' : 'oluşturulamadı'}.`);
            }

            setMessage(`Kategori başarıyla ${editingId ? 'güncellendi' : 'eklendi'}!`);
            resetForm();
            fetchCategories();

        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <div className={styles.header}>
                <h1 className={styles.title}>Kategori Yönetimi</h1>
                <p className={styles.subtitle}>Sitenin ana kategori başlıklarını ve alt kategorilerini buradan düzenleyebilirsiniz.</p>
            </div>

            <div className={styles.contentGrid}>
                {/* Form Section */}
                <div className={styles.card}>
                    <h2>{editingId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}</h2>

                    {message && (
                        <div className={`${styles.alert} ${message.includes("hata") || message.includes("edi") ? styles.alertError : styles.alertSuccess}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Kategori Adı - Türkçe *</label>
                            <input
                                type="text"
                                value={name_tr}
                                onChange={(e) => setNameTr(e.target.value)}
                                required
                                placeholder="Örn: Analitik Cihazlar"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Kategori Adı - İngilizce (Opsiyonel)</label>
                            <input
                                type="text"
                                value={name_en}
                                onChange={(e) => setNameEn(e.target.value)}
                                required
                                placeholder="Örn: Analytical Instruments"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Üst Kategori (Alt kategori oluşturmak için seçin)</label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                style={{ padding: "0.75rem", border: "1px solid var(--gray-300)", borderRadius: "var(--radius-sm)", backgroundColor: "white" }}
                            >
                                <option value="">Yok (Ana Kategori Yap)</option>
                                {categories.filter(c => c.id !== editingId && !c.parentId).map(c => (
                                    <option key={c.id} value={c.id}>{c.name_tr}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Açıklama - Türkçe (Opsiyonel)</label>
                            <textarea
                                value={description_tr}
                                onChange={(e) => setDescriptionTr(e.target.value)}
                                rows={2}
                                placeholder="Kategori hakkında kısa bilgi (Türkçe)"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Açıklama - İngilizce (Opsiyonel)</label>
                            <textarea
                                value={description_en}
                                onChange={(e) => setDescriptionEn(e.target.value)}
                                rows={2}
                                placeholder="Kategori hakkında kısa bilgi (İngilizce)"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Kategori Görseli (Opsiyonel)</label>

                            {previewUrl && (
                                <div className={styles.imagePreview}>
                                    <Image src={previewUrl} alt="Kategori Önizleme" fill style={{ objectFit: 'contain' }} />
                                    <button type="button" className={styles.removeImageBtn} onClick={() => setPreviewUrl("")}>×</button>
                                </div>
                            )}

                            <label className={styles.fileUploadBtn}>
                                <span>Görsel Seç</span>
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
                    <h2>Mevcut Kategoriler ({categories.length})</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Görsel</th>
                                    <th>Kategori Adı</th>
                                    <th>Bağlı Ürünler</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td>
                                            <div className={styles.thumbContainer}>
                                                {category.imageUrl ? (
                                                    <Image src={category.imageUrl} alt={category.name_tr || "Kategori Görseli"} fill style={{ objectFit: 'contain' }} />
                                                ) : (
                                                    <div className={styles.noLogo}>Yok</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{category.name_tr}</strong>
                                            {category.parent && (
                                                <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                                                    ↳ {category.parent.name_tr} altında
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "var(--gray-100)", borderRadius: "100px", fontSize: "0.8rem" }}>
                                                {category._count?.products || 0} Ürün
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(category)}>Düzenle</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteClick(category.id, category.name_tr)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                                            Henüz kategori eklenmemiş.
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
