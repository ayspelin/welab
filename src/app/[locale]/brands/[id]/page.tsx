import styles from "./brandProducts.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function BrandProducts({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const t = await getTranslations("Products");
    const tFooter = await getTranslations("Footer");
    const tCommon = await getTranslations("Common");
    const locale = await getLocale();

    // Fetch real brand from database
    const brand = await prisma.brand.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!brand) {
        notFound();
    }

    // Fetch products belonging to this brand
    const products = await prisma.product.findMany({
        where: { brandId: resolvedParams.id },
        include: { category: true, images: { where: { isPrimary: true }, take: 1 } }
    });

    return (
        <div className={styles.categoryPage}>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{brand.name}</h1>
                    <div className={styles.breadcrumb}>
                        <Link href="/">{t('home')}</Link> &gt; <Link href="/brands">{tCommon('ourBrands')}</Link> &gt; <span>{brand.name}</span>
                    </div>
                </div>
            </section>

            <section className={`container ${styles.productGridSection}`}>
                {products.length === 0 ? (
                    <div className={styles.noProducts} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <p>{t('emptyCategory')}</p>
                        <Link href="/contact" style={{ display: 'inline-block', backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', borderRadius: '100px', textDecoration: 'none', fontWeight: '500', transition: 'opacity 0.2s' }}>
                            {tFooter('talkToExpert')} &rarr;
                        </Link>
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
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                                            {locale === 'tr' ? (product.category?.name_tr || product.category?.name_en) : product.category?.name_en}
                                        </div>
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
