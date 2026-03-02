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

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
            if (res.ok) setProducts(await res.json());
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

            // 1. Upload Document to S3
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Dosya AWS S3'e yüklenemedi");
            const uploadData = await uploadRes.json();
            fileUrl = uploadData.url;

            // 2. Save Document Record
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    type,
                    url: fileUrl,
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

            fetchDocuments();

        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

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
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

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
                <h2>Sistemdeki Belgeler</h2>
                <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tür</th>
                                <th>Başlık</th>
                                <th>İlişkili Ürün</th>
                                <th>Erişim</th>
                                <th>Bağlantı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id}>
                                    <td>
                                        <span style={{
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "0.25rem",
                                            fontSize: "0.8rem",
                                            fontWeight: "bold",
                                            backgroundColor: doc.type === 'PDF' ? '#fee2e2' : doc.type === 'EXCEL' ? '#dcfce7' : '#e0e7ff',
                                            color: doc.type === 'PDF' ? '#991b1b' : doc.type === 'EXCEL' ? '#166534' : '#3730a3'
                                        }}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td><strong>{doc.title}</strong></td>
                                    <td>{doc.product ? doc.product.name : <span style={{ color: "var(--gray-500)" }}>Genel</span>}</td>
                                    <td>
                                        {doc.isPublic ? (
                                            <span style={{ color: "var(--primary)" }}>Herkese Açık</span>
                                        ) : (
                                            <span style={{ color: "#d97706", fontWeight: "bold" }}>Sadece Bayiler</span>
                                        )}
                                    </td>
                                    <td>
                                        <Link href={doc.url} target="_blank" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                                            İndir / Görüntüle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {documents.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                                        Henüz belge eklenmemiş.
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
