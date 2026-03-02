import styles from "./about.module.css";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function AboutUs() {
    const settings = await prisma.setting.findFirst();
    const aboutHtml = settings?.aboutText || "<p>Hakkımızda yazısı henüz eklenmedi. Lütfen admin panelinden güncelleyiniz.</p>";

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>About Us</h1>
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
        </>
    );
}

