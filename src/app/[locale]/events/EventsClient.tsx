'use client';

import Image from 'next/image';
import styles from './events.module.css';

interface Event {
    id: string;
    title_tr: string;
    title_en?: string | null;
    location?: string | null;
    date: Date | string;
    imageUrl?: string | null;
    description_tr?: string | null;
    description_en?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    isActive?: boolean;
}

interface Labels {
    pageTitle: string;
    pageDesc: string;
    noEvents: string;
}

interface Props {
    events: Event[];
    locale: string;
    labels: Labels;
}

export default function EventsClient({ events, locale, labels }: Props) {
    const formatDate = (d: string | Date) => new Date(d).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const getTitle = (e: Event) => locale === 'en' && e.title_en ? e.title_en : e.title_tr;
    const getDesc = (e: Event) => locale === 'en' && e.description_en ? e.description_en : e.description_tr;

    return (
        <div className={styles.page}>
            {/* Hero */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>{labels.pageTitle}</h1>
                <p className={styles.heroDesc}>{labels.pageDesc}</p>
            </div>

            <div className="container" style={{ marginTop: '4rem', paddingBottom: '6rem' }}>
                {events.length === 0 ? (
                    <div className={styles.empty}>{labels.noEvents}</div>
                ) : (
                    <div className={styles.eventsGrid}>
                        {events.map(ev => (
                            <div key={ev.id} className={styles.eventCard}>
                                <div className={styles.eventImageWrap}>
                                    {ev.imageUrl ? (
                                        <Image src={ev.imageUrl} alt={getTitle(ev)} fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className={styles.eventImagePlaceholder}>📅</div>
                                    )}
                                </div>
                                <div className={styles.eventBody}>
                                    <div className={styles.eventMeta}>
                                        {ev.location && <span className={styles.eventLocation}>📍 {ev.location}</span>}
                                        <span className={styles.eventDate}>{formatDate(ev.date)}</span>
                                    </div>
                                    <h3 className={styles.eventTitle}>{getTitle(ev)}</h3>
                                    {getDesc(ev) && <p className={styles.eventDesc}>{getDesc(ev)}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
