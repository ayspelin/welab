"use client";

import { useState, useEffect } from "react";
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <div className={styles.logo}>
                    <Link href="/">
                        <Image src="/images/logo.svg" alt="WELAB Logo" width={220} height={86} style={{ objectFit: 'contain' }} priority />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li><Link href="/" className={styles.navLink}>{t('home')}</Link></li>
                        <li><Link href="/about" className={styles.navLink}>{t('about')}</Link></li>
                        <ProductDropdown />
                        <li><Link href="/brands" className={styles.navLink}>{t('brands')}</Link></li>
                        <li><Link href="/events" className={styles.navLink}>{t('events')}</Link></li>
                        <li><Link href="/dealers" className={styles.navLink}>{t('dealers')}</Link></li>
                        <li><Link href="/contact" className={styles.navLink}>{t('contact')}</Link></li>
                        <li><Link href="/downloads" className={styles.navLink}>{t('downloads')}</Link></li>
                    </ul>
                </nav>

                <div className={styles.actions}>
                    <LanguageSwitcher />
                    <div className={styles.desktopAuth}>
                        {user ? (
                            <>
                                {user.role === 'DEALER' && <Link href="/dealer-portal" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}>{t('portal')}</Link>}
                                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}>{t('admin')}</Link>}
                                <button onClick={logout} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}>{t('logout')}</button>
                            </>
                        ) : (
                            <Link href="/login" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}>{t('login')}</Link>
                        )}
                    </div>

                    {/* Hamburger Button (Mobile Only) */}
                    <button className={styles.hamburger} onClick={toggleMobileMenu} aria-label="Toggle Menu">
                        <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen1 : ''}`}></span>
                        <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen2 : ''}`}></span>
                        <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen3 : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <ul className={styles.mobileNavList}>
                    <li><Link href="/" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('home')}</Link></li>
                    <li><Link href="/about" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('about')}</Link></li>
                    <li><Link href="/products" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('products') || 'PRODUCTS'}</Link></li>
                    <li><Link href="/brands" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('brands')}</Link></li>
                    <li><Link href="/events" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('events')}</Link></li>
                    <li><Link href="/dealers" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('dealers')}</Link></li>
                    <li><Link href="/contact" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('contact')}</Link></li>
                    <li><Link href="/downloads" onClick={toggleMobileMenu} className={styles.mobileNavLink}>{t('downloads')}</Link></li>
                </ul>

                <div className={styles.mobileAuth}>
                    {user ? (
                        <>
                            {user.role === 'DEALER' && <Link href="/dealer-portal" onClick={toggleMobileMenu} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>{t('portal')}</Link>}
                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin" onClick={toggleMobileMenu} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>{t('admin')}</Link>}
                            <button onClick={() => { logout(); toggleMobileMenu(); }} className="btn btn-secondary" style={{ width: '100%' }}>{t('logout')}</button>
                        </>
                    ) : (
                        <Link href="/login" onClick={toggleMobileMenu} className="btn btn-primary" style={{ width: '100%' }}>{t('login')}</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
