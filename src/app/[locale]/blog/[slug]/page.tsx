import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Metadata } from "next";
import styles from "../blog.module.css";
import { Link } from "@/i18n/routing";
import { getInternalBlogPath, getPublicBlogSlug } from "@/lib/blogLinks";
import { getYouTubeEmbedUrl } from "@/lib/mediaLinks";

interface Props {
    params: Promise<{ slug: string }>;
}

async function findActiveBlogBySlug(slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    const exactBlog = await prisma.blog.findFirst({
        where: {
            slug: decodedSlug,
            isActive: true
        }
    });

    if (exactBlog) return exactBlog;

    const activeBlogs = await prisma.blog.findMany({
        where: { isActive: true }
    });

    return activeBlogs.find((blog) => getPublicBlogSlug(blog) === decodedSlug) || null;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getTitleHtml(value: string | null | undefined, fallback: string) {
    const html = value?.trim();
    if (!html || html === "<p><br></p>") return escapeHtml(fallback);

    return html
        .replace(/<\/p>\s*<p[^>]*>/g, "<br>")
        .replace(/^<p[^>]*>/, "")
        .replace(/<\/p>$/, "");
}

function getSiteUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://welab.com";
    return (configuredUrl.includes("localhost") ? "https://welab.com" : configuredUrl).replace(/\/$/, "");
}

function getLocalizedBlogPath(blog: { slug?: string | null; title_tr?: string | null; title_en?: string | null }, locale: string) {
    const path = getInternalBlogPath(blog);
    return locale === "en" ? `/en${path}` : path;
}

function getAbsoluteUrl(value: string) {
    if (/^https?:\/\//i.test(value)) return value;
    return `${getSiteUrl()}${value.startsWith("/") ? "" : "/"}${value}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const locale = await getLocale();
    const blog = await findActiveBlogBySlug(slug);

    if (!blog) return { title: 'Not Found' };

    const title = locale === 'tr' ? (blog.seoTitle_tr || blog.title_tr) : (blog.seoTitle_en || blog.title_en || blog.title_tr);
    const description = locale === 'tr' ? (blog.seoDescription_tr || blog.excerpt_tr) : (blog.seoDescription_en || blog.excerpt_en || blog.excerpt_tr);
    const canonical = getLocalizedBlogPath(blog, locale);
    const trPath = getLocalizedBlogPath(blog, "tr");
    const enPath = getLocalizedBlogPath(blog, "en");

    return {
        title: `${title} | WeLab Blog`,
        description,
        openGraph: {
            title,
            description: description || undefined,
            type: 'article',
            url: canonical,
            publishedTime: blog.publishedAt ? blog.publishedAt.toISOString() : undefined,
            images: blog.coverImage ? [blog.coverImage] : [],
        },
        alternates: {
            canonical,
            languages: {
                tr: trPath,
                en: enPath
            }
        }
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const locale = await getLocale();
    const t = await getTranslations("Blog");
    const blog = await findActiveBlogBySlug(slug);

    if (!blog) notFound();

    const [relatedBlogs, settings] = await Promise.all([
        prisma.blog.findMany({
            where: {
                isActive: true,
                id: { not: blog.id }
            },
            orderBy: { publishedAt: 'desc' },
            take: 8
        }),
        prisma.setting.findFirst({
            select: {
                phone: true,
                email: true,
                address: true
            }
        })
    ]);

    const title = locale === 'tr' ? blog.title_tr : (blog.title_en || blog.title_tr);
    const titleHtml = locale === 'tr' ? blog.titleHtml_tr : (blog.titleHtml_en || blog.titleHtml_tr);
    const content = locale === 'tr' ? blog.content_tr : (blog.content_en || blog.content_tr);
    const description = locale === 'tr' ? (blog.seoDescription_tr || blog.excerpt_tr) : (blog.seoDescription_en || blog.excerpt_en || blog.excerpt_tr);
    const videoUrl = getYouTubeEmbedUrl(blog.youtubeUrl) || getYouTubeEmbedUrl(blog.slug);
    const canonicalUrl = getAbsoluteUrl(getLocalizedBlogPath(blog, locale));
    
    const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : "";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": blog.coverImage ? [getAbsoluteUrl(blog.coverImage)] : [],
        "datePublished": blog.publishedAt ? blog.publishedAt.toISOString() : undefined,
        "dateModified": blog.updatedAt.toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "author": {
            "@type": "Organization",
            "name": "WeLab"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <article className={styles.singlePage}>
                <div className={`container ${styles.singleShell}`}>
                    <main className={styles.singleArticle}>
                        <div className={styles.singleBreadcrumb}>
                            <Link href="/">{t('home')}</Link>
                            <span>/</span>
                            <Link href="/blog">{t('title')}</Link>
                            <span>/</span>
                            <span>{title}</span>
                        </div>

                        {blog.coverImage && (
                            <div className={styles.singleCover}>
                                <Image
                                    src={blog.coverImage}
                                    alt={title}
                                    fill
                                    priority
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 1024px) 100vw, 780px"
                                />
                            </div>
                        )}

                        <div className={styles.singleHeader}>
                            {date && <div className={styles.singleMeta}>{date}</div>}
                            <h1
                                className={styles.singleTitle}
                                dangerouslySetInnerHTML={{ __html: getTitleHtml(titleHtml, title) }}
                            />
                        </div>

                        {videoUrl && (
                            <div className={styles.singleVideo}>
                                <iframe
                                    src={videoUrl}
                                    title={`${title} video`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        <div 
                            className={styles.singleContent}
                            dangerouslySetInnerHTML={{ __html: content || "" }}
                        />
                    </main>

                    <aside className={styles.singleSidebar}>
                        {relatedBlogs.length > 0 && (
                            <section className={styles.sidebarBox}>
                                <h2 className={styles.sidebarTitle}>{t('relatedPosts')}</h2>
                                <div className={styles.relatedList}>
                                    {relatedBlogs.map((relatedBlog) => {
                                        const relatedTitle = locale === 'tr'
                                            ? relatedBlog.title_tr
                                            : (relatedBlog.title_en || relatedBlog.title_tr);

                                        return (
                                            <Link
                                                key={relatedBlog.id}
                                                href={getInternalBlogPath(relatedBlog)}
                                                className={styles.relatedLink}
                                            >
                                                <span>{relatedTitle}</span>
                                                <span aria-hidden="true">›</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <section className={styles.sidebarBox}>
                            <h2 className={styles.sidebarTitle}>{t('askQuestion')}</h2>
                            <p className={styles.sidebarText}>{t('askQuestionDesc')}</p>
                            <Link href="/contact" className={styles.sidebarButton}>
                                {t('contactCta')} ›
                            </Link>
                        </section>

                        <section className={styles.sidebarBox}>
                            <h2 className={styles.sidebarTitle}>{t('contactInfo')}</h2>
                            <ul className={styles.contactList}>
                                {settings?.address && <li>{settings.address}</li>}
                                {settings?.phone && (
                                    <li>
                                        <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                                    </li>
                                )}
                                {settings?.email && (
                                    <li>
                                        <a href={`mailto:${settings.email}`}>{settings.email}</a>
                                    </li>
                                )}
                            </ul>
                        </section>
                    </aside>
                </div>
            </article>
        </>
    );
}
