import styles from "./productDetail.module.css";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    const product = await prisma.product.findUnique({
        where: { id: resolvedParams.id },
        include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } }
    });

    if (!product) {
        notFound();
    }

    const { brand, category } = product;
    const mainImage = product.images?.[0]?.url;

    return (
        <>
            <div className={styles.breadcrumb}>
                <div className="container">
                    <h1>{category?.name}</h1>
                    <Link href="/">Ana Sayfa (Home)</Link> &gt;
                    <Link href="/products"> Ürünler (Products)</Link> &gt;
                    <Link href={`/products/category/${category?.id}`}> {category?.name}</Link> &gt;
                    <span> {product.name}</span>
                </div>
            </div>

            <section className={`section ${styles.productDetail}`}>
                <div className={`container ${styles.productGrid}`}>

                    {/* Left Column */}
                    <div className={styles.leftCol}>
                        <div className={styles.mainImage}>
                            {!mainImage ? (
                                <span className={styles.imagePlaceholder}>Görsel <br /> {product.name}</span>
                            ) : (
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'contain', padding: '1rem' }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            )}
                        </div>
                        <span className={styles.productSubTag}>{product.name}</span>

                        <div className={styles.manufacturerBox}>
                            <div className={styles.manufacturerLogo}>
                                {brand?.name.split(' ')[0]}
                            </div>
                            <div className={styles.manufacturerInfo}>
                                <span className={styles.mfgTitle}>Üretici Firma / Manufacturer</span>
                                <Link href={`/brands`} className={styles.mfgLink}>
                                    🔗 Üreticiye ait tüm ürünlerini görmek için tıklayın
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column */}
                    <div className={styles.middleCol}>
                        <div className={styles.headerRow}>
                            <h2 className={styles.productTitle}>{product.name}</h2>
                            <div className={styles.actionIcons}>
                                <button className={styles.iconBtn} title="Share">🔗</button>
                                <button className={styles.iconBtn} title="Print">🖨️</button>
                            </div>
                        </div>

                        <div className={styles.description}>
                            {(product.description || "").split('\n').map((line, i) => (
                                <p key={i} style={{ marginBottom: line.trim() ? '1rem' : '0' }}>{line}</p>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightCol}>
                        <span className={styles.formTitle}>Fiyat Teklifi İsteyin / Request Quote</span>
                        <form>
                            <div className={styles.formGroup}>
                                <label>Kurum/Firma Adı (Company Name)</label>
                                <input type="text" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Yetkili Adı Soyadı (Contact Name) *</label>
                                <input type="text" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Telefon Numarası (Phone) *</label>
                                <input type="tel" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>E-posta Adresi (Email)</label>
                                <input type="email" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Bulunduğu Şehir (City)</label>
                                <input type="text" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Referans URL</label>
                                <input type="text" value={`https://welab.com/products/${product.id}`} readOnly />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Açıklamalar (Notes)</label>
                                <textarea rows={4} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit' }}></textarea>
                            </div>
                            <button type="submit" className={styles.submitBtn}>GÖNDER / SUBMIT</button>
                        </form>
                    </div>

                </div>
            </section>
        </>
    );
}
