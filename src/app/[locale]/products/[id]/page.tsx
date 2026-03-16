import styles from "./productDetail.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const t = await getTranslations("Products");
    const locale = await getLocale();

    const product = await prisma.product.findUnique({
        where: { id: resolvedParams.id },
        include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 }, documents: true }
    });

    if (!product) {
        notFound();
    }

    const { brand, category } = product;
    const mainImage = product.images?.[0]?.url;
    const catalogDoc = product.documents?.find(d => d.type === 'PDF');

    const rawSpecs = product.technicalSpecs;
    const specs = Array.isArray(rawSpecs) ? rawSpecs : [];

    return (
        <>
            <div className={styles.breadcrumb}>
                <div className="container">
                    <h1>{locale === 'tr' ? (category?.name_tr || category?.name_en) : category?.name_en}</h1>
                    <Link href="/">{t('home')}</Link> &gt;
                    <Link href="/products"> {t('title')}</Link> &gt;
                    <Link href={`/products/category/${category?.id}`}> {locale === 'tr' ? (category?.name_tr || category?.name_en) : category?.name_en}</Link> &gt;
                    <span> {locale === 'tr' ? (product.name_tr || product.name_en) : product.name_en}</span>
                </div>
            </div>

            <section className={`section ${styles.productDetail}`}>
                <div className={`container ${styles.productGrid}`}>

                    {/* Left Column */}
                    <div className={styles.leftCol}>
                        <div className={styles.mainImage}>
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
                        <span className={styles.productSubTag}>{locale === 'tr' ? (product.name_tr || product.name_en) : product.name_en}</span>

                        <div className={styles.manufacturerBox}>
                            <div className={styles.manufacturerLogo}>
                                {brand?.name.split(' ')[0]}
                            </div>
                            <div className={styles.manufacturerInfo}>
                                <span className={styles.mfgTitle}>{t('manufacturer')}</span>
                                <Link href={`/brands`} className={styles.mfgLink}>
                                    🔗 {t('viewManufacturer')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column */}
                    <div className={styles.middleCol}>
                        <div className={styles.headerRow}>
                            <h2 className={styles.productTitle}>{locale === 'tr' ? (product.name_tr || product.name_en) : product.name_en}</h2>
                        </div>

                        <div className={styles.productActions}>
                            {product.documents && product.documents.length > 0 && product.documents.map((doc: any) => (
                                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.catalogBtn}>
                                    {doc.type === 'PDF' ? '📄' : '📁'} {doc.title}
                                </a>
                            ))}
                            <Link href="/contact" className={styles.contactBtn}>
                                📞 {t('contactForProduct')}
                            </Link>
                        </div>

                        <div className={styles.description}>
                            {((locale === 'tr' ? (product.description_tr || product.description_en) : product.description_en) || "").split('\n').map((line, i) => (
                                <p key={i} style={{ marginBottom: line.trim() ? '1rem' : '0' }}>{line}</p>
                            ))}
                        </div>

                        {specs.length > 0 && (
                            <div className={styles.specsTable}>
                                <h3 className={styles.specsTitle}>Teknik Özellikler</h3>
                                {specs.map((spec: any, idx: number) => {
                                    const key = locale === 'tr' ? (spec.key_tr || spec.key_en) : (spec.key_en || spec.key_tr);
                                    const val = locale === 'tr' ? (spec.val_tr || spec.val_en) : (spec.val_en || spec.val_tr);
                                    if (!key) return null;
                                    return (
                                        <div key={`spec-${idx}`} className={styles.specRow}>
                                            <div className={styles.specKey}>{key}</div>
                                            <div className={styles.specVal}>{val}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightCol}>
                        <span className={styles.formTitle}>{t('requestQuote')}</span>
                        <form>
                            <div className={styles.formGroup}>
                                <label>{t('companyName')}</label>
                                <input type="text" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('contactName')}</label>
                                <input type="text" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('phone')}</label>
                                <input type="tel" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('email')}</label>
                                <input type="email" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('city')}</label>
                                <input type="text" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('refUrl')}</label>
                                <input type="text" value={`https://welab.com/products/${product.id}`} readOnly />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('notes')}</label>
                                <textarea rows={4} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit' }}></textarea>
                            </div>
                            <button type="submit" className={styles.submitBtn}>{t('submit')}</button>
                        </form>
                    </div>

                </div>
            </section>
        </>
    );
}
