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

    const BrandCard = ({ brand }: { brand: any }) => (
        <div className={styles.card} title={brand.name}>
            {brand.url ? (
                <a href={brand.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', textDecoration: 'none', color: 'inherit' }}>
                    {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                            <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 150px, 200px" />
                        </div>
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <span className={styles.brandName}>{brand.name}</span>
                        </div>
                    )}
                </a>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                            <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 150px, 200px" />
                        </div>
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <span className={styles.brandName}>{brand.name}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <section className={styles.brandsSection}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.subtitle}>{t('brandsSubtitle')}</span>
                    <h2 className={styles.title}>{t('brandsTitle')}</h2>
                </div>
            </div>

            {brands.length > 0 ? (
                <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeContent}>
                        {brands.map((brand) => (
                            <BrandCard key={brand.id} brand={brand} />
                        ))}
                    </div>
                    {/* Duplicate set for infinite scroll effect */}
                    <div className={styles.marqueeContent} aria-hidden="true">
                        {brands.map((brand) => (
                            <BrandCard key={`${brand.id}-dup`} brand={brand} />
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
                    {t('noBrands')}
                </div>
            )}
        </section>
    );
}
