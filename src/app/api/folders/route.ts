import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET — list all folders (ensure "Genel" always exists)
export async function GET() {
    try {
        // Ensure "Genel" always exists
        await (prisma as any).documentFolder.upsert({
            where: { name: "Genel" },
            update: {},
            create: { name: "Genel" },
        });

        const folders = await (prisma as any).documentFolder.findMany({
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(folders);
    } catch (error) {
        console.error("Folder fetch error:", error);
        return NextResponse.json({ error: "Klasörler alınamadı" }, { status: 500 });
    }
}

// POST — create a folder
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: "Klasör adı boş olamaz" }, { status: 400 });
        }

        const folder = await (prisma as any).documentFolder.upsert({
            where: { name: name.trim() },
            update: {},
            create: { name: name.trim() },
        });

        return NextResponse.json(folder, { status: 201 });
    } catch (error) {
        console.error("Folder create error:", error);
        return NextResponse.json({ error: "Klasör oluşturulamadı" }, { status: 500 });
    }
}
