import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const data = await req.json();
        const { name_tr, name_en, sector_tr, sector_en, logoUrl, isActive, order } = data;

        const updated = await prisma.reference.update({
            where: { id },
            data: { name_tr, name_en, sector_tr, sector_en, logoUrl, isActive, order },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating reference:", error);
        return NextResponse.json({ error: "Failed to update reference" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        await prisma.reference.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting reference:", error);
        return NextResponse.json({ error: "Failed to delete reference" }, { status: 500 });
    }
}
