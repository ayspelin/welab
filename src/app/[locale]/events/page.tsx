import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import EventsClient from "./EventsClient";

export default async function EventsPage(props: { params: Promise<{ locale: string }> }) {
    const { locale } = await props.params;
    const t = await getTranslations("Events");

    const events = await prisma.event.findMany({
        where: { isActive: true },
        orderBy: { date: 'desc' }
    });

    const formattedEvents = events.map(e => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
    }));

    return (
        <EventsClient
            events={formattedEvents}
            locale={locale}
            labels={{
                pageTitle: t('pageTitle'),
                pageDesc: t('pageDesc'),
                noEvents: t('noEvents'),
            }}
        />
    );
}
