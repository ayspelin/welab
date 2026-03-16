import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
                title_tr: data.title_tr,
                title_en: data.title_en,
                desc_tr: data.desc_tr,
                desc_en: data.desc_en,
                buttonText_tr: data.buttonText_tr,
                buttonText_en: data.buttonText_en,
                buttonUrl: data.buttonUrl,
                imageUrl: data.imageUrl,
                titleSize: data.titleSize,
                descSize: data.descSize,
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
