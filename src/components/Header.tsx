"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useAuth } from "@/context/AuthContext";
import ProductDropdown from "./ProductDropdown";

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerInner}`}>
                <div className={styles.logo}>
                    <Link href="/">
                        <Image src="/images/logo.svg" alt="WELAB Logo" width={160} height={48} style={{ objectFit: 'contain' }} priority />
                    </Link>
                </div>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li><Link href="/" className={styles.navLink}>Home</Link></li>
                        <li><Link href="/about" className={styles.navLink}>About</Link></li>
                        <ProductDropdown />
                        <li><Link href="/brands" className={styles.navLink}>Brands</Link></li>
                        <li><Link href="/contact" className={styles.navLink}>Contact</Link></li>
                        <li><Link href="/downloads" className={styles.navLink}>Downloads</Link></li>
                    </ul>
                </nav>
                <div className={styles.actions}>
                    {user ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{user.name}</span>
                            {user.role === 'DEALER' && <Link href="/dealer-portal" className="btn btn-secondary">Portal</Link>}
                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Link href="/admin" className="btn btn-secondary">Admin</Link>}
                            <button onClick={logout} className="btn" style={{ border: '1px solid var(--gray-300)' }}>Logout</button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary">Dealer Login</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
