import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    localePrefix: 'as-needed' // Only adds /en for English, default /tr is omitted from URL
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
