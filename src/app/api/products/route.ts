import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");

    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN");

        const products = await prisma.product.findMany({
            where: {
                ...(categoryId && { categoryId }),
                ...(brandId && { brandId }),
                ...(!isAdmin && { isPublic: true }),
            },
            include: {
                brand: true,
                category: true,
                images: true
            },
            orderBy: { name_tr: 'asc' }
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
            name_tr,
            name_en,
            description_tr,
            description_en,
            technicalSpecs,
            brandId,
            categoryId,
            isFeatured,
            isPublic,
            images,
            documents
        } = data;

        if (!name_tr || !description_tr || !brandId || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Creating product and nested images
        const newProduct = await prisma.product.create({
            data: {
                name_tr,
                name_en,
                description_tr,
                description_en,
                technicalSpecs: technicalSpecs || {},
                brandId,
                categoryId,
                isFeatured: isFeatured || false,
                isPublic: isPublic !== undefined ? isPublic : true,
                images: {
                    create: images && Array.isArray(images) ? images.map((img: any, index: number) => ({
                        url: img.url,
                        isPrimary: index === 0,
                        order: index
                    })) : []
                },
                documents: {
                    create: documents && Array.isArray(documents) ? documents.map((doc: any) => ({
                        title: doc.title || "Document",
                        type: doc.type || "PDF",
                        url: doc.url,
                        isPublic: doc.isPublic !== undefined ? doc.isPublic : true
                    })) : []
                }
            },
            include: {
                images: true,
                documents: true,
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
