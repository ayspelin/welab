import styles from "./page.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import BrandsSection from "@/components/BrandsSection";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>{t('heroBadge')}</span>
            <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: t.raw('heroTitle') }} />
            <p className={styles.heroDesc}>
              {t('heroDesc')}
            </p>
            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn-primary">{t('explore')}</Link>
              <Link href="/contact" className="btn btn-secondary">{t('quote')}</Link>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>Hero Image (Machines)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <BrandsSection />

      {/* Featured Categories */}
      <section className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>{t('solutionsTitle')}</h2>
            <p>{t('solutionsDesc')}</p>
          </div>

          <div className={styles.categoryGrid}>
            <div className={styles.categoryCard}>
              <div className={styles.catImage}>IMG</div>
              <h3 className={styles.catTitle}>Analytical Instruments</h3>
              <p className={styles.catDesc}>High precision chromatography, spectroscopy, and basic analytical systems.</p>
              <Link href="/products?category=c1" className={styles.catLink}>View Details &rarr;</Link>
            </div>
            <div className={styles.categoryCard}>
              <div className={styles.catImage}>IMG</div>
              <h3 className={styles.catTitle}>Quality Control</h3>
              <p className={styles.catDesc}>Durability tests, material analysis, and physical measurement devices.</p>
              <Link href="/products?category=c2" className={styles.catLink}>View Details &rarr;</Link>
            </div>
            <div className={styles.categoryCard}>
              <div className={styles.catImage}>IMG</div>
              <h3 className={styles.catTitle}>Water Purification</h3>
              <p className={styles.catDesc}>Type 1, Type 2, and Type 3 ultra-pure water systems for sensitive research.</p>
              <Link href="/products?category=c3" className={styles.catLink}>View Details &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className={styles.trustSection}>
        <div className={`container ${styles.trustGrid}`}>
          <div className={styles.trustContent}>
            <h2 className={styles.trustTitle}>{t('trustTitle')}</h2>
            <p className={styles.trustDesc}>
              {t('trustDesc')}
            </p>
            <ul className={styles.trustList}>
              <li>✔ Authorized Global Distributorships</li>
              <li>✔ 24/7 Technical Service Support</li>
              <li>✔ ISO 9001 Certified Quality Processes</li>
              <li>✔ Turnkey Laboratory Setup</li>
            </ul>
          </div>
          <div className={styles.statsWrapper}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>15+</span>
              <span className={styles.statLabel}>Years of Experience</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Completed Projects</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>25</span>
              <span className={styles.statLabel}>Global Brands</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Technical Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>{t('ctaTitle')}</h2>
            <p className={styles.ctaDesc}>{t('ctaDesc')}</p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>{t('ctaContact')}</Link>
              <Link href="/brands" className="btn" style={{ border: '1px solid white', color: 'white' }}>{t('ctaPartnerships')}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

