import styles from "./categoryProducts.module.css";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CategoryProducts({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    // Fetch real category from database
    const category = await prisma.category.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!category) {
        notFound();
    }

    // Fetch products belonging to this category
    const products = await prisma.product.findMany({
        where: { categoryId: resolvedParams.id },
        include: { brand: true, images: { where: { isPrimary: true }, take: 1 } }
    });

    return (
        <div className={styles.categoryPage}>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{category.name}</h1>
                    <div className={styles.breadcrumb}>
                        <Link href="/">Ana Sayfa</Link> &gt; <Link href="/products">Ürünler</Link> &gt; <span>{category.name}</span>
                    </div>
                </div>
            </section>

            <section className={`container ${styles.productGridSection}`}>
                {products.length === 0 ? (
                    <div className={styles.noProducts}>
                        <p>Bu kategoride henüz ürün bulunmamaktadır. Görmek istediğiniz ürünleri Admin Panelinden ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className={styles.productGrid}>
                        {products.map(product => {
                            const mainImage = product.images?.[0]?.url;
                            return (
                                <Link href={`/products/${product.id}`} key={product.id} className={styles.productCard}>
                                    <div className={styles.productImageWrapper}>
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
                                    <div className={styles.productInfo}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: 600 }}>{product.brand?.name}</div>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
