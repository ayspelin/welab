import styles from "./about.module.css";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

function getCertificateSeal(title?: string | null) {
    const normalizedTitle = title || "";
    const isoMatch = normalizedTitle.match(/\bISO\s*([0-9]{4,5})(?::?\s*([0-9]{4}))?/i);

    if (isoMatch) {
        return {
            label: "ISO",
            detail: isoMatch[2] ? `${isoMatch[1]}:${isoMatch[2]}` : isoMatch[1],
            type: "iso",
            ariaLabel: `${isoMatch[0]} certificate`
        };
    }

    if (/\bCE\b/i.test(normalizedTitle)) {
        return {
            label: "CE",
            detail: "DECLARATION",
            type: "ce",
            ariaLabel: "CE conformity declaration"
        };
    }

    return {
        label: "DOC",
        detail: "CERT",
        type: "default",
        ariaLabel: "Certificate document"
    };
}

function parseAboutImageSetting(value?: string | null) {
    if (!value) return { url: "", isActive: false };

    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed.url === "string") {
            return {
                url: parsed.url,
                isActive: parsed.isActive !== false,
            };
        }
    } catch {
        // Legacy records store a plain URL in this field.
    }

    return { url: value, isActive: true };
}

export default async function AboutUs() {
    const t = await getTranslations("Common");
    const locale = await getLocale();
    const settings = await prisma.setting.findFirst();
    const aboutHtml = locale === 'tr'
        ? (settings?.aboutText_tr || "<p>Hakkımızda yazısı henüz eklenmedi. Lütfen admin panelinden güncelleyiniz.</p>")
        : (settings?.aboutText_en || settings?.aboutText_tr || "<p>About Us text not added yet. Please update from admin panel.</p>");

    const cleanAboutHtml = aboutHtml.replace(/&nbsp;/g, ' ');

    const defaultExpertiseTr = [
        { icon: '⚙️', title: 'Anahtar Teslim Kurulum', desc: 'Cihazların doğru konumlandırılması ve devreye alınması.' },
        { icon: '✅', title: 'Kalibrasyon & Validasyon', desc: 'Uluslararası standartlara uygun IQ/OQ/PQ validasyonları.' },
        { icon: '🎓', title: 'Aplikasyon Eğitimi', desc: 'Analiz yöntemlerinize özel kullanıcı eğitimleri.' },
        { icon: '🔧', title: 'Bakım & Onarım', desc: 'Hızlı müdahale ve önleyici bakım hizmetleri.' },
    ];

    const defaultExpertiseEn = [
        { icon: '⚙️', title: 'Turnkey Installation', desc: 'Site preparation and hardware installation required for commissioning.' },
        { icon: '✅', title: 'Calibration & Validation', desc: 'Regular validation processes complying with international procedures.' },
        { icon: '🎓', title: 'Application Training', desc: 'Customized theoretical and practical user trainings.' },
        { icon: '🔧', title: 'Maintenance & Repair', desc: 'Fast intervention and preventive maintenance agreements.' },
    ];

    const settingsAny = settings as any;
    const mainAboutImage = parseAboutImageSetting(settingsAny?.aboutImageMain);
    const secondaryAboutImage = parseAboutImageSetting(settingsAny?.aboutImageSecondary);
    const aboutImages = [
        mainAboutImage.url && mainAboutImage.isActive
            ? {
                src: mainAboutImage.url,
                alt: locale === 'tr' ? 'Merkez Ofis Görseli' : 'Corporate Office Image',
            }
            : null,
        secondaryAboutImage.url && secondaryAboutImage.isActive
            ? {
                src: secondaryAboutImage.url,
                alt: locale === 'tr' ? 'Laboratuvar Uygulama Görseli' : 'Laboratory Application Image',
            }
            : null,
    ].filter(Boolean) as { src: string; alt: string }[];

    let expertiseData = locale === 'tr' ? settingsAny?.expertise_tr : settingsAny?.expertise_en;
    
    if (!expertiseData || !Array.isArray(expertiseData) || expertiseData.length === 0) {
        expertiseData = locale === 'tr' ? defaultExpertiseTr : defaultExpertiseEn;
    }

    let certificatesData = [];
    if (settingsAny?.certificates) {
        try {
            certificatesData = typeof settingsAny.certificates === 'string' 
                ? JSON.parse(settingsAny.certificates) 
                : settingsAny.certificates;
            certificatesData = certificatesData.filter((c: any) => c.isVisible);
        } catch (e) {
            console.error("Failed to parse certificates", e);
        }
    }

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={`container ${styles.headerContainer}`}>
                    <h1 className={styles.pageTitle}>{t('aboutUs')}</h1>
                    <p className={styles.pageDesc}>
                        {locale === 'tr' 
                            ? 'Laboratuvar Çözümlerinde Güven ve Uzmanlığın Adresi.' 
                            : 'The Address of Trust and Expertise in Laboratory Solutions.'}
                    </p>
                </div>
            </section>

            <section className={styles.contentSection}>
                <div className={`container ${styles.contentGrid} ${aboutImages.length === 0 ? styles.contentGridNoImages : ''}`}>
                    <div
                        className={styles.textContent}
                        dangerouslySetInnerHTML={{ __html: cleanAboutHtml }}
                    />

                    {aboutImages.length > 0 && (
                        <div className={`${styles.imageGallery} ${aboutImages.length === 1 ? styles.imageGallerySingle : ''}`}>
                            {aboutImages.map((image, index) => (
                                <div
                                    key={image.src}
                                    className={aboutImages.length === 1 ? styles.imageSingle : (index === 0 ? styles.imageMain : styles.imageSecondary)}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.expertiseSection}>
                <div className="container">
                    <div className={styles.expertiseHeader}>
                        <h2>{locale === 'tr' ? 'Teknik Uzmanlığımız' : 'Our Technical Expertise'}</h2>
                        <p>{locale === 'tr' ? 'Teslim ettiğimiz her cihaz, uzman mühendislerimizin güvencesi altındadır.' : 'Every device we deliver is under the guarantee of our specialized engineers.'}</p>
                    </div>

                    <div className={styles.expertiseGrid}>
                        {expertiseData.map((exp: any, idx: number) => (
                            <div key={`exp-${idx}`} className={styles.expertiseCard}>
                                <div className={styles.expIcon}>{exp.icon}</div>
                                <h3>{exp.title}</h3>
                                <p>{exp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certificates Section */}
            {certificatesData && certificatesData.length > 0 && (
                <section className={styles.certificatesSection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <h2>{locale === 'tr' ? 'Kalite Belgelerimiz' : 'Our Quality Certificates'}</h2>
                            <p>{locale === 'tr' ? 'Uluslararası standartlara uygunluk ve kalite güvencemiz.' : 'Our compliance with international standards and quality assurance.'}</p>
                        </div>
                        <div className={styles.certificatesGrid}>
                            {certificatesData.map((cert: any, idx: number) => {
                                const certTitle = locale === 'tr' ? cert.title_tr : (cert.title_en || cert.title_tr);
                                const seal = getCertificateSeal(certTitle);

                                return (
                                    <a
                                        key={`cert-${idx}`}
                                        href={cert.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.certificateCard}
                                    >
                                        <div
                                            className={`${styles.certSeal} ${styles[`certSeal${seal.type.charAt(0).toUpperCase()}${seal.type.slice(1)}`]}`}
                                            aria-label={seal.ariaLabel}
                                        >
                                            <span>{seal.label}</span>
                                            <small>{seal.detail}</small>
                                        </div>
                                        <h3 className={styles.certTitle}>{certTitle}</h3>
                                        <span className={styles.certView}>{locale === 'tr' ? 'Görüntüle' : 'View'}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* References Section */}
            <section className={styles.referencesSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t('references')}</h2>
                        <p>
                            {locale === 'tr' 
                                ? 'Farklı sektörlerden öncü kurumların tercihi.' 
                                : 'Trusted by leading institutions across various sectors.'}
                        </p>
                    </div>

                    <div className={styles.referencesGrid}>
                        {(await prisma.reference.findMany({
                            where: { isActive: true },
                            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
                        })).map((ref) => (
                            <div key={ref.id} className={styles.referenceCard}>
                                {ref.logoUrl ? (
                                    <div className={styles.refLogoWrapper}>
                                        <Image
                                            src={ref.logoUrl}
                                            alt={locale === 'tr' ? ref.name_tr : (ref.name_en || ref.name_tr)}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.refInitial}>
                                        {(locale === 'tr' ? ref.name_tr : (ref.name_en || ref.name_tr)).charAt(0)}
                                    </div>
                                )}
                                <h4 className={styles.refName}>{locale === 'tr' ? ref.name_tr : (ref.name_en || ref.name_tr)}</h4>
                                {ref.sector_tr && (
                                    <span className={styles.refSector}>
                                        {locale === 'tr' ? ref.sector_tr : (ref.sector_en || ref.sector_tr)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
