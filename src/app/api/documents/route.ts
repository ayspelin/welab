import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    try {
        const session = await getServerSession(authOptions);
        const isAuthenticated = !!(session && session.user);

        // If not authenticated, only fetch public documents
        const documents = await prisma.document.findMany({
            where: {
                ...(productId && { productId }),
                ...(!isAuthenticated && { isPublic: true }) // Dealers and Admins can see all. Public can only see isPublic=true.
            },
            orderBy: { createdAt: 'desc' },
            include: {
                product: true
            }
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { title, type, url, isPublic, productId } = data;

        if (!title || !type || !url) {
            return NextResponse.json({ error: "Title, type, and url are required" }, { status: 400 });
        }

        const newDocument = await prisma.document.create({
            data: {
                title,
                type,
                url,
                isPublic: isPublic !== undefined ? isPublic : true,
                productId: productId || null
            }
        });

        return NextResponse.json(newDocument, { status: 201 });
    } catch (error) {
        console.error("Error creating document:", error);
        return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }
}
