import styles from "./products.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function Products() {
    const t = await getTranslations("Products");
    const locale = await getLocale();
    const categories = await prisma.category.findMany({
        where: { parentId: null }, // Only show top-level categories on the main product screen
        orderBy: { name_tr: 'asc' }
    });

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{t('title')}</h1>
                    <div className={styles.breadcrumb}>
                        <Link href="/">{t('home')}</Link> &gt; <span>{t('title')}</span>
                    </div>
                </div>
            </section>

            <div className={`container ${styles.categoryGridSection}`}>
                <div className={styles.categoryGrid}>
                    {categories.map(cat => (
                        <Link href={`/products/category/${cat.id}`} key={cat.id} className={styles.categoryCard}>
                            <div className={styles.categoryImageWrapper}>
                                {!cat.imageUrl ? (
                                    <span className={styles.imagePlaceholder}>Görsel <br /> {locale === 'tr' ? (cat.name_tr || cat.name_en) : cat.name_en}</span>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <Image
                                            src={cat.imageUrl}
                                            alt={locale === 'tr' ? (cat.name_tr || cat.name_en) : cat.name_en}
                                            fill
                                            style={{ objectFit: 'contain', padding: '1rem' }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className={styles.categoryInfo}>
                                <h3 className={styles.categoryName}>{locale === 'tr' ? (cat.name_tr || cat.name_en) : cat.name_en}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
                {categories.length === 0 && (
                    <div className="container" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-500)' }}>
                        {t('emptyCategory')}
                    </div>
                )}
            </div>
        </>
    );
}
