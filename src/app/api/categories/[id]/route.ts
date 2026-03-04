import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, context: any) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { name_tr, name_en, description_tr, description_en, imageUrl, parentId } = data;

        if (!name_tr) {
            return NextResponse.json({ error: "Turkish Name is required" }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name_tr,
                name_en,
                description_tr,
                description_en,
                imageUrl,
                parentId: parentId || null
            }
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: any) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if category has associated products
        const category = await prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true, children: true } } }
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        if (category._count.products > 0) {
            return NextResponse.json({ error: "Cannot delete category because it has products associated with it. Please reassign or delete those products first." }, { status: 400 });
        }

        if (category._count.children > 0) {
            return NextResponse.json({ error: "Cannot delete category because it has subcategories. Please reassign or delete those subcategories first." }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
