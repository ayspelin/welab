import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getInternalBlogPath } from '@/lib/blogLinks';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXTAUTH_URL === 'http://localhost:3000' 
        ? 'https://welab.com' 
        : (process.env.NEXTAUTH_URL || 'https://welab.com');

    // Static routes
    const staticRoutes = [
        '',
        '/about',
        '/products',
        '/brands',
        '/events',
        '/downloads',
        '/contact',
        '/dealers',
        '/blog'
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Add static routes for both TR (default) and EN locales
    staticRoutes.forEach(route => {
        sitemapEntries.push({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
        });
        sitemapEntries.push({
            url: `${baseUrl}/en${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
        });
    });

    // Fetch active blog posts
    const blogs = await prisma.blog.findMany({
        where: { isActive: true },
        select: { slug: true, title_tr: true, title_en: true, updatedAt: true }
    });

    // Add dynamic blog routes for both locales
    blogs.forEach(blog => {
        sitemapEntries.push({
            url: `${baseUrl}${getInternalBlogPath(blog)}`,
            lastModified: blog.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.7,
        });
        sitemapEntries.push({
            url: `${baseUrl}/en${getInternalBlogPath(blog)}`,
            lastModified: blog.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.7,
        });
    });

    return sitemapEntries;
}
