"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import styles from "./Header.module.css";

export default function ProductDropdown() {
    const t = useTranslations("Navigation");

    return (
        <li>
            <Link href="/products" className={styles.navLink}>
                {t('products', { fallback: 'PRODUCTS' })}
            </Link>
        </li>
    );
}
