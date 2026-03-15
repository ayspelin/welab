'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
    const t = useTranslations('Cookie');
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('welab_cookie_consent');
        if (!consent) {
            // Small delay so it slides in after page loads
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('welab_cookie_consent', 'all');
        setVisible(false);
    };

    const acceptEssential = () => {
        localStorage.setItem('welab_cookie_consent', 'essential');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className={`${styles.overlay} ${visible ? styles.show : ''}`}>
            <div className={styles.banner}>
                <div className={styles.left}>
                    <div>
                        <h3 className={styles.title}>{t('title')}</h3>
                        <p className={styles.desc}>{t('desc')}</p>
                        {showDetails && (
                            <div className={styles.details}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailDot} style={{ backgroundColor: '#22c55e' }} />
                                    <div>
                                        <strong>{t('essentialTitle')}</strong>
                                        <span>{t('essentialDesc')}</span>
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailDot} style={{ backgroundColor: '#3b82f6' }} />
                                    <div>
                                        <strong>{t('analyticsTitle')}</strong>
                                        <span>{t('analyticsDesc')}</span>
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailDot} style={{ backgroundColor: '#f59e0b' }} />
                                    <div>
                                        <strong>{t('marketingTitle')}</strong>
                                        <span>{t('marketingDesc')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button
                            className={styles.detailsToggle}
                            onClick={() => setShowDetails((p) => !p)}
                        >
                            {showDetails ? t('hideDetails') : t('showDetails')}
                        </button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnEssential} onClick={acceptEssential}>
                        {t('essential')}
                    </button>
                    <button className={styles.btnAccept} onClick={acceptAll}>
                        {t('acceptAll')}
                    </button>
                </div>
            </div>
        </div>
    );
}
