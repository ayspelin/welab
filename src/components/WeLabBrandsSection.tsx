'use client';

import React, { useState } from 'react';
import styles from './WeLabBrandsSection.module.css';
import InquiryModal from './InquiryModal';

interface SubBrand {
    name: string;
    suffix: string;
    color: string;
    icon: string;
    descKey: string;
}

const subBrands: SubBrand[] = [
    { name: 'We', suffix: 'Sale', color: '#1a6fc4', icon: '🔬', descKey: 'wesaleDesc' },
    { name: 'We', suffix: 'Care', color: '#0e9c6a', icon: '🛠️', descKey: 'wecareDesc' },
    { name: 'We', suffix: 'Apply', color: '#7c3aed', icon: '⚗️', descKey: 'weapplyDesc' },
    { name: 'We', suffix: 'Consult', color: '#d97706', icon: '📊', descKey: 'weconsultDesc' },
];

interface WeLabBrandsSectionProps {
    subtitle: string;
    title: string;
    desc: string;
    wesaleDesc: string;
    wecareDesc: string;
    weapplyDesc: string;
    weconsultDesc: string;
}

export default function WeLabBrandsSection({
    subtitle,
    title,
    desc,
    wesaleDesc,
    wecareDesc,
    weapplyDesc,
    weconsultDesc,
}: WeLabBrandsSectionProps) {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const descriptions: Record<string, string> = {
        wesaleDesc,
        wecareDesc,
        weapplyDesc,
        weconsultDesc,
    };

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <span className={styles.subtitle}>{subtitle}</span>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.desc}>{desc}</p>
                </div>

                <div className={styles.grid}>
                    {subBrands.map((brand) => (
                        <div
                            key={brand.suffix}
                            className={styles.card}
                            style={{ '--brand-color': brand.color } as React.CSSProperties}
                            onClick={() => setSelectedService(`We${brand.suffix}`)}
                        >
                            <div className={styles.iconWrap}>
                                <span className={styles.icon}>{brand.icon}</span>
                            </div>
                            <div className={styles.brandName}>
                                <span className={styles.we}>We</span>
                                <span className={styles.brandSuffix} style={{ color: brand.color }}>
                                    {brand.suffix}
                                </span>
                            </div>
                            <p className={styles.cardDesc}>{descriptions[brand.descKey]}</p>
                            
                            <div className={styles.cardFooter}>
                                <span className={styles.contactLink}>Göz At & Başvur &rarr;</span>
                            </div>
                            
                            <div className={styles.accent} style={{ backgroundColor: brand.color }} />
                        </div>
                    ))}
                </div>
            </div>

            <InquiryModal 
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                serviceName={selectedService || ''}
            />
        </section>
    );
}
