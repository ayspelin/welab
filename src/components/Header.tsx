"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import styles from "./Header.module.css";
import { useAuth } from "@/context/AuthContext";
import ProductDropdown from "./ProductDropdown";
import LanguageSwitcher from "./LanguageSwitcher";

import { useTranslations } from "next-intl";

export default function Header() {
    const { user, logout } = useAuth();
    const t = useTranslations("Navigation");

    return (
        <header className={styles.header}>
            <div className={styles.topbar}>
                <div className={styles.topbarInner}>
                    <span style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--gray-300)' }}>
                        <span>info@welab.com</span>
                        <span>+90 (216) 000 00 00</span>
                    </span>
                    <LanguageSwitcher />
                </div>
            </div>
            <div className={styles.headerInner}>
                <div className={styles.logo}>
                    <Link href="/">
                        <Image src="/images/logo.svg" alt="WELAB Logo" width={250} height={98} style={{ objectFit: 'contain' }} priority />
                    </Link>
                </div>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li><Link href="/" className={styles.navLink}>{t('home')}</Link></li>
                        <li><Link href="/about" className={styles.navLink}>{t('about')}</Link></li>
                        <ProductDropdown />
                        <li><Link href="/brands" className={styles.navLink}>{t('brands')}</Link></li>
                        <li><Link href="/references" className={styles.navLink}>{t('references')}</Link></li>
                        <li><Link href="/contact" className={styles.navLink}>{t('contact')}</Link></li>
                        <li><Link href="/downloads" className={styles.navLink}>{t('downloads')}</Link></li>
                    </ul>
                </nav>
                <div className={styles.actions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginRight: '0.5rem' }}>{user.name}</span>
                            {user.role === 'DEALER' && <Link href="/dealer-portal" className="btn btn-secondary" style={{ width: '135px', textAlign: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>{t('portal')}</Link>}
                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin" className="btn btn-secondary" style={{ width: '135px', textAlign: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>{t('admin')}</Link>}
                            <button onClick={logout} className="btn" style={{ border: '1px solid var(--gray-300)', width: '135px', textAlign: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>{t('logout')}</button>
                        </>
                    ) : (
                        <Link href="/login" className="btn btn-primary" style={{ width: '135px', textAlign: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>{t('login')}</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
