"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

// ---------- Helpers ----------
const iconPalette = ["📘", "📗", "📙", "📕", "📒", "📓", "🗂️", "📂"];

function autoIcon(name: string, idx: number) {
    const n = name.toLowerCase();
    if (n.includes("fiyat") || n.includes("price")) return "💰";
    if (n.includes("broş") || n.includes("broch")) return "📋";
    if (n.includes("kılavuz") || n.includes("manual")) return "📖";
    if (n.includes("sertifika") || n.includes("cert")) return "🏅";
    if (n.includes("teknik") || n.includes("tech")) return "⚙️";
    if (n.includes("genel") || n.includes("general")) return "📁";
    return iconPalette[idx % iconPalette.length];
}

type FolderType = { id: string; name: string; imageUrl?: string; isActive?: boolean; createdAt: string };

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([]);

    // ---- Upload form ----
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("PDF");
    const [isPublic, setIsPublic] = useState(true);
    const [productId, setProductId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ---- Folder section ----
    const [newFolderName, setNewFolderName] = useState("");
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [folderLoading, setFolderLoading] = useState(false);
    const [showFolderManager, setShowFolderManager] = useState(false);
    const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
    const [editFolderCoverFile, setEditFolderCoverFile] = useState<File | null>(null);
    const [removeFolderCover, setRemoveFolderCover] = useState(false);
    const [folderEditLoading, setFolderEditLoading] = useState(false);

    // ---- Table / search ----
    const [docSearchTerm, setDocSearchTerm] = useState("");

    // ---- Edit modal ----
    const [editingDoc, setEditingDoc] = useState<any>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [removeCover, setRemoveCover] = useState(false);

    useEffect(() => {
        fetchDocuments();
        fetchProducts();
        fetchFolders();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) setDocuments(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data.sort((a: any, b: any) =>
                    (a.name_tr || a.name_en || "").localeCompare(b.name_tr || b.name_en || "")
                ));
            }
        } catch (e) { console.error(e); }
    };

    const fetchFolders = async () => {
        try {
            const res = await fetch("/api/folders");
            if (res.ok) setFolders(await res.json());
        } catch (e) { console.error(e); }
    };

    // ---- All folder names ----
    const allFolderNames = folders.map(f => f.name);

    // ---- Create folder ----
    const handleCreateFolder = async () => {
        const name = newFolderName.trim();
        if (!name) return;
        setFolderLoading(true);
        try {
            const res = await fetch("/api/folders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("Klasör oluşturulamadı");
            setNewFolderName("");
            await fetchFolders();
            setCategory(name);
            setActiveFolder(name);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setFolderLoading(false);
        }
    };

    // ---- Delete folder ----
    const handleDeleteFolder = async (folderName: string) => {
        if (folderName === "Genel") { alert('"Genel" klasörü silinemez.'); return; }
        const docCount = documents.filter(d => (d.category || "Genel") === folderName).length;
        const confirmed = confirm(
            `"${folderName}" klasörünü silmek istiyor musunuz?\n` +
            (docCount > 0
                ? `Bu klasördeki ${docCount} belge otomatik olarak "Genel" klasörüne taşınacak.`
                : "Bu klasör boş.")
        );
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/folders/${encodeURIComponent(folderName)}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Klasör silinemedi");
            if (activeFolder === folderName) { setActiveFolder(null); setCategory(""); }
            await Promise.all([fetchDocuments(), fetchFolders()]);
        } catch (err: any) {
            alert(err.message || "Bir hata oluştu");
        }
    };

    // ---- Edit folder ----
    const openFolderEditModal = (folder: FolderType) => {
        setEditingFolder(folder);
        setEditFolderCoverFile(null);
        setRemoveFolderCover(false);
    };

    const closeFolderEditModal = () => {
        setEditingFolder(null);
        setEditFolderCoverFile(null);
        setRemoveFolderCover(false);
    };

    const handleToggleFolderVisibility = async (folderName: string, currentIsActive: boolean) => {
        try {
            const res = await fetch(`/api/folders/${encodeURIComponent(folderName)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentIsActive })
            });
            if (!res.ok) throw new Error("Görünürlük değiştirilemedi");
            await fetchFolders();
        } catch (e: any) {
            alert(e.message || "Bir hata oluştu");
        }
    };

    const handleUpdateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFolder) return;
        setFolderEditLoading(true);
        try {
            let newImageUrl = removeFolderCover ? "" : editingFolder.imageUrl;
            if (editFolderCoverFile) {
                const fd = new FormData();
                fd.append("file", editFolderCoverFile);
                const coverRes = await fetch("/api/upload", { method: "POST", body: fd });
                if (coverRes.ok) newImageUrl = (await coverRes.json()).url;
            }
            const res = await fetch(`/api/folders/${encodeURIComponent(editingFolder.name)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: newImageUrl }),
            });
            if (!res.ok) throw new Error("Klasör güncellenemedi");
            await fetchFolders();
            closeFolderEditModal();
        } catch (err: any) {
            alert(err.message || "Hata oluştu");
        } finally {
            setFolderEditLoading(false);
        }
    };

    // ---- File change ----
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            const ft = e.target.files[0].type;
            if (ft.includes("pdf")) setType("PDF");
            else if (ft.includes("sheet") || ft.includes("excel")) setType("EXCEL");
            else if (ft.includes("word")) setType("WORD");
            else setType("OTHER");
        }
    };

    // ---- Upload submit ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        if (!file) { setMessage("Lütfen bir dosya seçin!"); setLoading(false); return; }
        try {
            const presignedRes = await fetch("/api/upload-presigned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, contentType: file.type }),
            });
            if (!presignedRes.ok) throw new Error("AWS S3 yükleme bağlantısı alınamadı");
            const { presignedUrl, fileUrl } = await presignedRes.json();

            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!uploadRes.ok) throw new Error("Dosya S3'e yüklenemedi");

            let imageUrl = "";
            if (coverFile) {
                const fd = new FormData();
                fd.append("file", coverFile);
                const coverRes = await fetch("/api/upload", { method: "POST", body: fd });
                if (coverRes.ok) imageUrl = (await coverRes.json()).url;
            }

            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title, type, url: fileUrl,
                    imageUrl: imageUrl || null,
                    isPublic,
                    productId: productId || null,
                    category: category || "Genel",
                }),
            });
            if (!res.ok) throw new Error("Belge kaydı oluşturulamadı");
            setMessage("Belge başarıyla yüklendi!");
            setTitle(""); setCategory(""); setProductId(""); setFile(null); setCoverFile(null);
            fetchDocuments();
        } catch (err: any) {
            setMessage(err.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    // ---- Delete doc ----
    const handleDelete = async (id: string) => {
        if (!confirm("Belgeyi silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silinirken bir hata oluştu");
            fetchDocuments();
        } catch (e) { console.error(e); setMessage("Belge silinemedi."); }
    };

    // ---- Toggle visibility ----
    const handleToggleVisibility = async (id: string, cur: boolean) => {
        try {
            const res = await fetch(`/api/documents/${id}/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: !cur }),
            });
            if (res.ok) fetchDocuments();
        } catch (e) { console.error(e); }
    };

    // ---- Edit modal ----
    const openEditModal = (doc: any) => {
        setEditingDoc(doc);
        setEditTitle(doc.title);
        setEditCategory(doc.category || "Genel");
        setEditCoverFile(null);
        setRemoveCover(false);
    };
    const closeEditModal = () => {
        setEditingDoc(null);
        setEditTitle(""); setEditCategory(""); setEditCoverFile(null); setRemoveCover(false);
    };
    const handleUpdateDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            let newImageUrl = removeCover ? "" : editingDoc.imageUrl;
            if (editCoverFile) {
                const fd = new FormData();
                fd.append("file", editCoverFile);
                const coverRes = await fetch("/api/upload", { method: "POST", body: fd });
                if (coverRes.ok) newImageUrl = (await coverRes.json()).url;
            }
            const res = await fetch(`/api/documents/${editingDoc.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle, category: editCategory || "Genel", imageUrl: newImageUrl }),
            });
            if (!res.ok) throw new Error("Belge güncellenemedi");
            fetchDocuments();
            closeEditModal();
        } catch (err: any) {
            alert(err.message || "Hata oluştu");
        } finally {
            setEditLoading(false);
        }
    };

    const filteredDocs = documents.filter(doc =>
        (!activeFolder || (doc.category || "Genel") === activeFolder) &&
        (doc.title.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
        (doc.product?.name_tr || "").toLowerCase().includes(docSearchTerm.toLowerCase()) ||
        (doc.product?.name_en || "").toLowerCase().includes(docSearchTerm.toLowerCase()))
    );

    return (
        <div>
            {/* ====== PAGE HEADER ====== */}
            <div className={styles.header}>
                <h1 className={styles.title}>Belge & Doküman Yönetimi</h1>
            </div>

            {/* ====== FOLDER SECTION ====== */}
            <div className={styles.card} style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        📁 Klasörler
                    </h2>
                    <button
                        onClick={() => setShowFolderManager(!showFolderManager)}
                        style={{
                            fontSize: "0.8rem", padding: "0.4rem 0.9rem", borderRadius: "6px",
                            border: "1px solid var(--gray-300)", backgroundColor: "transparent",
                            color: "var(--gray-600)", cursor: "pointer"
                        }}
                    >
                        {showFolderManager ? "Yönetimi Kapat" : "🛠 Klasörleri Yönet"}
                    </button>
                </div>

                {/* Folder filter chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: showFolderManager ? "1.5rem" : 0 }}>
                    <button
                        onClick={() => { setActiveFolder(null); setCategory(""); }}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.4rem",
                            padding: "0.45rem 0.9rem", borderRadius: "100px", border: "1.5px solid",
                            borderColor: activeFolder === null ? "var(--primary)" : "var(--gray-300)",
                            backgroundColor: activeFolder === null ? "var(--primary)" : "transparent",
                            color: activeFolder === null ? "white" : "var(--gray-600)",
                            fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease",
                        }}
                    >
                        🗃️ Tümü ({documents.length})
                    </button>
                    {folders.map((folder, idx) => (
                        <button
                            key={folder.id}
                            onClick={() => { setActiveFolder(folder.name); setCategory(folder.name); }}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.4rem",
                                padding: "0.45rem 0.9rem", borderRadius: "100px", border: "1.5px solid",
                                borderColor: activeFolder === folder.name ? "var(--primary)" : "var(--gray-300)",
                                backgroundColor: activeFolder === folder.name ? "var(--primary)" : "transparent",
                                color: activeFolder === folder.name ? "white" : "var(--gray-600)",
                                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease",
                            }}
                        >
                            {autoIcon(folder.name, idx)} {folder.name}
                            <span style={{ fontSize: "0.75rem", opacity: 0.75, marginLeft: "2px" }}>
                                ({documents.filter(d => (d.category || "Genel") === folder.name).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Folder manager panel */}
                {showFolderManager && (
                    <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1.25rem" }}>
                        <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                            Yeni bir klasör oluşturun veya mevcut klasörleri silin. Klasör silindiğinde belgeler korunur, "Genel" klasörüne taşınır.
                        </p>

                        {/* Add new folder */}
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder='Yeni klasör adı... (ör: Broşürler, Kullanım Kılavuzları)'
                                style={{
                                    flex: 1, padding: "0.6rem 1rem", borderRadius: "8px",
                                    border: "1.5px dashed var(--gray-300)", fontSize: "0.9rem", outline: "none"
                                }}
                                onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); }}
                            />
                            <button
                                onClick={handleCreateFolder}
                                disabled={folderLoading || !newFolderName.trim()}
                                className="btn btn-primary"
                                style={{ whiteSpace: "nowrap" }}
                            >
                                {folderLoading ? "Ekleniyor..." : "+ Klasör Ekle"}
                            </button>
                        </div>

                        {/* Folder list with delete */}
                        {folders.length > 0 && (
                            <div style={{ border: "1px solid var(--gray-200)", borderRadius: "8px", overflow: "hidden" }}>
                                {folders.map((folder, idx) => (
                                    <div
                                        key={folder.id}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "0.75rem 1rem",
                                            borderBottom: idx < folders.length - 1 ? "1px solid var(--gray-100)" : "none",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                            <span style={{ fontSize: "1.1rem" }}>{autoIcon(folder.name, idx)}</span>
                                            <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{folder.name}</span>
                                            <span style={{
                                                fontSize: "0.75rem", padding: "0.1rem 0.5rem",
                                                borderRadius: "100px", backgroundColor: "var(--gray-100)", color: "var(--gray-500)"
                                            }}>
                                                {documents.filter(d => (d.category || "Genel") === folder.name).length} belge
                                            </span>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => openFolderEditModal(folder)}
                                                style={{
                                                    padding: "0.35rem 0.75rem", fontSize: "0.8rem",
                                                    borderRadius: "6px", border: "1px solid var(--gray-300)",
                                                    backgroundColor: "transparent", color: "var(--gray-600)",
                                                    cursor: "pointer", fontWeight: 500, transition: "all 0.2s ease",
                                                    marginRight: "0.5rem"
                                                }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--gray-100)"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                                            >
                                                ✏️ Kapak
                                            </button>
                                            <button
                                                onClick={() => handleToggleFolderVisibility(folder.name, folder.isActive !== false)}
                                                style={{
                                                    padding: "0.35rem 0.75rem", fontSize: "0.8rem",
                                                    borderRadius: "6px", border: "none",
                                                    backgroundColor: folder.isActive !== false ? "#dcfce7" : "#fee2e2",
                                                    color: folder.isActive !== false ? "#166534" : "#991b1b",
                                                    cursor: "pointer", fontWeight: 600, transition: "all 0.2s ease",
                                                    marginRight: "0.5rem"
                                                }}
                                            >
                                                {folder.isActive !== false ? "👁️ Açık" : "👁️‍🗨️ Gizli"}
                                            </button>
                                            {folder.name !== "Genel" && (
                                                <button
                                                    onClick={() => handleDeleteFolder(folder.name)}
                                                    style={{
                                                        padding: "0.35rem 0.75rem", fontSize: "0.8rem",
                                                        borderRadius: "6px", border: "1px solid #fca5a5",
                                                        backgroundColor: "transparent", color: "#dc2626",
                                                        cursor: "pointer", fontWeight: 500, transition: "all 0.2s ease",
                                                    }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fee2e2"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                                                >
                                                    🗑️ Sil
                                                </button>
                                            )}
                                        </div>
                                        {folder.name === "Genel" && (
                                            <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontStyle: "italic", alignSelf: "center", marginLeft: "0.5rem" }}>Varsayılan</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ====== UPLOAD FORM ====== */}
            <div className={styles.card} style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <h2 style={{ marginBottom: "0.5rem" }}>
                    ⬆️ Yeni Belge Yükle {activeFolder && <span style={{ color: "var(--primary)", fontSize: "1rem" }}>→ {activeFolder}</span>}
                </h2>
                <p style={{ color: "var(--gray-500)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                    Ürün broşürleri, kullanım kılavuzları veya bayilere özel fiyat listelerini buradan yönetebilirsiniz.
                </p>
                {message && (
                    <div style={{
                        padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "6px",
                        backgroundColor: message.includes("hata") || message.includes("Lütfen") ? "#fee2e2" : "#dcfce7",
                        color: message.includes("hata") || message.includes("Lütfen") ? "#991b1b" : "#166534",
                        fontSize: "0.875rem",
                    }}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Belge Başlığı *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="Örn: 2026 Q1 Fiyat Listesi"
                                style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontSize: "0.9rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Klasör *</label>
                            {allFolderNames.length === 0 ? (
                                <div style={{ padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-200)", backgroundColor: "var(--gray-50)", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                                    Önce "Klasörleri Yönet" bölümünden bir klasör oluşturun.
                                </div>
                            ) : (
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontSize: "0.9rem", backgroundColor: "white" }}
                                >
                                    <option value="">-- Klasör seçin --</option>
                                    {allFolderNames.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Belge Türü *</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                required
                                style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontSize: "0.9rem", backgroundColor: "white" }}
                            >
                                <option value="PDF">PDF Dosyası</option>
                                <option value="EXCEL">Excel (.xlsx, .xls)</option>
                                <option value="WORD">Word (.docx, .doc)</option>
                                <option value="OTHER">Diğer</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>İlgili Ürün (Opsiyonel)</label>
                            <select
                                value={productId}
                                onChange={e => setProductId(e.target.value)}
                                style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontSize: "0.9rem", backgroundColor: "white" }}
                            >
                                <option value="">-- Genel Belge --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name_tr || p.name_en}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Dosya Seç (PDF, Excel, vb.) *</label>
                            <input
                                type="file"
                                accept=".pdf,.xlsx,.xls,.doc,.docx"
                                onChange={handleFileChange}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Kapak Görseli (İsteğe Bağlı)</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={e => { if (e.target.files?.length) setCoverFile(e.target.files[0]); }}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.875rem" }}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={e => setIsPublic(e.target.checked)}
                                style={{ width: "1.1rem", height: "1.1rem" }}
                            />
                            <span>
                                <strong>Herkese Açık</strong>
                                <span style={{ color: "var(--gray-500)", marginLeft: "0.4rem" }}>— kaldırırsanız yalnızca giriş yapmış kullanıcılar görebilir</span>
                            </span>
                        </label>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? "Yükleniyor..." : "⬆️ Belgeyi Yükle"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ====== DOCUMENTS TABLE ====== */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 style={{ margin: 0 }}>
                        {activeFolder ? `📁 ${activeFolder}` : "Tüm Belgeler"} ({filteredDocs.length})
                    </h2>
                    <div style={{ position: "relative", width: "280px" }}>
                        <input
                            type="text"
                            placeholder="Belge ara..."
                            value={docSearchTerm}
                            onChange={e => setDocSearchTerm(e.target.value)}
                            style={{ width: "100%", padding: "0.55rem 1rem", borderRadius: "20px", border: "1px solid var(--gray-300)", fontSize: "0.875rem" }}
                        />
                        <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>🔍</span>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Klasör</th>
                                <th>Tür</th>
                                <th>İlgili Ürün</th>
                                <th>Görünürlük</th>
                                <th>Tarih</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map(doc => (
                                <tr key={doc.id}>
                                    <td><strong>{doc.title}</strong></td>
                                    <td>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--gray-600)", background: "var(--gray-100)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
                                            📁 {doc.category || "Genel"}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", backgroundColor: "var(--gray-200)", color: "var(--gray-800)" }}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td>
                                        {doc.product
                                            ? <span style={{ color: "var(--primary)" }}>{doc.product.name_tr || doc.product.name_en}</span>
                                            : <span style={{ color: "var(--gray-400)" }}>—</span>
                                        }
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleVisibility(doc.id, doc.isPublic)}
                                            style={{
                                                padding: "0.25rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600,
                                                cursor: "pointer", border: "none",
                                                backgroundColor: doc.isPublic ? "#dcfce7" : "#fee2e2",
                                                color: doc.isPublic ? "#166534" : "#991b1b",
                                            }}
                                        >
                                            {doc.isPublic ? "✓ Açık" : "✕ Gizli"}
                                        </button>
                                    </td>
                                    <td style={{ fontSize: "0.85rem", color: "var(--gray-600)" }}>
                                        {new Date(doc.createdAt).toLocaleDateString("tr-TR")}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                            <a href={doc.url} target="_blank" className="btn" style={{ padding: "0.28rem 0.55rem", fontSize: "0.8rem", backgroundColor: "var(--primary)", color: "white", textDecoration: "none" }}>
                                                Görüntüle
                                            </a>
                                            <button onClick={() => openEditModal(doc)} className="btn" style={{ padding: "0.28rem 0.55rem", fontSize: "0.8rem", backgroundColor: "#eab308", color: "white", border: "none" }}>
                                                Düzenle
                                            </button>
                                            <button onClick={() => handleDelete(doc.id)} className="btn" style={{ padding: "0.28rem 0.55rem", fontSize: "0.8rem", backgroundColor: "#dc2626", color: "white", border: "none" }}>
                                                Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--gray-400)" }}>
                                        {activeFolder ? `"${activeFolder}" klasöründe henüz belge yok.` : "Henüz belge eklenmemiş."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== EDIT MODAL ====== */}
            {editingDoc && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                        <h3 style={{ marginBottom: "1.25rem" }}>✏️ Belge Düzenle</h3>
                        <form onSubmit={handleUpdateDoc} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Belge Başlığı</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Klasör</label>
                                <select
                                    value={editCategory}
                                    onChange={e => setEditCategory(e.target.value)}
                                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontSize: "0.9rem", backgroundColor: "white" }}
                                >
                                    <option value="">-- Klasör seçin --</option>
                                    {allFolderNames.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Kapak Görseli (İsteğe Bağlı)</label>
                                {editingDoc.imageUrl && !removeCover && !editCoverFile && (
                                    <div style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <img src={editingDoc.imageUrl} alt="Mevcut kapak" style={{ height: "56px", width: "auto", borderRadius: "4px" }} />
                                        <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Mevcut görsel</span>
                                        <button
                                            type="button"
                                            onClick={() => setRemoveCover(true)}
                                            style={{ marginLeft: "auto", backgroundColor: "transparent", color: "#dc2626", border: "1px solid #dc2626", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                )}
                                {removeCover && (
                                    <div style={{ marginBottom: "0.5rem", fontSize: "0.8rem", color: "#dc2626", padding: "0.5rem", backgroundColor: "#fee2e2", borderRadius: "4px" }}>
                                        Görsel silinmek üzere işaretlendi.
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={e => { if (e.target.files?.length) { setEditCoverFile(e.target.files[0]); setRemoveCover(false); } }}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                                <button type="button" onClick={closeEditModal} className="btn" style={{ backgroundColor: "var(--gray-200)", color: "var(--gray-800)", border: "none" }}>İptal</button>
                                <button type="submit" disabled={editLoading} className="btn btn-primary" style={{ border: "none" }}>
                                    {editLoading ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ====== FOLDER EDIT MODAL ====== */}
            {editingFolder && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                        <h3 style={{ marginBottom: "1.25rem" }}>✏️ Klasör Kapağı Düzenle: {editingFolder.name}</h3>
                        <form onSubmit={handleUpdateFolder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>Kapak Görseli</label>
                                {editingFolder.imageUrl && !removeFolderCover && !editFolderCoverFile && (
                                    <div style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <img src={editingFolder.imageUrl} alt="Mevcut kapak" style={{ height: "56px", width: "auto", borderRadius: "4px" }} />
                                        <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>Mevcut görsel</span>
                                        <button
                                            type="button"
                                            onClick={() => setRemoveFolderCover(true)}
                                            style={{ marginLeft: "auto", backgroundColor: "transparent", color: "#dc2626", border: "1px solid #dc2626", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                )}
                                {removeFolderCover && (
                                    <div style={{ marginBottom: "0.5rem", fontSize: "0.8rem", color: "#dc2626", padding: "0.5rem", backgroundColor: "#fee2e2", borderRadius: "4px" }}>
                                        Görsel silinmek üzere işaretlendi.
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={e => { if (e.target.files?.length) { setEditFolderCoverFile(e.target.files[0]); setRemoveFolderCover(false); } }}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                                <button type="button" onClick={closeFolderEditModal} className="btn" style={{ backgroundColor: "var(--gray-200)", color: "var(--gray-800)", border: "none" }}>İptal</button>
                                <button type="submit" disabled={folderEditLoading} className="btn btn-primary" style={{ border: "none" }}>
                                    {folderEditLoading ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
