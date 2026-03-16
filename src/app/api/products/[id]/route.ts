import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest, context: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await context.params;
        const id = resolvedParams.id;

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

        // Perform update in a transaction
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // Update basic fields
            const product = await tx.product.update({
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
                    ...(isPublic !== undefined && { isPublic }),
                },
            });

            // Handle image replacement if provided
            if (images !== undefined) {
                await tx.productImage.deleteMany({ where: { productId: id } });
                if (images.length > 0) {
                    await tx.productImage.createMany({
                        data: images.map((img: any, index: number) => ({
                            productId: id,
                            url: img.url,
                            isPrimary: index === 0,
                            order: index
                        }))
                    });
                }
            }

            // Handle document replacement if provided
            if (documents !== undefined) {
                await tx.document.deleteMany({ where: { productId: id } });
                if (documents.length > 0) {
                    await tx.document.createMany({
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

            return product;
        });

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
