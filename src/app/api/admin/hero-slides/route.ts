import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.min(max, Math.max(min, Math.round(numericValue)));
};

const getTextValue = (value: unknown) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? value : null;
};

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
                eyebrow_tr: getTextValue(data.eyebrow_tr),
                eyebrow_en: getTextValue(data.eyebrow_en),
                title_tr: data.title_tr,
                title_en: data.title_en,
                desc_tr: data.desc_tr,
                desc_en: data.desc_en,
                buttonText_tr: data.buttonText_tr,
                buttonText_en: data.buttonText_en,
                buttonUrl: data.buttonUrl,
                secondaryButtonText_tr: data.secondaryButtonText_tr,
                secondaryButtonText_en: data.secondaryButtonText_en,
                secondaryButtonUrl: data.secondaryButtonUrl,
                imageUrl: data.imageUrl || "/images/hero_bg.png",
                titleSize: data.titleSize || "4rem",
                descSize: data.descSize || "1.25rem",
                showEyebrow: data.showEyebrow ?? true,
                showPrimaryButton: data.showPrimaryButton ?? true,
                showSecondaryButton: data.showSecondaryButton ?? true,
                textHorizontal: data.textHorizontal || "left",
                textVertical: data.textVertical || "center",
                cardPosition: data.cardPosition || "right",
                imagePositionX: clampNumber(data.imagePositionX, 50, 0, 100),
                imagePositionY: clampNumber(data.imagePositionY, 50, 0, 100),
                overlayOpacity: clampNumber(data.overlayOpacity, 100, 0, 100),
                gridEnabled: data.gridEnabled ?? true,
                gridSize: clampNumber(data.gridSize, 90, 40, 180),
                gridOpacity: clampNumber(data.gridOpacity, 24, 0, 100),
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
