import React from 'react';
import Image from 'next/image';
import styles from './BrandsSection.module.css';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';

export default async function BrandsSection() {
    const t = await getTranslations("Home");
    // Fetch brands from db ordered by name
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' }
    });
    return (
        <section className={styles.brandsSection}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.subtitle}>{t('brandsSubtitle')}</span>
                    <h2 className={styles.title}>{t('brandsTitle')}</h2>
                </div>

                <div className={styles.grid}>
                    {brands.length > 0 ? brands.map((brand) => (
                        <div key={brand.id} className={styles.card} title={brand.name}>
                            {brand.url ? (
                                <a href={brand.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%', width: '100%', textDecoration: 'none', color: 'inherit' }}>
                                    {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                                        <div style={{ position: "relative", width: "100%", height: "100px" }}>
                                            <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} />
                                        </div>
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <span className={styles.brandName}>{brand.name}</span>
                                        </div>
                                    )}
                                </a>
                            ) : (
                                <>
                                    {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                                        <div style={{ position: "relative", width: "100%", height: "100px" }}>
                                            <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} />
                                        </div>
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <span className={styles.brandName}>{brand.name}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )) : (
                        <div style={{ padding: "3rem", textAlign: "center", gridColumn: "1 / -1", color: "var(--gray-500)" }}>
                            {t('noBrands')}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
