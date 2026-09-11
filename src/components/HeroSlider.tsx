"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import styles from "./HeroSlider.module.css";

interface HeroSlide {
    id: string;
    title_tr?: string | null;
    title_en?: string | null;
    desc_tr?: string | null;
    desc_en?: string | null;
    buttonText_tr?: string | null;
    buttonText_en?: string | null;
    buttonUrl?: string | null;
    imageUrl: string;
    isActive: boolean;
    isSpecialDay: boolean;
    titleSize?: string | null;
    descSize?: string | null;
}

interface Props {
    slides: HeroSlide[];
    locale: string;
    fallback: {
        title: string;
        desc: string;
        bgImage: string;
        image: string;
    }
}

const getPlainText = (html?: string | null) => {
    return (html || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\u00a0/g, " ")
        .trim();
};

const normalizeRichTextHtml = (html?: string | null) => {
    return (html || "")
        .replace(/&nbsp;/g, " ")
        .replace(/\u00a0/g, " ");
};

export default function HeroSlider({ slides, locale, fallback }: Props) {
    const [current, setCurrent] = useState(0);
    const activeSlides = slides.filter(s => s.isActive);
    const displaySlides = activeSlides.length > 0 ? activeSlides : null;
    const isTr = locale === 'tr';

    useEffect(() => {
        if (!displaySlides || displaySlides.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % displaySlides.length);
        }, 6000);
        
        return () => clearInterval(interval);
    }, [displaySlides]);

    if (!displaySlides) {
        const titleText = getPlainText(fallback.title);
        const descText = getPlainText(fallback.desc);

        return (
            <section className={styles.sliderSection}>
                <div className={`${styles.slide} ${styles.active}`}>
                    <div className={styles.fullImage}>
                        <Image
                            src={fallback.bgImage}
                            alt={titleText || "Laboratory background"}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                    </div>
                    <div className={styles.overlay} />
                    <div className={styles.gridOverlay} />
                    <div className={`container ${styles.heroContainer}`}>
                        <div className={styles.heroContent}>
                            <span className={styles.eyebrow}>
                                {isTr ? "Endüstriyel laboratuvarlar için güvenilir servis ortağı" : "Trusted service partner for industrial laboratories"}
                            </span>
                            <div className={styles.slideTitle} dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(fallback.title) }} />
                            <div className={styles.slideDesc} dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(fallback.desc) }} />
                            <div className={styles.heroActions}>
                                <Link href="/products" className="btn btn-primary">{isTr ? "Ürünleri İncele" : "View Products"}</Link>
                                <Link href="/contact" className="btn btn-secondary">{isTr ? "Uzmanla Görüş" : "Talk to an Expert"}</Link>
                            </div>
                        </div>
                        <aside className={styles.featureCard} aria-label={isTr ? "Vitrin mesajı" : "Featured message"}>
                            <span>{isTr ? "Vitrin" : "Showcase"}</span>
                            <strong>{titleText || (isTr ? "Geleceğin Kimya Teknolojileri" : "Chemistry Technologies for Tomorrow")}</strong>
                            {descText && <p>{descText}</p>}
                        </aside>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.sliderSection}>
            {displaySlides.map((slide, index) => {
                const titleHtml = normalizeRichTextHtml(locale === 'tr' ? slide.title_tr : (slide.title_en || slide.title_tr));
                const descHtml = normalizeRichTextHtml(locale === 'tr' ? slide.desc_tr : (slide.desc_en || slide.desc_tr));
                const buttonText = (locale === 'tr' ? slide.buttonText_tr : (slide.buttonText_en || slide.buttonText_tr)) || "";
                const hasTitle = getPlainText(titleHtml).length > 0;
                const hasDesc = getPlainText(descHtml).length > 0;
                const hasButton = buttonText.trim().length > 0;
                const hasTextContent = hasTitle || hasDesc || hasButton;

                return (
                    <div
                        key={slide.id}
                        className={`${styles.slide} ${index === current ? styles.active : ''} ${!hasTextContent ? styles.imageOnlySlide : ''}`}
                    >
                        <div className={styles.fullImage}>
                            <Image
                                src={slide.imageUrl}
                                alt={getPlainText(titleHtml) || "Hero slide"}
                                fill
                                priority={index === 0}
                                className={styles.mainImage}
                            />
                        </div>
                        <div className={styles.overlay} />
                        <div className={styles.gridOverlay} />

                        {hasTextContent && (
                            <div className={`container ${styles.heroContainer}`}>
                                <div className={styles.slideContent}>
                                    <span className={styles.eyebrow}>
                                        {slide.isSpecialDay
                                            ? (isTr ? 'Özel Gün' : 'Special Day')
                                            : (isTr ? 'Endüstriyel laboratuvarlar için güvenilir servis ortağı' : 'Trusted service partner for industrial laboratories')}
                                    </span>
                                    <div>
                                        {hasTitle && (
                                            <div
                                                className={styles.slideTitle}
                                                dangerouslySetInnerHTML={{ __html: titleHtml }}
                                            />
                                        )}
                                        {hasDesc && (
                                            <div
                                                className={styles.slideDesc}
                                                dangerouslySetInnerHTML={{ __html: descHtml }}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.heroActions}>
                                        <Link
                                            href={slide.buttonUrl || "/products"}
                                            className="btn btn-primary"
                                        >
                                            {hasButton ? buttonText : (isTr ? "Ürünleri İncele" : "View Products")}
                                        </Link>
                                        <Link href="/contact" className="btn btn-secondary">
                                            {isTr ? "Uzmanla Görüş" : "Talk to an Expert"}
                                        </Link>
                                    </div>
                                </div>

                                <aside className={styles.featureCard} aria-label={isTr ? "Vitrin mesajı" : "Featured message"}>
                                    <span>{isTr ? "Vitrin" : "Showcase"}</span>
                                    <strong>{getPlainText(titleHtml) || (isTr ? "Laboratuvar çözümleri" : "Laboratory solutions")}</strong>
                                    {hasDesc && <p>{getPlainText(descHtml)}</p>}
                                </aside>
                            </div>
                        )}

                        {!hasTextContent && slide.isSpecialDay && (
                            <div className={styles.specialDayBadge}>
                                {isTr ? 'Özel Gün' : 'Special Day'}
                            </div>
                        )}
                    </div>
                );
            })}

            {displaySlides.length > 1 && (
                <div className={styles.dots}>
                    {displaySlides.map((_, i) => (
                        <button 
                            key={i} 
                            className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`${isTr ? 'Slayta geç' : 'Go to slide'} ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
