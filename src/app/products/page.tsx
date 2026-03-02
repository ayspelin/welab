import styles from "./products.module.css";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function Products() {
    const categories = await prisma.category.findMany({
        where: { parentId: null }, // Only show top-level categories on the main product screen
        orderBy: { name: 'asc' }
    });

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Ürünler</h1>
                    <div className={styles.breadcrumb}>
                        <Link href="/">Ana Sayfa</Link> &gt; <span>Ürünler</span>
                    </div>
                </div>
            </section>

            <div className={`container ${styles.categoryGridSection}`}>
                <div className={styles.categoryGrid}>
                    {categories.map(cat => (
                        <Link href={`/products/category/${cat.id}`} key={cat.id} className={styles.categoryCard}>
                            <div className={styles.categoryImageWrapper}>
                                {!cat.imageUrl ? (
                                    <span className={styles.imagePlaceholder}>Görsel <br /> {cat.name}</span>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <Image
                                            src={cat.imageUrl}
                                            alt={cat.name}
                                            fill
                                            style={{ objectFit: 'contain', padding: '1rem' }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className={styles.categoryInfo}>
                                <h3 className={styles.categoryName}>{cat.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
                {categories.length === 0 && (
                    <div className="container" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-500)' }}>
                        Henüz hiçbir kategori eklenmemiş.
                    </div>
                )}
            </div>
        </>
    );
}
