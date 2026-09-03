import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const locale = await getLocale();
    const blog = await findActiveBlogBySlug(slug);

    if (!blog) return { title: 'Not Found' };

    const title = locale === 'tr' ? (blog.seoTitle_tr || blog.title_tr) : (blog.seoTitle_en || blog.title_en || blog.title_tr);
    const description = locale === 'tr' ? (blog.seoDescription_tr || blog.excerpt_tr) : (blog.seoDescription_en || blog.excerpt_en || blog.excerpt_tr);

    return {
        title: `${title} | WeLab Blog`,
        description,
        openGraph: {
            title,
            description: description || undefined,
            type: 'article',
            publishedTime: blog.publishedAt ? blog.publishedAt.toISOString() : undefined,
            images: blog.coverImage ? [blog.coverImage] : [],
        },
        alternates: {
            canonical: getInternalBlogPath(blog)
        }
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const locale = await getLocale();
    const blog = await findActiveBlogBySlug(slug);

    if (!blog) notFound();

    const title = locale === 'tr' ? blog.title_tr : (blog.title_en || blog.title_tr);
    const content = locale === 'tr' ? blog.content_tr : (blog.content_en || blog.content_tr);
    const description = locale === 'tr' ? (blog.seoDescription_tr || blog.excerpt_tr) : (blog.seoDescription_en || blog.excerpt_en || blog.excerpt_tr);
    const legacyVideoUrl = getYouTubeEmbedUrl(blog.slug);
    
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
        "image": blog.coverImage ? [blog.coverImage] : [],
        "datePublished": blog.publishedAt ? blog.publishedAt.toISOString() : undefined,
        "dateModified": blog.updatedAt.toISOString(),
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
            
            <article className="container" style={{ paddingBottom: '6rem' }}>
                <div className={styles.singleHeader}>
                    <div className={styles.breadcrumb} style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                        <Link href="/" style={{ color: 'var(--gray-600)' }}>Home</Link> &gt; <Link href="/blog" style={{ color: 'var(--gray-600)' }}>Blog</Link> &gt; <span>{title}</span>
                    </div>
                    {date && <div className={styles.singleMeta}>{date}</div>}
                    <h1 className={styles.singleTitle}>{title}</h1>
                </div>

                {blog.coverImage && (
                    <div className={styles.singleCover}>
                        <Image
                            src={blog.coverImage}
                            alt={title}
                            fill
                            priority
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 1000px"
                        />
                    </div>
                )}

                {legacyVideoUrl && (
                    <div className={styles.singleVideo}>
                        <iframe
                            src={legacyVideoUrl}
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
            </article>
        </>
    );
}
