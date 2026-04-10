import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// DELETE /api/documents/folder — moves all docs in a category to "Genel"
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { category } = await req.json();
        if (!category || category === "Genel") {
            return NextResponse.json({ error: "Geçersiz klasör adı" }, { status: 400 });
        }

        // Move all documents in this category to "Genel"
        const result = await (prisma.document as any).updateMany({
            where: { category },
            data: { category: "Genel" },
        });

        return NextResponse.json({ message: `${result.count} belge "Genel" klasörüne taşındı.` });
    } catch (error) {
        console.error("Folder delete error:", error);
        return NextResponse.json({ error: "Klasör silinemedi" }, { status: 500 });
    }
}
