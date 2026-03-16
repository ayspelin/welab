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
    const [specs, setSpecs] = useState<{ key_tr: string, val_tr: string, key_en: string, val_en: string }[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isPublic, setIsPublic] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
 
    // Document Modal State
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productDocs, setProductDocs] = useState<any[]>([]);
    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const [newDocTitle, setNewDocTitle] = useState("");
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
 
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
            if (res.ok) {
                const data = await res.json();
                setBrands(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
            }
        } catch (error) { console.error(error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                const flattened = data.flatMap((c: any) => [c, ...(c.children || [])]);
                setCategories(flattened.sort((a: any, b: any) => (a.name_tr || a.name_en || "").localeCompare(b.name_tr || b.name_en || "")));
            }
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPdfFile(e.target.files[0]);
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
            let documentsToSave = [];

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

            // 1b. Upload Product Catalog to S3
            if (pdfFile) {
                const formData = new FormData();
                formData.append("file", pdfFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Katalog dosyası yüklenemedi");
                const uploadData = await uploadRes.json();
                documentsToSave.push({ title: `${name_en} Catalog`, type: "PDF", url: uploadData.url });
            }

            // Parse specs safely
            const specsParsed = specs.filter(s => s.key_tr.trim() !== "" || s.key_en.trim() !== "");

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
            const existingCategory = flatCategories.find(c => (c.name_tr || c.name_en || "").toLowerCase() === categoryInput.toLowerCase());

            if (existingCategory) {
                finalCategoryId = existingCategory.id;
            } else {
                const categoryRes = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name_tr: categoryInput,
                        name_en: categoryInput, // Send to both for default
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
                    categoryId: finalCategoryId,
                    isFeatured,
                    isPublic,
                    ...(imagesToSave.length > 0 && { images: imagesToSave }),
                    ...(documentsToSave.length > 0 && { documents: documentsToSave })
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
        setSpecs([]);
        setIsFeatured(false);
        setIsPublic(true);
        setFile(null);
        setPdfFile(null);
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
        setCategoryInput(prod.category?.name_tr || prod.category?.name_en || "");
        setIsFeatured(prod.isFeatured || false);
        setIsPublic(prod.isPublic !== undefined ? prod.isPublic : true);
        setSpecs(Array.isArray(prod.technicalSpecs) ? prod.technicalSpecs : []);
        setFile(null);
        setPdfFile(null);
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

    const openDocModal = async (prod: any) => {
        setSelectedProduct(prod);
        setIsDocModalOpen(true);
        setNewDocTitle(`${prod.name_tr || prod.name_en} Broşürü`);
        fetchProductDocs(prod.id);
    };

    const fetchProductDocs = async (productId: string) => {
        try {
            const res = await fetch(`/api/documents?productId=${productId}`);
            if (res.ok) setProductDocs(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleDocUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDocFile || !selectedProduct) return;
        setIsUploadingDoc(true);

        try {
            const formData = new FormData();
            formData.append("file", newDocFile);
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            if (!uploadRes.ok) throw new Error("Yüklenemedi");
            const { url } = await uploadRes.json();

            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newDocTitle,
                    type: newDocFile.type.includes("pdf") ? "PDF" : "OTHER",
                    url: url,
                    isPublic: true,
                    productId: selectedProduct.id
                })
            });

            if (res.ok) {
                setNewDocFile(null);
                fetchProductDocs(selectedProduct.id);
            }
        } catch (error) { console.error(error); }
        finally { setIsUploadingDoc(false); }
    };

    const handleDeleteDoc = async (id: string, productId: string) => {
        if (!confirm("Bu belgeyi silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (res.ok) fetchProductDocs(productId);
        } catch (error) { console.error(error); }
    };

    const handleToggleDocVisibility = async (id: string, currentPublicStatus: boolean, productId: string) => {
        try {
            const res = await fetch(`/api/documents/${id}/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: !currentPublicStatus })
            });
            if (res.ok) fetchProductDocs(productId);
        } catch (error) { console.error("Error toggling document visibility:", error); }
    };


    const filteredProducts = products.filter(p => 
        (p.name_tr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.name_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    style={{ width: "1.2rem", height: "1.2rem" }}
                                />
                                <span style={{ fontWeight: "500" }}>Ana Sayfada Öne Çıkar (Featured)</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    style={{ width: "1.2rem", height: "1.2rem" }}
                                />
                                <span style={{ fontWeight: "500", color: isPublic ? "inherit" : "#dc2626" }}>
                                    {isPublic ? "İnternet Sitesinde Görünsün (Herkese Açık)" : "Gizli (Sadece Admin Görür)"}
                                </span>
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
                                    <option key={c.id} value={c.name_tr || c.name_en} />
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

                    <div style={{ padding: "1.5rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--gray-50)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ margin: 0, color: "var(--primary)" }}>Teknik Özellikler (Opsiyonel)</h3>
                            <button
                                type="button"
                                onClick={() => setSpecs([...specs, { key_tr: "", val_tr: "", key_en: "", val_en: "" }])}
                                className="btn btn-secondary"
                                style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                            >
                                + Yeni Özellik Ekle
                            </button>
                        </div>

                        {specs.map((spec, index) => (
                            <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", marginBottom: "1rem", alignItems: "start" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <input
                                        type="text"
                                        placeholder="Özellik Adı (TR) (Örn: Voltaj)"
                                        value={spec.key_tr}
                                        onChange={(e) => {
                                            const newSpecs = [...specs];
                                            newSpecs[index].key_tr = e.target.value;
                                            setSpecs(newSpecs);
                                        }}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Değer (TR) (Örn: 220V)"
                                        value={spec.val_tr}
                                        onChange={(e) => {
                                            const newSpecs = [...specs];
                                            newSpecs[index].val_tr = e.target.value;
                                            setSpecs(newSpecs);
                                        }}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <input
                                        type="text"
                                        placeholder="Spec Name (EN) (e.g: Voltage)"
                                        value={spec.key_en}
                                        onChange={(e) => {
                                            const newSpecs = [...specs];
                                            newSpecs[index].key_en = e.target.value;
                                            setSpecs(newSpecs);
                                        }}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (EN) (e.g: 220V)"
                                        value={spec.val_en}
                                        onChange={(e) => {
                                            const newSpecs = [...specs];
                                            newSpecs[index].val_en = e.target.value;
                                            setSpecs(newSpecs);
                                        }}
                                        style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newSpecs = specs.filter((_, i) => i !== index);
                                        setSpecs(newSpecs);
                                    }}
                                    className="btn"
                                    style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.5rem 0.75rem", borderRadius: "0.25rem" }}
                                    title="Özelliği Sil"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {specs.length === 0 && (
                            <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", margin: 0 }}>Ürüne ait bir teknik özellik bulunmuyor.</p>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Ana Görsel (Opsiyonel)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Ürün Kataloğu (Opsiyonel PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfChange}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                            <small style={{ color: "var(--gray-500)", display: "block", marginTop: "0.25rem" }}>Sadece PDF kabul edilir.</small>
                        </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Mevcut Ürünler ({filteredProducts.length})</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input 
                            type="text" 
                            placeholder="Ürün veya Marka Ara..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--gray-300)', fontSize: '0.9rem' }}
                        />
                        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>🔍</span>
                    </div>
                </div>
                <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Görsel</th>
                                <th>Ürün Adı</th>
                                <th>Marka</th>
                                <th>Kategori</th>
                                <th>Durum</th>
                                <th>Öne Çıkan</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((prod) => (
                                <tr key={prod.id}>
                                    <td>
                                        {prod.images && prod.images.length > 0 ? (
                                            <div style={{ position: "relative", width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", overflow: "hidden" }}>
                                                <Image src={prod.images[0].url} alt={prod.name_tr || "Ürün Görseli"} fill style={{ objectFit: 'cover' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: "40px", height: "40px", backgroundColor: "var(--gray-200)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--gray-500)" }}>
                                                Yok
                                            </div>
                                        )}
                                    </td>
                                    <td><strong>{prod.name_tr}</strong></td>
                                    <td>{prod.brand?.name}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '12px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: '600',
                                            backgroundColor: prod.isPublic ? '#dcfce7' : '#fee2e2',
                                            color: prod.isPublic ? '#166534' : '#991b1b'
                                        }}>
                                            {prod.isPublic ? "Açık" : "Gizli"}
                                        </span>
                                    </td>
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
                                                onClick={() => openDocModal(prod)}
                                                className="btn"
                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "var(--primary)", color: "white" }}
                                            >
                                                Belgeler
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(prod)}
                                                className="btn"
                                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "var(--gray-200)", color: "var(--gray-800)" }}
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

            {isDocModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className={styles.card} style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>{selectedProduct?.name_tr || selectedProduct?.name_en} - Belgeler</h2>
                            <button onClick={() => setIsDocModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <form onSubmit={handleDocUpload} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '8px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Yeni Belge Ekle</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input 
                                    type="text" 
                                    placeholder="Belge Başlığı" 
                                    value={newDocTitle} 
                                    onChange={e => setNewDocTitle(e.target.value)}
                                    required
                                    style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                                />
                                <input 
                                    type="file" 
                                    onChange={e => setNewDocFile(e.target.files?.[0] || null)}
                                    required
                                    style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '4px', backgroundColor: 'white' }}
                                />
                                <button type="submit" disabled={isUploadingDoc} className="btn btn-primary" style={{ width: 'full' }}>
                                    {isUploadingDoc ? "Yükleniyor..." : "Belgeyi Yükle"}
                                </button>
                            </div>
                        </form>

                        <div className={styles.tableContainer}>
                            <table className={styles.table} style={{ fontSize: '0.9rem' }}>
                                <thead>
                                    <tr>
                                        <th>Başlık</th>
                                        <th>Görünürlük</th>
                                        <th>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productDocs.map(doc => (
                                        <tr key={doc.id}>
                                            <td>{doc.title}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleToggleDocVisibility(doc.id, doc.isPublic, selectedProduct.id)}
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        border: 'none',
                                                        backgroundColor: doc.isPublic ? '#dcfce7' : '#fee2e2',
                                                        color: doc.isPublic ? '#166534' : '#991b1b',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    title="Tıklayarak durumu değiştirin"
                                                >
                                                    {doc.isPublic ? "Herkese Açık" : "Gizli"}
                                                </button>
                                            </td>
                                            <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <a href={doc.url} target="_blank" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Görüntüle</a>
                                                <button 
                                                    onClick={() => handleDeleteDoc(doc.id, selectedProduct.id)}
                                                    style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {productDocs.length === 0 && (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>Belge bulunamadı.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
