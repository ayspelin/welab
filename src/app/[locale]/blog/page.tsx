import { Link } from "@/i18n/routing";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import styles from "./blog.module.css";
import { Metadata } from "next";
import { getInternalBlogPath } from "@/lib/blogLinks";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Blog");
    return {
        title: `${t('title')} | WeLab`,
        description: "Endüstriyel Laboratuvar Sistemleri & Analitik Cihazlar hakkında en güncel blog yazıları.",
    };
}

export default async function Blog() {
    const t = await getTranslations("Blog");
    const locale = await getLocale();
    
    const blogs = await prisma.blog.findMany({
        where: { isActive: true },
        orderBy: { publishedAt: 'desc' }
    });

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{t('title')}</h1>
                    <div className={styles.breadcrumb}>
                        <Link href="/">{t('home')}</Link> &gt; <span>{t('title')}</span>
                    </div>
                </div>
            </section>

            <div className={`container ${styles.blogSection}`}>
                <div className={styles.blogGrid}>
                    {blogs.map(blog => {
                        const title = locale === 'tr' ? blog.title_tr : (blog.title_en || blog.title_tr);
                        const excerpt = locale === 'tr' ? blog.excerpt_tr : (blog.excerpt_en || blog.excerpt_tr);
                        const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : "";

                        return (
                            <Link href={getInternalBlogPath(blog)} key={blog.id} className={styles.blogCard}>
                                <div className={styles.blogImageWrapper}>
                                    {blog.coverImage ? (
                                        <Image
                                            src={blog.coverImage}
                                            alt={title}
                                            fill
                                            className={styles.blogImage}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>WeLab Blog</div>
                                    )}
                                </div>
                                <div className={styles.blogInfo}>
                                    {date && <div className={styles.blogDate}>{date}</div>}
                                    <h3 className={styles.blogTitle}>{title}</h3>
                                    <p className={styles.blogExcerpt}>{excerpt}</p>
                                    <span className={styles.readMore}>{t('readMore')} →</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {blogs.length === 0 && (
                    <div className={styles.emptyState}>
                        {t('empty')}
                    </div>
                )}
            </div>
        </>
    );
}
