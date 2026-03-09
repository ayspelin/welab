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
        const { title_tr, title_en, location, date, imageUrl, description_tr, description_en, isActive } = data;

        const updated = await prisma.event.update({
            where: { id },
            data: {
                title_tr, title_en, location,
                date: date ? new Date(date) : undefined,
                imageUrl, description_tr, description_en, isActive,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        await prisma.event.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
