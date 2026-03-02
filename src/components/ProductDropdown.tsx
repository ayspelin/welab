"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function ProductDropdown() {
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
                Products <span style={{ fontSize: '0.75rem' }}>▼</span>
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
