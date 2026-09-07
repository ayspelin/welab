import styles from "./downloads.module.css";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import DownloadsClient from "./DownloadsClient";

export default async function Downloads() {
    const locale = await getLocale();
    const t = await getTranslations("DownloadsPage");

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
                    <h1 className={styles.pageTitle}>{t("title")}</h1>
                    <p className={styles.pageDesc}>{t("desc")}</p>
                </div>
            </section>
            <DownloadsClient
                documents={documents as any}
                folders={folders as any}
                locale={locale}
                labels={{
                    empty: t("empty"),
                    fileCount: t("fileCount"),
                    allFolders: t("allFolders"),
                    fileSuffix: t("fileSuffix"),
                }}
            />
        </div>
    );
}
