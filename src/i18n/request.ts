import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // 1. Fetch static base messages
    const baseMessages = (await import(`../../messages/${locale}.json`)).default;

    // 2. Fetch dynamic translations from database
    let dbTranslations = null;
    try {
        const { prisma } = await import('@/lib/prisma');
        const settings = await prisma.setting.findFirst() as any;
        if (settings) {
            const translationsField = locale === 'tr' ? settings.translations_tr : settings.translations_en;
            if (translationsField && typeof translationsField === 'object') {
                dbTranslations = translationsField;
            }
        }
    } catch (err) {
        console.error("Failed to load DB translations for i18n:", err);
    }

    // 3. Deep Merge Function
    const mergeDeep = (target: any, source: any) => {
        if (!source) return target;
        const output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    };

    const isObject = (item: any) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
    };

    // 4. Combine base and DB messages
    const finalMessages = dbTranslations ? mergeDeep(baseMessages, dbTranslations) : baseMessages;

    return {
        locale,
        messages: finalMessages
    };
});
