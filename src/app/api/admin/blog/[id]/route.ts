import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizeBlogSlug } from "@/lib/blogLinks";

async function getAvailableSlug(input: string | null | undefined, title: string | null | undefined, currentBlogId: string) {
    const baseSlug = normalizeBlogSlug(input, title);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        const existingBlog = await prisma.blog.findUnique({ where: { slug } });
        if (!existingBlog || existingBlog.id === currentBlogId) return slug;

        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blog = await prisma.blog.findUnique({
            where: { id }
        });

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const slug = await getAvailableSlug(data.slug, data.title_tr, id);

        const blog = await prisma.blog.update({
            where: { id },
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

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error updating blog:", error);
        return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.blog.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting blog:", error);
        return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
    }
}
