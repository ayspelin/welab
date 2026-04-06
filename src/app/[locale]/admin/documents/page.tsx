"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import Link from "next/link";

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState("");
    const [type, setType] = useState("PDF");
    const [isPublic, setIsPublic] = useState(true);
    const [productId, setProductId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [docSearchTerm, setDocSearchTerm] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Edit Modal State
    const [editingDoc, setEditingDoc] = useState<any>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [removeCover, setRemoveCover] = useState(false);

    useEffect(() => {
        fetchDocuments();
        fetchProducts();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) setDocuments(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data.sort((a: any, b: any) => (a.name_tr || a.name_en || "").localeCompare(b.name_tr || b.name_en || "")));
            }
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);

            // Auto-detect type
            const fileType = e.target.files[0].type;
            if (fileType.includes("pdf")) setType("PDF");
            else if (fileType.includes("sheet") || fileType.includes("excel")) setType("EXCEL");
            else if (fileType.includes("word")) setType("WORD");
            else setType("OTHER");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (!file) {
            setMessage("Lütfen bir dosya seçin!");
            setLoading(false);
            return;
        }

        try {
            let fileUrl = "";

            // 1. Get Presigned URL
            const presignedRes = await fetch("/api/upload-presigned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                }),
            });

            if (!presignedRes.ok) throw new Error("AWS S3 yükleme bağlantısı alınamadı");
            const { presignedUrl, fileUrl: newFileUrl } = await presignedRes.json();
            fileUrl = newFileUrl;

            // 2. Upload Document directly to S3
            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (!uploadRes.ok) throw new Error("Dosya AWS S3'e yüklenemedi (CORS engeli veya bağlantı problemi olabilir)");

            // 2. Upload cover image if exists
            let imageUrl = "";
            if (coverFile) {
                const coverFormData = new FormData();
                coverFormData.append("file", coverFile);
                const coverRes = await fetch("/api/upload", {
                    method: "POST",
                    body: coverFormData,
                });
                if (coverRes.ok) {
                    const coverData = await coverRes.json();
                    imageUrl = coverData.url;
                }
            }

            // 3. Save Document Record
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    type,
                    url: fileUrl,
                    imageUrl: imageUrl || null,
                    isPublic,
                    productId: productId || null
                }),
            });

            if (!res.ok) throw new Error("Belge kaydı oluşturulamadı");

            setMessage("Belge başarıyla yüklendi!");

            // Reset state
            setTitle("");
            setProductId("");
            setFile(null);
            setCoverFile(null);

            fetchDocuments();

        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Belgeyi silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silinirken bir hata oluştu");
            fetchDocuments();
        } catch (error) {
            console.error(error);
            setMessage("Belge silinemedi.");
        }
    };

    const handleToggleVisibility = async (id: string, currentPublicStatus: boolean) => {
        try {
            const res = await fetch(`/api/documents/${id}/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: !currentPublicStatus })
            });
            if (res.ok) fetchDocuments();
        } catch (error) { console.error("Error toggling document visibility:", error); }
    };

    const openEditModal = (doc: any) => {
        setEditingDoc(doc);
        setEditTitle(doc.title);
        setEditCoverFile(null);
        setRemoveCover(false);
    };

    const closeEditModal = () => {
        setEditingDoc(null);
        setEditTitle("");
        setEditCoverFile(null);
        setRemoveCover(false);
    };

    const handleUpdateDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            let newImageUrl = removeCover ? "" : editingDoc.imageUrl;

            if (editCoverFile) {
                const coverFormData = new FormData();
                coverFormData.append("file", editCoverFile);
                const coverRes = await fetch("/api/upload", { method: "POST", body: coverFormData });
                if (coverRes.ok) {
                    const json = await coverRes.json();
                    newImageUrl = json.url;
                }
            }

            const res = await fetch(`/api/documents/${editingDoc.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle, imageUrl: newImageUrl }),
            });

            if (!res.ok) throw new Error("Belge güncellenemedi");
            
            fetchDocuments();
            closeEditModal();
        } catch(error: any) {
            alert(error.message || "Hata oluştu");
        } finally {
            setEditLoading(false);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
        (doc.product?.name_tr || "").toLowerCase().includes(docSearchTerm.toLowerCase()) ||
        (doc.product?.name_en || "").toLowerCase().includes(docSearchTerm.toLowerCase())
    );

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Belge & Dokuman Yönetimi</h1>
            </div>

            <div className={styles.card} style={{ marginBottom: "2rem" }}>
                <h2>Yeni Belge Yükle</h2>
                <p style={{ color: "var(--gray-500)", marginBottom: "1rem" }}>
                    Ürün broşürleri, kullanım kılavuzları veya bayilere özel fiyat listelerini buradan yönetebilirsiniz.
                </p>
                {message && (
                    <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: message.includes("hata") || message.includes("Lütfen") ? "#fee2e2" : "#dcfce7", color: message.includes("hata") || message.includes("Lütfen") ? "#991b1b" : "#166534", borderRadius: "0.25rem" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Belge Başlığı *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Örn: 2026 Q1 Fiyat Listesi"
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Belge Türü *</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)", backgroundColor: "white" }}
                            >
                                <option value="PDF">PDF Dosyası</option>
                                <option value="EXCEL">Excel Dosyası (.xlsx, .xls)</option>
                                <option value="WORD">Word Dosyası (.docx, .doc)</option>
                                <option value="OTHER">Diğer</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    style={{ width: "1.2rem", height: "1.2rem" }}
                                />
                                <div>
                                    <strong style={{ display: "block" }}>Herkese Açık</strong>
                                    <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Kaldırırsanız sadece giriş yapan Bayiler/Adminler görebilir.</span>
                                </div>
                            </label>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>İlgili Ürün (Opsiyonel)</label>
                            <select
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)", backgroundColor: "white" }}
                            >
                                <option value="">-- Genel Belge (Ürün Bağımsız) --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name_tr || p.name_en}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Dosya Seç (PDF, Excel, vb.) *</label>
                            <input
                                type="file"
                                accept=".pdf,.xlsx,.xls,.doc,.docx"
                                onChange={handleFileChange}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>İsteğe Bağlı Kapak Ekle (JPG, PNG)</label>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setCoverFile(e.target.files[0]);
                                    }
                                }}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start", marginTop: "1rem" }}
                    >
                        {loading ? "Yükleniyor..." : "Belgeyi Yükle"}
                    </button>
                </form>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Sistemdeki Belgeler ({filteredDocs.length})</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input 
                            type="text" 
                            placeholder="Belge veya Ürün Ara..." 
                            value={docSearchTerm}
                            onChange={(e) => setDocSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--gray-300)', fontSize: '0.9rem' }}
                        />
                        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>🔍</span>
                    </div>
                </div>
                <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Tür</th>
                                <th>İlgili Ürün</th>
                                <th>Görünürlük</th>
                                <th>Tarih</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map((doc) => (
                                <tr key={doc.id}>
                                    <td><strong>{doc.title}</strong></td>
                                    <td>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '4px', 
                                            fontSize: '0.8rem', 
                                            backgroundColor: 'var(--gray-200)', 
                                            color: 'var(--gray-800)' 
                                        }}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td>
                                        {doc.product ? (
                                            <span style={{ color: 'var(--primary)' }}>{doc.product.name_tr || doc.product.name_en}</span>
                                        ) : (
                                            <span style={{ color: 'var(--gray-500)' }}>Genel Belge</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleVisibility(doc.id, doc.isPublic)}
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
                                    <td style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                                        {new Date(doc.createdAt).toLocaleDateString("tr-TR")}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <a 
                                                href={doc.url} 
                                                target="_blank" 
                                                className="btn" 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', backgroundColor: 'var(--primary)', color: 'white', textDecoration: 'none' }}
                                            >
                                                Görüntüle
                                            </a>
                                            <button 
                                                onClick={() => openEditModal(doc)} 
                                                className="btn" 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', backgroundColor: '#eab308', color: 'white', border: 'none' }}
                                            >
                                                Düzenle
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc.id)} 
                                                className="btn" 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {documents.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                                        Henüz belge eklenmemiş.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingDoc && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", width: "100%", maxWidth: "500px" }}>
                        <h3 style={{ marginBottom: "1rem" }}>Belge Düzenle</h3>
                        <form onSubmit={handleUpdateDoc} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>Belge Başlığı</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>Yeni Kapak Görseli (İsteğe Bağlı)</label>
                                {editingDoc.imageUrl && !removeCover && !editCoverFile && (
                                    <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <img src={editingDoc.imageUrl} alt="Mevcut kapak" style={{ height: "60px", width: "auto", borderRadius: "4px" }} />
                                        <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Mevcut görsel</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setRemoveCover(true)}
                                            style={{ backgroundColor: "transparent", color: "#dc2626", border: "1px solid #dc2626", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", marginLeft: "auto" }}
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                )}
                                {removeCover && (
                                    <div style={{ marginBottom: "0.5rem", fontSize: "0.8rem", color: "#dc2626", padding: "0.5rem", backgroundColor: "#fee2e2", borderRadius: "4px" }}>
                                        Görsel silinecek şekilde işaretlendi. İptal etmek için dosyayı kapatıp tekrar açın veya yeni görsel yükleyin.
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setEditCoverFile(e.target.files[0]);
                                            setRemoveCover(false); // Cancel remove if they pick a new file
                                        }
                                    }}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                                <button type="button" onClick={closeEditModal} className="btn" style={{ backgroundColor: "var(--gray-300)", color: "var(--gray-800)", border: "none" }}>İptal</button>
                                <button type="submit" disabled={editLoading} className="btn btn-primary" style={{ border: "none" }}>
                                    {editLoading ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
