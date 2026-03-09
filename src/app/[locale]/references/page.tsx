import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import ReferencesEventsClient from "./ReferencesEventsClient";

export default async function ReferencesPage(props: { params: Promise<{ locale: string }> }) {
    const { locale } = await props.params;
    const t = await getTranslations("References");

    const [references, events, settings] = await Promise.all([
        prisma.reference.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
        prisma.event.findMany({ where: { isActive: true }, orderBy: { date: 'desc' } }),
        prisma.setting.findFirst(),
    ]);

    const refNotice = locale === 'en'
        ? (settings?.refNotice_en || settings?.refNotice_tr || null)
        : (settings?.refNotice_tr || null);

    return (
        <ReferencesEventsClient
            references={references}
            events={events}
            locale={locale}
            refNotice={refNotice}
            labels={{
                pageTitle: t('pageTitle'),
                pageDesc: t('pageDesc'),
                tabRefs: t('tabRefs'),
                tabEvents: t('tabEvents'),
                noRefs: t('noRefs'),
                noEvents: t('noEvents'),
                sector: t('sector'),
            }}
        />
    );
}
