import styles from "./downloads.module.css";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Downloads() {
    // Sadece herkese açık belgeleri ve ilişkili ürünleri getir
    const documents = await prisma.document.findMany({
        where: { isPublic: true },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
    });

    const getIcon = (type: string) => {
        if (type === "PDF") return "📄";
        if (type === "EXCEL") return "📊";
        if (type === "WORD") return "📝";
        return "📁";
    };

    return (
        <div className={styles.downloadsPage}>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>İndirmeler & Dokümanlar</h1>
                    <p className={styles.pageDesc}>Ürün broşürleri, teknik dokümanlar ve kullanım kılavuzlarına buradan erişebilirsiniz.</p>
                </div>
            </section>

            <section className={styles.downloadsContent}>
                <div className="container">
                    <div className={styles.grid}>
                        {documents.length > 0 ? documents.map(doc => (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" key={doc.id} className={styles.card}>
                                <div className={styles.cardVisual} style={{ padding: "2rem", backgroundColor: doc.type === "PDF" ? "#fee2e2" : doc.type === "EXCEL" ? "#dcfce7" : "#f3f4f6" }}>
                                    <div className={styles.iconOverlay} style={{ color: doc.type === "PDF" ? "#dc2626" : doc.type === "EXCEL" ? "#16a34a" : "#6b7280" }}>
                                        {getIcon(doc.type)}
                                    </div>
                                </div>
                                <div className={styles.cardBody} style={{ flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem" }}>
                                    <h2 className={styles.cardTitle} style={{ fontSize: "1.1rem" }}>{doc.title}</h2>
                                    {doc.product && (
                                        <span style={{ fontSize: "0.875rem", color: "var(--gray-500)", fontWeight: "500" }}>{doc.product.name}</span>
                                    )}
                                    <span style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "100px", backgroundColor: "var(--gray-100)", color: "var(--gray-600)", marginTop: "0.5rem" }}>
                                        {doc.type} Dosyası
                                    </span>
                                </div>
                            </a>
                        )) : (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--gray-500)" }}>
                                Şu an sistemde listelenecek açık doküman bulunmamaktadır.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
