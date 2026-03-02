"use client";

import styles from "./Footer.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);

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
                    <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                        <img src="/images/logo.svg" alt="WELAB Logo" width={180} height={54} />
                    </Link>
                    <p className={styles.brandDesc}>
                        Your Solution Partner for Industrial Laboratory Systems & Analytical Instruments.
                    </p>
                </div>

                <div className={styles.linksBlock}>
                    <h3 className={styles.linksTitle}>Corporate</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/quality">Quality Certificates</Link></li>
                        <li><Link href="/careers">Careers</Link></li>
                    </ul>
                </div>

                <div className={styles.linksBlock}>
                    <h3 className={styles.linksTitle}>Products & Solutions</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/products?category=c1">Analytical Instruments</Link></li>
                        <li><Link href="/products?category=c2">Quality Control</Link></li>
                        <li><Link href="/products?category=c3">Water Purification</Link></li>
                        <li><Link href="/brands">Global Brands</Link></li>
                    </ul>
                </div>

                <div className={styles.linksBlock}>
                    <h3 className={styles.linksTitle}>İletişim</h3>
                    <ul className={styles.linksList}>
                        {settings?.email && <li>{settings.email}</li>}
                        {settings?.phone && <li>{settings.phone}</li>}
                        {settings?.address && <li><span dangerouslySetInnerHTML={{ __html: settings.address.replace(/\n/g, '<br />') }} /></li>}
                    </ul>
                </div>
            </div>
            <div className={styles.bottomBar}>
                <div className={`container ${styles.bottomInner}`}>
                    <p>&copy; {new Date().getFullYear()} WELAB. All rights reserved.</p>
                    <div className={styles.legalLinks}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
