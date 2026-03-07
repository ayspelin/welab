"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import Image from "next/image";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [name_tr, setNameTr] = useState("");
    const [name_en, setNameEn] = useState("");
    const [description_tr, setDescriptionTr] = useState("");
    const [description_en, setDescriptionEn] = useState("");
    const [brandInput, setBrandInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [technicalSpecsStr, setTechnicalSpecsStr] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProducts();
        fetchBrands();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) setProducts(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchBrands = async () => {
        try {
            const res = await fetch("/api/brands");
            if (res.ok) setBrands(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) setCategories(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (!name_en) {
            setMessage("Lütfen İngilizce ürün adını girin (Türkçe opsiyonel)!");
            setLoading(false);
            return;
        }

        if (!brandInput || !categoryInput) {
            setMessage("Lütfen bir marka ve kategori girin veya seçin!");
            setLoading(false);
            return;
        }

        try {
            let imagesToSave = [];

            // 1. Upload Product Image to S3
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Görsel yüklenemedi");
                const uploadData = await uploadRes.json();
                imagesToSave.push({ url: uploadData.url });
            }

            // Parse specs safely
            let specsParsed = {};
            if (technicalSpecsStr) {
                try {
                    specsParsed = JSON.parse(technicalSpecsStr);
                } catch {
                    setMessage("Hata: Teknik Özellikler geçerli bir JSON formatında olmalı. (Örn: {\"Voltaj\": \"220V\"})");
                    setLoading(false);
                    return;
                }
            }

            let finalBrandId = "";
            const existingBrand = brands.find(b => b.name.toLowerCase() === brandInput.toLowerCase());

            if (existingBrand) {
                finalBrandId = existingBrand.id;
            } else {
                const brandRes = await fetch("/api/brands", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: brandInput,
                        logoUrl: "/images/placeholder.jpg",
                        description: "Sistem tarafından otomatik oluşturuldu."
                    })
                });

                if (!brandRes.ok) {
                    const errStr = await brandRes.text();
                    throw new Error(`Yeni marka oluşturulamadı. Sunucu yanıtı: ${errStr}`);
                }
                const newBrand = await brandRes.json();
                finalBrandId = newBrand.id;
            }

            let finalCategoryId = "";
            const flatCategories = categories.flatMap(c => [c, ...(c.children || [])]);
            const existingCategory = flatCategories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase());

            if (existingCategory) {
                finalCategoryId = existingCategory.id;
            } else {
                const categoryRes = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: categoryInput,
                        description: "Sistem tarafından otomatik oluşturuldu."
                    })
                });

                if (!categoryRes.ok) {
                    const errStr = await categoryRes.text();
                    throw new Error(`Yeni kategori oluşturulamadı. Sunucu yanıtı: ${errStr}`);
                }
                const newCategory = await categoryRes.json();
                finalCategoryId = newCategory.id;
            }

            const endpoint = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
            const method = editingProductId ? "PUT" : "POST";

            // 2. Create or Update Product
            const res = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name_tr,
                    name_en,
                    description_tr,
                    description_en,
                    technicalSpecs: specsParsed,
                    ...(finalBrandId && { brandId: finalBrandId }),
                    ...(finalCategoryId && { categoryId: finalCategoryId }),
                    isFeatured,
                    ...(imagesToSave.length > 0 && { images: imagesToSave })
                }),
            });

            if (!res.ok) throw new Error(editingProductId ? "Ürün güncellenemedi" : "Ürün oluşturulamadı");

            setMessage(editingProductId ? "Ürün başarıyla güncellendi!" : "Ürün başarıyla eklendi!");

            resetForm();
            fetchProducts();

        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingProductId(null);
        setNameTr("");
        setNameEn("");
        setDescriptionTr("");
        setDescriptionEn("");
        setTechnicalSpecsStr("");
        setIsFeatured(false);
        setFile(null);
        setBrandInput("");
        setCategoryInput("");
    };

    const handleEditClick = (prod: any) => {
        setEditingProductId(prod.id);
        setNameTr(prod.name_tr || "");
        setNameEn(prod.name_en || "");
        setDescriptionTr(prod.description_tr || "");
        setDescriptionEn(prod.description_en || "");
        setBrandInput(prod.brand?.name || "");
        setCategoryInput(prod.category?.name || "");
        setIsFeatured(prod.isFeatured || false);
        setTechnicalSpecsStr(prod.technicalSpecs ? JSON.stringify(prod.technicalSpecs, null, 2) : "");
        setFile(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silme işlemi başarısız oldu.");
            setMessage("Ürün başarıyla silindi.");
            fetchProducts();
        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Silinirken bir hata oluştu.");
        }
    };

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Ürün Yönetimi</h1>
            </div>

            <div className={styles.card} style={{ marginBottom: "2rem" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{editingProductId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
                    {editingProductId && (
                        <button type="button" onClick={resetForm} className="btn" style={{ backgroundColor: 'var(--gray-200)', color: 'var(--gray-700)' }}>
                            İptal
                        </button>
                    )}
                </div>
                {message && (
                    <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: message.includes("hata") || message.includes("Lütfen") || message.includes("Hata:") ? "#fee2e2" : "#dcfce7", color: message.includes("hata") || message.includes("Lütfen") || message.includes("Hata:") ? "#991b1b" : "#166534", borderRadius: "0.25rem" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Ürün Adı (Türkçe) *</label>
                            <input
                                type="text"
                                value={name_tr}
                                onChange={(e) => setNameTr(e.target.value)}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)", marginBottom: "0.5rem" }}
                            />
                            <label style={{ display: "block", marginBottom: "0.5rem", marginTop: "0.5rem" }}>Ürün Adı (İngilizce)</label>
                            <input
                                type="text"
                                value={name_en}
                                onChange={(e) => setNameEn(e.target.value)}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    style={{ width: "1.2rem", height: "1.2rem" }}
                                />
                                <span style={{ fontWeight: "500" }}>Ana Sayfada Öne Çıkar (Featured)</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Marka *</label>
                            <input
                                list="brand-options"
                                value={brandInput}
                                onChange={(e) => setBrandInput(e.target.value)}
                                required
                                placeholder="Marka Adı Girin veya Seçin"
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                            <datalist id="brand-options">
                                {brands.map(b => (
                                    <option key={b.id} value={b.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Kategori *</label>
                            <input
                                list="category-options"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                                required
                                placeholder="Kategori Adı Girin veya Seçin"
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                            <datalist id="category-options">
                                {categories.flatMap(c => [c, ...(c.children || [])]).map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Açıklama (Türkçe) *</label>
                            <textarea
                                value={description_tr}
                                onChange={(e) => setDescriptionTr(e.target.value)}
                                rows={4}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Açıklama (İngilizce)</label>
                            <textarea
                                value={description_en}
                                onChange={(e) => setDescriptionEn(e.target.value)}
                                rows={4}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Teknik Özellikler (Opsiyonel, JSON formatında)</label>
                        <textarea
                            value={technicalSpecsStr}
                            onChange={(e) => setTechnicalSpecsStr(e.target.value)}
                            rows={3}
                            placeholder='Örn: { "Voltaj": "220V", "Kapasite": "10L" }'
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)", fontFamily: "monospace" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Ana Görsel (Opsiyonel)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start", marginTop: "1rem" }}
                    >
                        {loading ? "Kaydediliyor..." : (editingProductId ? "Ürünü Güncelle" : "Ürünü Ekle")}
                    </button>
                </form>
            </div>

            <div>
                <h2>Mevcut Ürünler</h2>
                <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Görsel</th>
                                <th>Ürün Adı</th>
                                <th>Marka</th>
                                <th>Kategori</th>
                                <th>Öne Çıkan</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((prod) => (
                                <tr key={prod.id}>
                                    <td>
                                        {prod.images && prod.images.length > 0 ? (
                                            <div style={{ position: "relative", width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", overflow: "hidden" }}>
                                                <Image src={prod.images[0].url} alt={prod.name} fill style={{ objectFit: 'cover' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: "40px", height: "40px", backgroundColor: "var(--gray-200)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--gray-500)" }}>
                                                Yok
                                            </div>
                                        )}
                                    </td>
                                    <td><strong>{prod.name_tr}</strong></td>
                                    <td>{prod.brand?.name}</td>
                                    <td>{prod.category?.name}</td>
                                    <td>
                                        {prod.isFeatured ? (
                                            <span style={{ color: "#d97706", fontWeight: "bold" }}>Evet</span>
                                        ) : (
                                            <span style={{ color: "var(--gray-500)" }}>Hayır</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => handleEditClick(prod)}
                                                className="btn"
                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "var(--primary)", color: "white" }}
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prod.id)}
                                                className="btn"
                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "#dc2626", color: "white" }}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                                        Henüz ürün eklenmemiş.
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
