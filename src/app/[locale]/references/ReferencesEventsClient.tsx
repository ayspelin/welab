'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './references.module.css';

interface Reference {
    id: string;
    name_tr: string;
    name_en?: string | null;
    sector_tr?: string | null;
    sector_en?: string | null;
    logoUrl?: string | null;
    order: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    isActive?: boolean;
}

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
    tabRefs: string;
    tabEvents: string;
    noRefs: string;
    noEvents: string;
    sector: string;
}

interface Props {
    references: Reference[];
    events: Event[];
    locale: string;
    refNotice: string | null;
    labels: Labels;
}

export default function ReferencesEventsClient({ references, events, locale, refNotice, labels }: Props) {
    const [activeTab, setActiveTab] = useState<'refs' | 'events'>('refs');

    const formatDate = (d: string | Date) => new Date(d).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const getName = (r: Reference) => locale === 'en' && r.name_en ? r.name_en : r.name_tr;
    const getSector = (r: Reference) => locale === 'en' && r.sector_en ? r.sector_en : r.sector_tr;
    const getTitle = (e: Event) => locale === 'en' && e.title_en ? e.title_en : e.title_tr;
    const getDesc = (e: Event) => locale === 'en' && e.description_en ? e.description_en : e.description_tr;

    return (
        <div className={styles.page}>
            {/* Hero */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>{labels.pageTitle}</h1>
                <p className={styles.heroDesc}>{labels.pageDesc}</p>
            </div>

            {/* Tabs */}
            <div className="container">
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'refs' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('refs')}
                    >
                        🏢 {labels.tabRefs}
                        <span className={styles.tabCount}>{references.length}</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        📅 {labels.tabEvents}
                        <span className={styles.tabCount}>{events.length}</span>
                    </button>
                </div>

                {/* References Tab */}
                {activeTab === 'refs' && (
                    <div className={styles.tabContent}>
                        {/* Coming Soon Notice */}
                        {refNotice && (
                            <div className={styles.notice}>
                                <span className={styles.noticeIcon}>🕐</span>
                                <p>{refNotice}</p>
                            </div>
                        )}
                        {references.length === 0 && !refNotice ? (
                            <div className={styles.empty}>{labels.noRefs}</div>
                        ) : references.length > 0 ? (
                            <div className={styles.refGrid}>
                                {references.map(r => (
                                    <div key={r.id} className={styles.refCard}>
                                        <div className={styles.refLogoWrap}>
                                            {r.logoUrl ? (
                                                <Image src={r.logoUrl} alt={getName(r)} fill style={{ objectFit: 'contain' }} />
                                            ) : (
                                                <div className={styles.refInitials}>
                                                    {getName(r).slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.refInfo}>
                                            <strong className={styles.refName}>{getName(r)}</strong>
                                            {getSector(r) && <span className={styles.refSector}>{getSector(r)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className={styles.tabContent}>
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
                )}
            </div>
        </div>
    );
}
