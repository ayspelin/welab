"use client";

import { useState } from "react";
import styles from "./downloads.module.css";

type DocType = {
    id: string;
    title: string;
    category: string;
    type: string;
    url: string;
    imageUrl?: string | null;
    product?: { name_tr?: string | null; name_en?: string; } | null;
};

const palette = [
    "📘", "📗", "📙", "📕", "📒", "📓", "🗂️", "📂",
];

function getFolderIcon(name: string, index: number) {
    if (name.toLowerCase().includes("fiyat") || name.toLowerCase().includes("price")) return "💰";
    if (name.toLowerCase().includes("broş") || name.toLowerCase().includes("broch")) return "📋";
    if (name.toLowerCase().includes("kılavuz") || name.toLowerCase().includes("manual")) return "📖";
    if (name.toLowerCase().includes("sertifika") || name.toLowerCase().includes("cert")) return "🏅";
    if (name.toLowerCase().includes("teknik") || name.toLowerCase().includes("tech")) return "⚙️";
    if (name.toLowerCase().includes("genel") || name.toLowerCase().includes("general")) return "📁";
    return palette[index % palette.length];
}

function getFileIcon(type: string) {
    if (type === "PDF") return "📄";
    if (type === "EXCEL") return "📊";
    if (type === "WORD") return "📝";
    return "📁";
}

export default function DownloadsClient({ documents, locale }: { documents: DocType[]; locale: string }) {
    const [activeFolder, setActiveFolder] = useState<string | null>(null);

    const grouped = documents.reduce((acc, doc) => {
        const cat = doc.category || "Genel";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
    }, {} as Record<string, DocType[]>);

    const folderNames = Object.keys(grouped);
    const activeDocs = activeFolder ? (grouped[activeFolder] || []) : [];

    const getFolderCover = (folderName: string) => {
        const docs = grouped[folderName] || [];
        const docWithImage = docs.find(d => d.imageUrl);
        return docWithImage ? docWithImage.imageUrl : null;
    };

    return (
        <section className={styles.downloadsContent}>
            <div className="container">
                {!activeFolder ? (
                    <>
                        {folderNames.length === 0 ? (
                            <div className={styles.emptyState}>Şu an sistemde listelenecek açık doküman bulunmamaktadır.</div>
                        ) : (
                            <div className={styles.foldersGrid}>
                                {folderNames.map((folderName, idx) => {
                                    const coverUrl = getFolderCover(folderName);
                                    return (
                                        <div
                                            key={folderName}
                                            className={styles.folderCard}
                                            onClick={() => setActiveFolder(folderName)}
                                        >
                                            {coverUrl ? (
                                                <div style={{ position: "relative", width: "100%", height: "140px", marginBottom: "1rem", borderRadius: "12px", overflow: "hidden" }}>
                                                    <img src={coverUrl} alt={folderName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                            ) : (
                                                <div className={styles.folderIconWrap}>
                                                    <span className={styles.folderIcon}>{getFolderIcon(folderName, idx)}</span>
                                                </div>
                                            )}
                                            <h3 className={styles.folderName}>{folderName}</h3>
                                            <span className={styles.folderCount}>{grouped[folderName].length} dosya</span>
                                            <span className={styles.folderArrow}>→</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.folderView}>
                        <button className={styles.backButton} onClick={() => setActiveFolder(null)}>
                            ← Tüm Klasörler
                        </button>
                        <div className={styles.folderHeading}>
                            <span style={{ fontSize: "2rem" }}>{getFolderIcon(activeFolder, folderNames.indexOf(activeFolder))}</span>
                            <h2>{activeFolder}</h2>
                            <span className={styles.folderCount}>{activeDocs.length} dosya</span>
                        </div>
                        <div className={styles.grid}>
                            {activeDocs.map((doc) => (
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={doc.id}
                                    className={styles.card}
                                >
                                    <div
                                        className={styles.cardVisual}
                                        style={{
                                            padding: doc.imageUrl ? "0" : "2rem",
                                            backgroundColor: doc.type === "PDF" ? "#fee2e2" : doc.type === "EXCEL" ? "#dcfce7" : "#f3f4f6"
                                        }}
                                    >
                                        {doc.imageUrl ? (
                                            <img src={doc.imageUrl} alt={doc.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div
                                                className={styles.iconOverlay}
                                                style={{ color: doc.type === "PDF" ? "#dc2626" : doc.type === "EXCEL" ? "#16a34a" : "#6b7280" }}
                                            >
                                                {getFileIcon(doc.type)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h2 className={styles.cardTitle} style={{ fontSize: "1rem" }}>{doc.title}</h2>
                                        {doc.product && (
                                            <span style={{ fontSize: "0.8rem", color: "var(--gray-500)", fontWeight: "500" }}>
                                                {locale === "tr" ? doc.product.name_tr : (doc.product.name_en || doc.product.name_tr)}
                                            </span>
                                        )}
                                        <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "100px", backgroundColor: "rgba(255,255,255,0.08)", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                                            {doc.type} Dosyası
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
