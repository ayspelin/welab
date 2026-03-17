import styles from "./about.module.css";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function AboutUs() {
    const t = await getTranslations("Common");
    const locale = await getLocale();
    const settings = await prisma.setting.findFirst();
    const aboutHtml = locale === 'tr'
        ? (settings?.aboutText_tr || "<p>Hakkımızda yazısı henüz eklenmedi. Lütfen admin panelinden güncelleyiniz.</p>")
        : (settings?.aboutText_en || settings?.aboutText_tr || "<p>About Us text not added yet. Please update from admin panel.</p>");

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
    let expertiseData = locale === 'tr' ? settingsAny?.expertise_tr : settingsAny?.expertise_en;
    
    if (!expertiseData || !Array.isArray(expertiseData) || expertiseData.length === 0) {
        expertiseData = locale === 'tr' ? defaultExpertiseTr : defaultExpertiseEn;
    }

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{t('aboutUs')}</h1>
                    <p className={styles.pageDesc}>The Address of Trust and Expertise in Industrial Laboratory Solutions.</p>
                </div>
            </section>

            <section className={`section ${styles.contentSection}`}>
                <div className={`container ${styles.contentGrid}`}>
                    <div
                        className={styles.textContent}
                        dangerouslySetInnerHTML={{ __html: aboutHtml }}
                    />

                    <div className={styles.imageGallery}>
                        <div className={styles.imageMain}>
                            <span className={styles.placeholderLabel}>Corporate Office Image</span>
                        </div>
                        <div className={styles.imageSecondary}>
                            <span className={styles.placeholderLabel}>Laboratory Application Image</span>
                        </div>
                    </div>
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

            {/* References Section */}
            <section className={styles.referencesSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t('references')}</h2>
                        <p>Trusted by leading institutions across various sectors.</p>
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

