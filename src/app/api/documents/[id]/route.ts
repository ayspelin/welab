import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { isPublic, title, type, productId } = body;

        const updateData: { isPublic?: boolean; title?: string; type?: string; productId?: string | null } = {};
        if (typeof isPublic === "boolean") updateData.isPublic = isPublic;
        if (typeof title === "string" && title.trim()) updateData.title = title.trim();
        if (typeof type === "string" && type.trim()) updateData.type = type;
        if (productId === null || productId === "") updateData.productId = null;
        else if (typeof productId === "string") updateData.productId = productId;

        const updated = await prisma.document.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Document update error:", error);
        return NextResponse.json(
            { error: "Failed to update document" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.document.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Belge başarıyla silindi" });
    } catch (error) {
        console.error("Document delete error:", error);
        return NextResponse.json(
            { error: "Belge silinirken bir hata oluştu" },
            { status: 500 }
        );
    }
}