import styles from "./categoryProducts.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function CategoryProducts({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const t = await getTranslations("Products");
    const locale = await getLocale();

    // Fetch real category from database
    const category = await prisma.category.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!category) {
        notFound();
    }

    // Fetch products belonging to this category
    const products = await prisma.product.findMany({
        where: { categoryId: resolvedParams.id },
        include: { brand: true, images: { where: { isPrimary: true }, take: 1 } }
    });

    return (
        <div className={styles.categoryPage}>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{locale === 'tr' ? (category.name_tr || category.name_en) : category.name_en}</h1>
                    <div className={styles.breadcrumb}>
                        <Link href="/">{t('home')}</Link> &gt; <Link href="/products">{t('title')}</Link> &gt; <span>{locale === 'tr' ? (category.name_tr || category.name_en) : category.name_en}</span>
                    </div>
                </div>
            </section>

            <section className={`container ${styles.productGridSection}`}>
                {products.length === 0 ? (
                    <div className={styles.noProducts}>
                        <p>{t('emptyCategory')}</p>
                    </div>
                ) : (
                    <div className={styles.productGrid}>
                        {products.map(product => {
                            const mainImage = product.images?.[0]?.url;
                            return (
                                <Link href={`/products/${product.id}`} key={product.id} className={styles.productCard}>
                                    <div className={styles.productImageWrapper}>
                                        {!mainImage ? (
                                            <span className={styles.imagePlaceholder}>Görsel <br /> {locale === 'tr' ? (product.name_tr || product.name_en) : product.name_en}</span>
                                        ) : (
                                            <Image
                                                src={mainImage}
                                                alt={locale === 'tr' ? (product.name_tr || product.name_en) : product.name_en}
                                                fill
                                                style={{ objectFit: 'contain', padding: '1rem' }}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        )}
                                    </div>
                                    <div className={styles.productInfo}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: 600 }}>{product.brand?.name}</div>
                                        <h3 className={styles.productName}>{locale === 'tr' ? (product.name_tr || product.name_en) : product.name_en}</h3>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
