import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(slides);
    } catch (error) {
        console.error("Error fetching hero slides:", error);
        return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const slide = await prisma.heroSlide.create({
            data: {
                title_tr: data.title_tr,
                title_en: data.title_en,
                desc_tr: data.desc_tr,
                desc_en: data.desc_en,
                buttonText_tr: data.buttonText_tr,
                buttonText_en: data.buttonText_en,
                buttonUrl: data.buttonUrl,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
                isSpecialDay: data.isSpecialDay ?? false,
                order: data.order ?? 0,
            }
        });

        return NextResponse.json(slide, { status: 201 });
    } catch (error) {
        console.error("Error creating hero slide:", error);
        return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
    }
}
