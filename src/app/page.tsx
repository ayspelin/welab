import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import BrandsSection from "@/components/BrandsSection";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Industrial Laboratory Solutions</span>
            <h1 className={styles.heroTitle}>
              Analyze the Future with <br />
              <span className={styles.heroHighlight}>The Power of Science</span>
            </h1>
            <p className={styles.heroDesc}>
              We provide world-class laboratory equipment and professional technical support
              for your research, quality control, and industrial production processes.
            </p>
            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn-primary">Explore Products</Link>
              <Link href="/contact" className="btn btn-secondary">Request a Quote</Link>
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
            <h2>Our Solutions</h2>
            <p>End-to-end solutions for all your laboratory needs.</p>
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
            <h2 className={styles.trustTitle}>Why Choose WELAB?</h2>
            <p className={styles.trustDesc}>
              With over 15 years of industry experience, we not only sell devices but also
              provide comprehensive post-sales installation, calibration, and training services
              through our expert engineering staff.
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
            <h2 className={styles.ctaTitle}>Ready to Upgrade Your Laboratory?</h2>
            <p className={styles.ctaDesc}>Contact our expert engineers to find the most suitable solutions for your project.</p>
            <div className={styles.ctaActions}>
              <Link href="/contact" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>Contact Us</Link>
              <Link href="/brands" className="btn" style={{ border: '1px solid white', color: 'white' }}>View Our Partnerships</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

