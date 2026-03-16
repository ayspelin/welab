import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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