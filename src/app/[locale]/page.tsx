import styles from "./page.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import BrandsSection from "@/components/BrandsSection";
import { getTranslations } from "next-intl/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations("Home");

  // Fetch up to 3 categories from the database
  const dbCategories = await prisma.category.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  // Fetch Site Settings for Hero Texts
  const settings = await prisma.setting.findFirst();

  // Determine dynamic copy, fallback to hardcoded localization
  const currentHeroTitle = locale === 'tr'
    ? (settings?.heroTitle_tr || t.raw('heroTitle'))
    : (settings?.heroTitle_en || t.raw('heroTitle'));

  const currentHeroDesc = locale === 'tr'
    ? (settings?.heroDesc_tr || t('heroDesc'))
    : (settings?.heroDesc_en || t('heroDesc'));

  const currentHeroImageUrl = settings?.heroImageUrl || "/images/quality_control.png";
  const currentHeroBgImageUrl = settings?.heroBgImageUrl || "/images/hero_bg.png";

  // Default fallback categories with high-quality AI images
  const defaultCategories = [
    {
      id: "c1",
      name_en: "Analytical Instruments",
      description_en: "High precision chromatography, spectroscopy, and basic analytical systems.",
      imageUrl: "/images/analytical_instruments.png"
    },
    {
      id: "c2",
      name_en: "Quality Control",
      description_en: "Durability tests, material analysis, and physical measurement devices.",
      imageUrl: "/images/quality_control.png"
    },
    {
      id: "c3",
      name_en: "Water Purification",
      description_en: "Type 1, Type 2, and Type 3 ultra-pure water systems for sensitive research.",
      imageUrl: "/images/water.png" // using existing water.png if available, we can also generate one
    }
  ];

  // If DB is empty, use defaults. Otherwise, use DB data (and fallback images if DB image is missing)
  const displayCategories = dbCategories.length > 0 ? dbCategories : defaultCategories;

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src={currentHeroBgImageUrl}
            alt="Laboratory Background"
            fill
            style={{ objectFit: 'cover', zIndex: -1, opacity: 0.15 }}
            priority
          />
        </div>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>{t('heroBadge')}</span>
            <div
              className={styles.heroTitle}
              role="heading"
              aria-level={1}
              dangerouslySetInnerHTML={{ __html: currentHeroTitle }}
            />
            <div
              className={styles.heroDesc}
              dangerouslySetInnerHTML={{ __html: currentHeroDesc }}
            />
            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn-primary">{t('explore')}</Link>
              <Link href="/contact" className="btn btn-secondary">{t('quote')}</Link>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <div className={styles.heroImageContainer}>
              <Image
                src={currentHeroImageUrl}
                alt="Advanced Laboratory Equipment"
                width={600}
                height={450}
                style={{ objectFit: 'cover', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                priority
              />
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
            {displayCategories.map((cat: any, index: number) => (
              <div key={cat.id} className={styles.categoryCard}>
                <div className={styles.catImageContainer}>
                  <Image
                    src={cat.imageUrl || defaultCategories[index % 3].imageUrl}
                    alt={cat.name_en}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className={styles.catTitle}>{cat.name_en}</h3>
                <p className={styles.catDesc}>{cat.description_en}</p>
                <Link href={`/products?category=${cat.id}`} className={styles.catLink}>View Details &rarr;</Link>
              </div>
            ))}
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

