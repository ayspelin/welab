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
                        <h2>Our Technical Expertise</h2>
                        <p>Every device we deliver is under the guarantee of our specialized engineers.</p>
                    </div>

                    <div className={styles.expertiseGrid}>
                        <div className={styles.expertiseCard}>
                            <div className={styles.expIcon}>⚙️</div>
                            <h3>Turnkey Installation</h3>
                            <p>Site preparation, hardware installation, and preliminary tests required for the correct positioning and commissioning of the devices.</p>
                        </div>
                        <div className={styles.expertiseCard}>
                            <div className={styles.expIcon}>✅</div>
                            <h3>Calibration & Validation</h3>
                            <p>Regular IQ/OQ/PQ validation processes and calibration services complying with international standard procedures.</p>
                        </div>
                        <div className={styles.expertiseCard}>
                            <div className={styles.expIcon}>🎓</div>
                            <h3>Application Training</h3>
                            <p>Theoretical and practical customized user trainings provided by our application specialists for your analysis methods.</p>
                        </div>
                        <div className={styles.expertiseCard}>
                            <div className={styles.expIcon}>🔧</div>
                            <h3>Maintenance & Repair</h3>
                            <p>Fast intervention, original spare part supply, and preventive periodic maintenance agreements.</p>
                        </div>
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

