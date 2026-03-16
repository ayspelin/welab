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

export default function HeroSlider({ slides, locale, fallback }: Props) {
    const [current, setCurrent] = useState(0);
    const activeSlides = slides.filter(s => s.isActive);
    const displaySlides = activeSlides.length > 0 ? activeSlides : null;

    useEffect(() => {
        if (!displaySlides || displaySlides.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % displaySlides.length);
        }, 6000);
        
        return () => clearInterval(interval);
    }, [displaySlides]);

    if (!displaySlides) {
        // Render fallback static hero (current behavior)
        return (
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    <Image src={fallback.bgImage} alt="Laboratory Background" fill style={{ objectFit: 'cover' }} priority />
                </div>
                <div className={`container ${styles.heroContainer}`}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: fallback.title }} />
                        <div className={styles.heroDesc} dangerouslySetInnerHTML={{ __html: fallback.desc }} />
                        <div className={styles.heroActions}>
                            <Link href="/products" className="btn btn-primary">Products</Link>
                            <Link href="/contact" className="btn btn-secondary">Contact</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.sliderSection}>
            {displaySlides.map((slide, index) => (
                <div 
                    key={slide.id} 
                    className={`${styles.slide} ${index === current ? styles.active : ''}`}
                >
                    <Image 
                        src={slide.imageUrl} 
                        alt="Hero Slide" 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        priority={index === 0} 
                    />
                    <div className={styles.overlay} />
                    
                    <div className={`container ${styles.slideContainer}`}>
                        <div className={styles.slideContent}>
                            <h1 
                                className={styles.slideTitle} 
                                dangerouslySetInnerHTML={{ __html: (locale === 'tr' ? slide.title_tr : (slide.title_en || slide.title_tr)) || "" }}
                            />
                            <p 
                                className={styles.slideDesc}
                                dangerouslySetInnerHTML={{ __html: (locale === 'tr' ? slide.desc_tr : (slide.desc_en || slide.desc_tr)) || "" }}
                            />
                            {(slide.buttonText_tr || slide.buttonText_en) && (
                                <Link 
                                    href={slide.buttonUrl || "/products"} 
                                    className="btn btn-primary"
                                >
                                    {locale === 'tr' ? slide.buttonText_tr : (slide.buttonText_en || slide.buttonText_tr)}
                                </Link>
                            )}
                        </div>
                    </div>
                    {slide.isSpecialDay && (
                        <div className={styles.specialDayBadge}>
                            ✨ Authorized Global Representations ✨
                        </div>
                    )}
                </div>
            ))}

            {displaySlides.length > 1 && (
                <div className={styles.dots}>
                    {displaySlides.map((_, i) => (
                        <button 
                            key={i} 
                            className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
                            onClick={() => setCurrent(i)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
