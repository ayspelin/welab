import styles from "./brands.module.css";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function Brands() {
    const t = await getTranslations("Common");
    const tb = await getTranslations("Brands");
    const locale = await getLocale();
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{t('ourBrands')}</h1>
                    <p className={styles.pageDesc}>{tb('pageDesc')}</p>
                </div>
            </section>

            <section className={`section ${styles.brandsSection}`}>
                <div className={`container ${styles.brandsGrid}`}>
                    {brands.length > 0 ? brands.map((brand) => (
                        <div key={brand.id} className={styles.brandCard}>
                            {brand.url ? (
                                <a href={brand.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%', width: '100%', textDecoration: 'none', color: 'inherit' }}>
                                    <div className={styles.brandLogoWrapper}>
                                        {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                                <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} />
                                            </div>
                                        ) : (
                                            <span className={styles.logoPlaceholder}>{brand.name}</span>
                                        )}
                                    </div>
                                    <div className={styles.brandInfo}>
                                        <div className={styles.brandHeader}>
                                            <h2 className={styles.brandName}>{brand.name}</h2>
                                        </div>
                                        {(locale === 'tr' ? brand.description_tr : (brand.description_en || brand.description_tr)) && (
                                            <p className={styles.brandDesc}>
                                                {locale === 'tr' ? brand.description_tr : (brand.description_en || brand.description_tr)}
                                            </p>
                                        )}
                                        <Link href={`/products?brand=${brand.id}`} className={styles.brandLink}>{tb('viewProducts')} &rarr;</Link>
                                    </div>
                                </a>
                            ) : (
                                <>
                                    <div className={styles.brandLogoWrapper}>
                                        {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                                <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} />
                                            </div>
                                        ) : (
                                            <span className={styles.logoPlaceholder}>{brand.name}</span>
                                        )}
                                    </div>
                                    <div className={styles.brandInfo}>
                                        <div className={styles.brandHeader}>
                                            <h2 className={styles.brandName}>{brand.name}</h2>
                                        </div>
                                        {(locale === 'tr' ? brand.description_tr : (brand.description_en || brand.description_tr)) && (
                                            <p className={styles.brandDesc}>
                                                {locale === 'tr' ? brand.description_tr : (brand.description_en || brand.description_tr)}
                                            </p>
                                        )}
                                        <Link href={`/products?brand=${brand.id}`} className={styles.brandLink}>{tb('viewProducts')} &rarr;</Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )) : (
                        <div style={{ padding: "3rem", textAlign: "center", gridColumn: "1 / -1", color: "var(--gray-500)" }}>
                            {tb('noBrands')}
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.partnershipSection}>
                <div className={`container ${styles.partnerBox}`}>
                    <h2>{tb('partnerTitle')}</h2>
                    <p>{tb('partnerDesc')}</p>
                    <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>{tb('partnerCta')}</Link>
                </div>
            </section>
        </>
    );
}
