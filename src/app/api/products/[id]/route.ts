import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, context: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await context.params;
        const id = resolvedParams.id;

        const data = await req.json();
        const { name_tr, name_en, description_tr, description_en, technicalSpecs, brandId, categoryId, isFeatured, images, documents } = data;

        // Perform update
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(name_tr && { name_tr }),
                ...(name_en !== undefined && { name_en }),
                ...(description_tr && { description_tr }),
                ...(description_en !== undefined && { description_en }),
                ...(technicalSpecs !== undefined && { technicalSpecs }),
                ...(brandId && { brandId }),
                ...(categoryId && { categoryId }),
                ...(isFeatured !== undefined && { isFeatured }),
            },
        });

        // Optionally handle image replacement if new images are provided
        if (images !== undefined) {
            // First delete old images
            await prisma.productImage.deleteMany({
                where: { productId: id }
            });

            // Create new ones
            if (images.length > 0) {
                await prisma.productImage.createMany({
                    data: images.map((img: any, index: number) => ({
                        productId: id,
                        url: img.url,
                        isPrimary: index === 0,
                        order: index
                    }))
                });
            }
        }

        // Optionally handle document replacement
        if (documents !== undefined) {
            // First delete old documents
            await prisma.document.deleteMany({
                where: { productId: id }
            });

            // Create new ones
            if (documents.length > 0) {
                await prisma.document.createMany({
                    data: documents.map((doc: any) => ({
                        productId: id,
                        title: doc.title || "Document",
                        type: doc.type || "PDF",
                        url: doc.url,
                        isPublic: doc.isPublic !== undefined ? doc.isPublic : true
                    }))
                });
            }
        }

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await context.params;
        const id = resolvedParams.id;

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
