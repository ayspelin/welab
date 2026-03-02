import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { name, logoUrl, description } = data;

        if (!name || !logoUrl) {
            return NextResponse.json({ error: "Name and logo URL are required" }, { status: 400 });
        }

        const newBrand = await prisma.brand.create({
            data: {
                name,
                logoUrl,
                description,
            }
        });

        return NextResponse.json(newBrand, { status: 201 });
    } catch (error) {
        console.error("Error creating brand:", error);
        return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
    }
}
