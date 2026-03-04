"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLocale = () => {
        const nextLocale = locale === 'tr' ? 'en' : 'tr';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLocale}
            style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--gray-100)',
                border: '1px solid var(--gray-200)',
                borderRadius: '50px',
                padding: '4px',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                position: 'relative',
                width: '76px',
                height: '36px',
                transition: 'all 0.3s ease',
                outline: 'none'
            }}
            aria-label="Dil Değiştir / Toggle Language"
        >
            <div style={{
                position: 'absolute',
                top: '3px',
                left: locale === 'tr' ? '3px' : '37px',
                width: '34px',
                height: '28px',
                backgroundColor: 'white',
                borderRadius: '50px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                zIndex: 1
            }} />
            <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: locale === 'tr' ? 700 : 500,
                color: locale === 'tr' ? 'var(--primary)' : 'var(--gray-400)',
                zIndex: 2,
                transition: 'all 0.3s ease',
                userSelect: 'none'
            }}>TR</span>
            <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: locale === 'en' ? 700 : 500,
                color: locale === 'en' ? 'var(--primary)' : 'var(--gray-400)',
                zIndex: 2,
                transition: 'all 0.3s ease',
                userSelect: 'none'
            }}>EN</span>
        </button>
    );
}
