import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const references = await prisma.reference.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        });
        return NextResponse.json(references);
    } catch (error) {
        console.error("Error fetching references:", error);
        return NextResponse.json({ error: "Failed to fetch references" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { name_tr, name_en, sector_tr, sector_en, logoUrl, isActive, order } = data;

        if (!name_tr) {
            return NextResponse.json({ error: "name_tr is required" }, { status: 400 });
        }

        const ref = await prisma.reference.create({
            data: { name_tr, name_en, sector_tr, sector_en, logoUrl, isActive: isActive ?? true, order: order ?? 0 }
        });
        return NextResponse.json(ref, { status: 201 });
    } catch (error) {
        console.error("Error creating reference:", error);
        return NextResponse.json({ error: "Failed to create reference" }, { status: 500 });
    }
}
