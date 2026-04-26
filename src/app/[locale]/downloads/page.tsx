import styles from "./downloads.module.css";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import DownloadsClient from "./DownloadsClient";

export default async function Downloads() {
    const locale = await getLocale();

    const documents = await prisma.document.findMany({
        where: { isPublic: true },
        include: { product: true },
        orderBy: { createdAt: "desc" },
    });

    const folders = await prisma.documentFolder.findMany();

    return (
        <div className={styles.downloadsPage}>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>İndirmeler & Dokümanlar</h1>
                    <p className={styles.pageDesc}>Ürün broşürleri, teknik dokümanlar ve kullanım kılavuzlarına buradan erişebilirsiniz.</p>
                </div>
            </section>
            <DownloadsClient documents={documents as any} folders={folders as any} locale={locale} />
        </div>
    );
}
