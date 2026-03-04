"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import styles from "./Header.module.css";

export default function ProductDropdown() {
    const t = useTranslations("Navigation");
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    // We only want top-level categories for the main dropdown
                    const topLevel = data.filter((c: any) => c.parentId === null);
                    setCategories(topLevel);
                }
            } catch (error) {
                console.error("Failed to load categories for nav", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <li className={styles.dropdownContainer}>
            <Link href="/products" className={styles.navLink}>
                {t('products', { fallback: 'PRODUCTS' })} <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>▼</span>
            </Link>
            {categories.length > 0 && (
                <ul className={styles.dropdownMenu}>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link href={`/products/category/${cat.id}`} className={styles.dropdownItem}>
                                {cat.name}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link href="/products" className={styles.dropdownItemAll}>
                            All Products &rarr;
                        </Link>
                    </li>
                </ul>
            )}
        </li>
    );
}
