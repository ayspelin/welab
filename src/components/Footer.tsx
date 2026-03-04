"use client";

import styles from "./Footer.module.css";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);
    const t = useTranslations("Footer");

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setSettings(data);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerGrid}`}>
                <div className={styles.brand}>
                    <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem', marginLeft: '-0.75rem' }}>
                        <img src="/images/logo.svg" alt="WELAB Logo" style={{ width: '250px', height: '98px', objectFit: 'contain' }} />
                    </Link>
                    <p className={styles.brandDesc}>
                        {t('brandDesc')}
                    </p>
                </div>

                <div className={styles.linksBlock}>
                    <h3 className={styles.linksTitle}>{t('links')}</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/about">{t('about')}</Link></li>
                        <li><Link href="/quality">{t('quality')}</Link></li>
                        <li><Link href="/careers">{t('careers')}</Link></li>
                    </ul>
                </div>

                <div className={styles.linksBlock}>
                    <h3 className={styles.linksTitle}>{t('productsTitle')}</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/products?category=c1">{t('analytical')}</Link></li>
                        <li><Link href="/products?category=c2">{t('qualityControl')}</Link></li>
                        <li><Link href="/products?category=c3">{t('waterPurification')}</Link></li>
                        <li><Link href="/brands">{t('brands')}</Link></li>
                    </ul>
                </div>

                <div className={styles.linksBlock}>
                    <h3 className={styles.linksTitle}>{t('contact')}</h3>
                    <ul className={styles.linksList}>
                        {settings?.email && <li>{settings.email}</li>}
                        {settings?.phone && <li>{settings.phone}</li>}
                        {settings?.address && <li><span dangerouslySetInnerHTML={{ __html: settings.address.replace(/\n/g, '<br />') }} /></li>}
                    </ul>
                </div>
            </div>
            <div className={styles.bottomBar}>
                <div className={`container ${styles.bottomInner}`}>
                    <p>&copy; {new Date().getFullYear()} WELAB. {t('rights')}</p>
                    <div className={styles.legalLinks}>
                        <Link href="/privacy">{t('privacy')}</Link>
                        <Link href="/terms">{t('terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
