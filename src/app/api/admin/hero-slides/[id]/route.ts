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

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const updated = await prisma.heroSlide.update({
            where: { id },
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
                titleSize: data.titleSize,
                descSize: data.descSize,
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
                isActive: data.isActive,
                isSpecialDay: data.isSpecialDay,
                order: data.order,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating hero slide:", error);
        return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.heroSlide.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting hero slide:", error);
        return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
    }
}
