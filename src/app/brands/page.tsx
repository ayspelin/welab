import styles from "./brands.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Brands() {
    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Global Brands</h1>
                    <p className={styles.pageDesc}>
                        We are the authorized turkey distributor for the world's leading laboratory technology manufacturers.
                    </p>
                </div>
            </section>

            <section className={`section ${styles.brandsSection}`}>
                <div className={`container ${styles.brandsGrid}`}>

                    <div className={styles.brandCard}>
                        <div className={styles.brandLogoWrapper}>
                            <span className={styles.logoPlaceholder}>TechAna Logo</span>
                        </div>
                        <div className={styles.brandInfo}>
                            <div className={styles.brandHeader}>
                                <h2 className={styles.brandName}>TechAna Analytics</h2>
                                <span className={styles.origin}>🇩🇪 Germany</span>
                            </div>
                            <p className={styles.brandDesc}>
                                Global leader in high-performance liquid chromatography and spectroscopy systems.
                                They produce devices known for their robustness and analytical precision.
                            </p>
                            <div className={styles.brandTags}>
                                <span className={styles.tag}>HPLC</span>
                                <span className={styles.tag}>UV-VIS</span>
                                <span className={styles.tag}>Spectroscopy</span>
                            </div>
                            <Link href="/products?brand=b1" className={styles.brandLink}>View Products &rarr;</Link>
                        </div>
                    </div>

                    <div className={styles.brandCard}>
                        <div className={styles.brandLogoWrapper}>
                            <span className={styles.logoPlaceholder}>AquaPure Logo</span>
                        </div>
                        <div className={styles.brandInfo}>
                            <div className={styles.brandHeader}>
                                <h2 className={styles.brandName}>AquaPure Systems</h2>
                                <span className={styles.origin}>🇸🇪 Sweden</span>
                            </div>
                            <p className={styles.brandDesc}>
                                Manufacturer of ultra-pure water systems and distillation units for basic laboratory needs and critical applications.
                            </p>
                            <div className={styles.brandTags}>
                                <span className={styles.tag}>Type 1 Water</span>
                                <span className={styles.tag}>Deionization</span>
                                <span className={styles.tag}>Distillation</span>
                            </div>
                            <Link href="/products?brand=b3" className={styles.brandLink}>View Products &rarr;</Link>
                        </div>
                    </div>

                    <div className={styles.brandCard}>
                        <div className={styles.brandLogoWrapper}>
                            <span className={styles.logoPlaceholder}>SpectraGen Logo</span>
                        </div>
                        <div className={styles.brandInfo}>
                            <div className={styles.brandHeader}>
                                <h2 className={styles.brandName}>SpectraGen Instruments</h2>
                                <span className={styles.origin}>🇺🇸 USA</span>
                            </div>
                            <p className={styles.brandDesc}>
                                Leading solutions in material characterization and quality control testing, with innovative physical testing equipment.
                            </p>
                            <div className={styles.brandTags}>
                                <span className={styles.tag}>Tensile Testers</span>
                                <span className={styles.tag}>Hardness</span>
                                <span className={styles.tag}>Material Analysis</span>
                            </div>
                            <Link href="/products?brand=b2" className={styles.brandLink}>View Products &rarr;</Link>
                        </div>
                    </div>

                </div>
            </section>

            <section className={styles.partnershipSection}>
                <div className={`container ${styles.partnerBox}`}>
                    <h2>Become a Partner</h2>
                    <p>Are you an international laboratory equipment manufacturer looking for a strong representative in the regional market?</p>
                    <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>Contact Management</Link>
                </div>
            </section>
        </>
    );
}
