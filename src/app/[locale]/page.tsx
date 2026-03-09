import styles from "./page.module.css";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import BrandsSection from "@/components/BrandsSection";
import WeLabBrandsSection from "@/components/WeLabBrandsSection";
import { getTranslations } from "next-intl/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations("Home");

  const dbCategories = await prisma.category.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  const settings = await prisma.setting.findFirst();

  const currentHeroTitle = locale === 'tr'
    ? (settings?.heroTitle_tr || t.raw('heroTitle'))
    : (settings?.heroTitle_en || t.raw('heroTitle'));

  const currentHeroDesc = locale === 'tr'
    ? (settings?.heroDesc_tr || t('heroDesc'))
    : (settings?.heroDesc_en || t('heroDesc'));

  const currentHeroImageUrl = settings?.heroImageUrl || "/images/quality_control.png";
  const currentHeroBgImageUrl = settings?.heroBgImageUrl || "/images/hero_bg.png";

  const defaultFeatures = [
    'Authorized Global Distributorships',
    '24/7 Technical Service Support',
    'ISO 9001 Certified Quality Processes',
    'Turnkey Laboratory Setup'
  ];

  const defaultStats = [
    { number: '15+', label: 'Years of Experience' },
    { number: '500+', label: 'Completed Projects' },
    { number: '25', label: 'Global Brands' },
    { number: '24/7', label: 'Technical Support' }
  ];

  const settingsAny = settings as any;
  const featuresDb = locale === 'tr' ? settingsAny?.trustFeatures_tr : settingsAny?.trustFeatures_en;
  const statsDb = locale === 'tr' ? settingsAny?.trustStats_tr : settingsAny?.trustStats_en;

  const validFeatures = Array.isArray(featuresDb) ? featuresDb.filter(f => f && f.trim() !== '') : [];
  const validStats = Array.isArray(statsDb) ? statsDb.filter(s => s && s.number && s.label) : [];

  const displayFeatures = validFeatures.length > 0 ? validFeatures : defaultFeatures;
  const displayStats = validStats.length > 0 ? validStats : defaultStats;

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
      imageUrl: "/images/water.png"
    }
  ];

  const displayCategories = dbCategories.length > 0 ? dbCategories : defaultCategories;

  return (
    <>
      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src={currentHeroBgImageUrl}
            alt="Laboratory Background"
            fill
            style={{ objectFit: 'cover' }}
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
                width={520}
                height={390}
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.gradientDivider} />

      {/* ── WeLab Sub-Brands Section ── */}
      <WeLabBrandsSection
        subtitle={t('subBrandsSubtitle')}
        title={t('subBrandsTitle')}
        desc={t('subBrandsDesc')}
        wesaleDesc={t('wesaleDesc')}
        wecareDesc={t('wecareDesc')}
        weapplyDesc={t('weapplyDesc')}
        weconsultDesc={t('weconsultDesc')}
      />

      <div className={styles.gradientDivider} />

      {/* ── Brands Section ── */}
      <BrandsSection />

      <div className={styles.gradientDivider} />

      {/* ── Featured Categories ── */}
      <section className={styles.categoriesSection}>
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
                <Link href={`/products?category=${cat.id}`} className={styles.catLink}>
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.gradientDivider} />

      {/* ── Trust & Stats Section ── */}
      <section className={styles.trustSection}>
        <div className={`container ${styles.trustGrid}`}>
          <div className={styles.trustContent}>
            <h2>{t('trustTitle')}</h2>
            <p className={styles.trustDesc}>{t('trustDesc')}</p>
            <ul className={styles.trustList}>
              {displayFeatures.map((item: string, idx: number) => (
                <li key={`feature-${idx}`}>
                  <span className={styles.trustCheckIcon}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.statsWrapper}>
            {displayStats.map((s: { number: string; label: string }, idx: number) => (
              <div key={`stat-${idx}`} className={styles.statBox}>
                <span className={styles.statNumber}>{s.number}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
