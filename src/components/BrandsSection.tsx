import React from 'react';
import Image from 'next/image';
import styles from './BrandsSection.module.css';
import { prisma } from '@/lib/prisma';

export default async function BrandsSection() {
    // Fetch brands from db ordered by name
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' }
    });
    return (
        <section className={styles.brandsSection}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.subtitle}>DÜNYA MARKALARININ DİSTRİBÜTÖRLÜĞÜNÜ YAPIYORUZ!</span>
                    <h2 className={styles.title}>Temsilciliklerimiz</h2>
                </div>

                <div className={styles.grid}>
                    {brands.length > 0 ? brands.map((brand) => (
                        <div key={brand.id} className={styles.card} title={brand.name}>
                            {brand.logoUrl && brand.logoUrl !== '/images/placeholder.jpg' ? (
                                <div style={{ position: "relative", width: "100%", height: "100px" }}>
                                    <Image src={brand.logoUrl} alt={brand.name} fill style={{ objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <span className={styles.brandName}>{brand.name}</span>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div style={{ padding: "3rem", textAlign: "center", gridColumn: "1 / -1", color: "var(--gray-500)" }}>
                            Şu an listelenecek temsilcilik bulunmamaktadır.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
