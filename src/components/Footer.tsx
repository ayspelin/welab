"use client";

import styles from "./Footer.module.css";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
    const locale = useLocale();
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
            {/* Bento top row */}
            <div className={styles.footerBento}>
                <div className={styles.footerBentoLeft}>
                    <h2 className={styles.footerBentoTitle}>{t('talkToExpert')}</h2>
                    <Link href="/contact" className="btn btn-primary">{t('contactExperts')}</Link>
                </div>
                <div className={styles.footerBentoRight}>
                    <p className={styles.footerBentoSubtitle}>
                        {t('findSolution')}<br />
                        <span>{t('laboratory')}</span><br />
                        {t('subSolution')}
                    </p>
                    <Link href="/products" className="btn btn-primary">{t('browseProducts')}</Link>
                </div>
            </div>

            {/* Main link columns from settings */}
            <div className={`container ${styles.footerGrid}`}>
                <div className={styles.brand}>
                    <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem', marginLeft: '-0.5rem' }}>
                        <img src="/images/logo.svg" alt="WELAB Logo" style={{ width: '200px', height: '78px', objectFit: 'contain' }} />
                    </Link>
                    <p className={styles.brandDesc}>
                        {locale === 'tr' ? (settings?.footerDesc_tr || t('brandDesc')) : (settings?.footerDesc_en || settings?.footerDesc_tr || t('brandDesc'))}
                    </p>
                    <div className={styles.socialLinks}>
                        {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>}
                        {settings?.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                        {settings?.twitterUrl && <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer">Twitter</a>}
                        {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube</a>}
                    </div>
                </div>

                {settings?.footerColumns ? (
                    // Parse if string (from API), otherwise use as array
                    (typeof settings.footerColumns === 'string' ? JSON.parse(settings.footerColumns) : settings.footerColumns).map((col: any, colIdx: number) => (
                        <div key={colIdx} className={styles.linksBlock}>
                            <h3 className={styles.linksTitle}>
                                {locale === 'tr' ? col.title_tr : (col.title_en || col.title_tr)}
                            </h3>
                            <ul className={styles.linksList}>
                                {col.links.map((link: any, linkIdx: number) => (
                                    <li key={linkIdx}>
                                        <Link href={link.href}>
                                            {locale === 'tr' ? link.label_tr : (link.label_en || link.label_tr)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    // Fallback to translations/static if no settings
                    <>
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
                    </>
                )}

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
