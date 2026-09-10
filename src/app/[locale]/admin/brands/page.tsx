"use client";

import { useState, useEffect } from "react";
import styles from "./brands.module.css";
import Image from "next/image";

type Brand = {
    id: string;
    name: string;
    logoUrl?: string | null;
    description_tr?: string | null;
    description_en?: string | null;
    url?: string | null;
    _count?: {
        products?: number;
    };
};

const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

export default function BrandsAdminPage() {
    const [brands, setBrands] = useState<Brand[]>([]);

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
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

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
        setMessageType("");
    };

    const handleEditClick = (brand: Brand) => {
        setEditingId(brand.id);
        setName(brand.name);
        setDescriptionTr(brand.description_tr || "");
        setDescriptionEn(brand.description_en || "");
        setUrlInput(brand.url || "");
        setPreviewUrl(brand.logoUrl || "");
        setFile(null);
        setMessage("");
        setMessageType("");
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getApiErrorMessage = async (res: Response, fallback: string) => {
        try {
            const data = await res.json();
            return data.error || data.message || fallback;
        } catch {
            return fallback;
        }
    };

    const handleDeleteClick = async (brand: Brand) => {
        const productsCount = brand._count?.products || 0;

        if (productsCount > 0) {
            setMessage(`"${brand.name}" markasına bağlı ${productsCount} ürün var. Markayı silmeden önce bu ürünleri başka bir markaya taşıyın veya ürünleri silin.`);
            setMessageType("error");
            return;
        }

        setMessage("");
        setMessageType("");

        const id = brand.id;
        const name = brand.name;

        if (!window.confirm(`"${name}" markasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/brands/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error(await getApiErrorMessage(res, "Marka silinemedi"));
            }

            setMessage("Marka başarıyla silindi!");
            setMessageType("success");
            fetchBrands();
        } catch (error: unknown) {
            setMessage(getErrorMessage(error, "Marka silinemedi"));
            setMessageType("error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setMessageType("");

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

            const successMessage = `Marka başarıyla ${editingId ? 'güncellendi' : 'eklendi'}!`;
            resetForm();
            setMessage(successMessage);
            setMessageType("success");
            fetchBrands();

        } catch (error: unknown) {
            console.error(error);
            setMessage(getErrorMessage(error, "Bir hata oluştu"));
            setMessageType("error");
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
                        <div className={`${styles.alert} ${messageType === "error" ? styles.alertError : styles.alertSuccess}`}>
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
                                    <th>Bağlı Ürünler</th>
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
                                            <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "var(--gray-100)", borderRadius: "100px", fontSize: "0.8rem" }}>
                                                {brand._count?.products || 0} Ürün
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.editBtn} onClick={() => handleEditClick(brand)}>Düzenle</button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteClick(brand)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {brands.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
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
