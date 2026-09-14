"use client";

import { useState, useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import styles from "./HeroSlider.module.css";

interface HeroSlide {
    id: string;
    eyebrow_tr?: string | null;
    eyebrow_en?: string | null;
    title_tr?: string | null;
    title_en?: string | null;
    desc_tr?: string | null;
    desc_en?: string | null;
    buttonText_tr?: string | null;
    buttonText_en?: string | null;
    buttonUrl?: string | null;
    secondaryButtonText_tr?: string | null;
    secondaryButtonText_en?: string | null;
    secondaryButtonUrl?: string | null;
    imageUrl: string;
    isActive: boolean;
    isSpecialDay: boolean;
    titleSize?: string | null;
    descSize?: string | null;
    showEyebrow?: boolean | null;
    showPrimaryButton?: boolean | null;
    showSecondaryButton?: boolean | null;
    textHorizontal?: string | null;
    textVertical?: string | null;
    cardPosition?: string | null;
    imagePositionX?: number | null;
    imagePositionY?: number | null;
    overlayOpacity?: number | null;
    gridEnabled?: boolean | null;
    gridSize?: number | null;
    gridOpacity?: number | null;
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

type HeroSlideStyle = CSSProperties & {
    "--hero-image-position"?: string;
    "--hero-title-size"?: string;
    "--hero-desc-size"?: string;
    "--hero-overlay-opacity"?: string;
    "--hero-grid-size"?: string;
    "--hero-grid-opacity"?: string;
};

const DEFAULT_EYEBROW_TR = "Endüstriyel laboratuvarlar için güvenilir servis ortağı";
const DEFAULT_EYEBROW_EN = "Trusted service partner for industrial laboratories";

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

const clampNumber = (value: number | null | undefined, fallback: number, min: number, max: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return fallback;
    return Math.min(max, Math.max(min, value));
};

const getLocaleText = (
    locale: string,
    tr?: string | null,
    en?: string | null,
    fallback = ""
) => {
    return locale === "tr" ? (tr || fallback) : (en || tr || fallback);
};

const getSlideStyle = (slide: HeroSlide): HeroSlideStyle => {
    const imageX = clampNumber(slide.imagePositionX, 50, 0, 100);
    const imageY = clampNumber(slide.imagePositionY, 50, 0, 100);
    const overlayOpacity = clampNumber(slide.overlayOpacity, 100, 0, 100) / 100;
    const gridSize = clampNumber(slide.gridSize, 90, 40, 180);
    const gridOpacity = clampNumber(slide.gridOpacity, 24, 0, 100) / 100;

    return {
        "--hero-image-position": `${imageX}% ${imageY}%`,
        "--hero-title-size": slide.titleSize || "clamp(2.8rem, 6.2vw, 5.7rem)",
        "--hero-desc-size": slide.descSize || "clamp(1rem, 1.9vw, 1.45rem)",
        "--hero-overlay-opacity": String(overlayOpacity),
        "--hero-grid-size": `${gridSize}px`,
        "--hero-grid-opacity": String(gridOpacity),
    };
};

const getPositionClasses = (slide: HeroSlide) => {
    const horizontalClass =
        slide.textHorizontal === "center"
            ? styles.textCenter
            : slide.textHorizontal === "right"
                ? styles.textRight
                : styles.textLeft;

    const verticalClass =
        slide.textVertical === "top"
            ? styles.verticalTop
            : slide.textVertical === "bottom"
                ? styles.verticalBottom
                : styles.verticalCenter;

    const cardClass =
        slide.cardPosition === "hidden"
            ? styles.cardHidden
            : slide.cardPosition === "left"
                ? styles.cardLeft
                : styles.cardRight;

    return `${horizontalClass} ${verticalClass} ${cardClass}`;
};

export default function HeroSlider({ slides, locale, fallback }: Props) {
    const [current, setCurrent] = useState(0);
    const activeSlides = useMemo(() => slides.filter(s => s.isActive), [slides]);
    const displaySlides = activeSlides.length > 0 ? activeSlides : null;
    const activeIndex = displaySlides ? current % displaySlides.length : 0;
    const isTr = locale === "tr";

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
                            style={{ objectFit: "cover" }}
                            priority
                        />
                    </div>
                    <div className={styles.overlay} />
                    <div className={styles.gridOverlay} />
                    <div className={`container ${styles.heroContainer} ${styles.textLeft} ${styles.verticalCenter} ${styles.cardRight}`}>
                        <div className={styles.heroContent}>
                            <span className={styles.eyebrow}>
                                {isTr ? DEFAULT_EYEBROW_TR : DEFAULT_EYEBROW_EN}
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
                const titleHtml = normalizeRichTextHtml(getLocaleText(locale, slide.title_tr, slide.title_en));
                const descHtml = normalizeRichTextHtml(getLocaleText(locale, slide.desc_tr, slide.desc_en));
                const rawPrimaryButtonText = getLocaleText(locale, slide.buttonText_tr, slide.buttonText_en);
                const rawSecondaryButtonText = getLocaleText(locale, slide.secondaryButtonText_tr, slide.secondaryButtonText_en);
                const customEyebrowText = getLocaleText(locale, slide.eyebrow_tr, slide.eyebrow_en);
                const defaultEyebrowText = slide.isSpecialDay
                    ? (isTr ? "Özel Gün" : "Special Day")
                    : (isTr ? DEFAULT_EYEBROW_TR : DEFAULT_EYEBROW_EN);
                const eyebrowText = customEyebrowText || defaultEyebrowText;
                const hasTitle = getPlainText(titleHtml).length > 0;
                const hasDesc = getPlainText(descHtml).length > 0;
                const hasCustomPrimaryButton = rawPrimaryButtonText.trim().length > 0;
                const hasCustomSecondaryButton = rawSecondaryButtonText.trim().length > 0;
                const showEyebrow = slide.showEyebrow !== false && (customEyebrowText.length > 0 || hasTitle || hasDesc || hasCustomPrimaryButton || hasCustomSecondaryButton);
                const hasTextContent = hasTitle || hasDesc || showEyebrow || hasCustomPrimaryButton || hasCustomSecondaryButton;
                const showPrimaryButton = hasTextContent && slide.showPrimaryButton !== false;
                const showSecondaryButton = hasTextContent && slide.showSecondaryButton !== false;
                const primaryButtonText = rawPrimaryButtonText || (isTr ? "Ürünleri İncele" : "View Products");
                const secondaryButtonText = rawSecondaryButtonText || (isTr ? "Uzmanla Görüş" : "Talk to an Expert");
                const showFeatureCard = hasTextContent && slide.cardPosition !== "hidden" && (hasTitle || hasDesc);
                const gridEnabled = slide.gridEnabled !== false;

                return (
                    <div
                        key={slide.id}
                        className={`${styles.slide} ${index === activeIndex ? styles.active : ""} ${!hasTextContent ? styles.imageOnlySlide : ""}`}
                        style={getSlideStyle(slide)}
                    >
                        <div className={styles.fullImage}>
                            <Image
                                src={slide.imageUrl}
                                alt={getPlainText(titleHtml) || getPlainText(descHtml) || "Hero slide"}
                                fill
                                priority={index === 0}
                                className={styles.mainImage}
                            />
                        </div>
                        <div className={styles.overlay} />
                        <div className={`${styles.gridOverlay} ${gridEnabled ? "" : styles.gridDisabled}`} />

                        {hasTextContent && (
                            <div className={`container ${styles.heroContainer} ${getPositionClasses(slide)}`}>
                                <div className={styles.slideContent}>
                                    {showEyebrow && (
                                        <span className={styles.eyebrow}>
                                            {eyebrowText}
                                        </span>
                                    )}
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
                                    {(showPrimaryButton || showSecondaryButton) && (
                                        <div className={styles.heroActions}>
                                            {showPrimaryButton && (
                                                <Link
                                                    href={slide.buttonUrl || "/products"}
                                                    className="btn btn-primary"
                                                >
                                                    {primaryButtonText}
                                                </Link>
                                            )}
                                            {showSecondaryButton && (
                                                <Link
                                                    href={slide.secondaryButtonUrl || "/contact"}
                                                    className="btn btn-secondary"
                                                >
                                                    {secondaryButtonText}
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {showFeatureCard && (
                                    <aside className={styles.featureCard} aria-label={isTr ? "Vitrin mesajı" : "Featured message"}>
                                        <span>{isTr ? "Vitrin" : "Showcase"}</span>
                                        <strong>{getPlainText(titleHtml) || (isTr ? "Laboratuvar çözümleri" : "Laboratory solutions")}</strong>
                                        {hasDesc && <p>{getPlainText(descHtml)}</p>}
                                    </aside>
                                )}
                            </div>
                        )}

                        {!hasTextContent && slide.isSpecialDay && (
                            <div className={styles.specialDayBadge}>
                                {isTr ? "Özel Gün" : "Special Day"}
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
                            className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ""}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`${isTr ? "Slayta geç" : "Go to slide"} ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
