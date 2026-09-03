import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizeBlogSlug } from "@/lib/blogLinks";

async function getAvailableSlug(input: string | null | undefined, title: string | null | undefined) {
    const baseSlug = normalizeBlogSlug(input, title);
    let slug = baseSlug;
    let suffix = 2;

    while (await prisma.blog.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return slug;
}

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const slug = await getAvailableSlug(data.slug, data.title_tr);
        
        const blog = await prisma.blog.create({
            data: {
                slug,
                title_tr: data.title_tr,
                title_en: data.title_en,
                content_tr: data.content_tr,
                content_en: data.content_en,
                excerpt_tr: data.excerpt_tr,
                excerpt_en: data.excerpt_en,
                coverImage: data.coverImage,
                seoTitle_tr: data.seoTitle_tr,
                seoTitle_en: data.seoTitle_en,
                seoDescription_tr: data.seoDescription_tr,
                seoDescription_en: data.seoDescription_en,
                publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
                isActive: data.isActive ?? true,
            }
        });

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        console.error("Error creating blog:", error);
        return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
    }
}
