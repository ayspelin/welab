import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");

    try {
        const products = await prisma.product.findMany({
            where: {
                ...(categoryId && { categoryId }),
                ...(brandId && { brandId }),
            },
            include: {
                brand: true,
                category: true,
                images: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const {
            name,
            description,
            technicalSpecs,
            brandId,
            categoryId,
            isFeatured,
            images
        } = data;

        if (!name || !description || !brandId || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Creating product and nested images
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                technicalSpecs: technicalSpecs || {},
                brandId,
                categoryId,
                isFeatured: isFeatured || false,
                images: {
                    create: images && Array.isArray(images) ? images.map((img: any, index: number) => ({
                        url: img.url,
                        isPrimary: index === 0,
                        order: index
                    })) : []
                }
            },
            include: {
                images: true,
                brand: true,
                category: true
            }
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
