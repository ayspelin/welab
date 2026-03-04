import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(
    req: NextRequest,
    context: any // Fix for build context type error 
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const id = params.id;
        const data = await req.json();
        const { name, logoUrl, description_tr, description_en, url } = data;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: {
                name,
                logoUrl,
                description_tr,
                description_en,
                url,
            }
        });

        return NextResponse.json(updatedBrand, { status: 200 });
    } catch (error) {
        console.error("Error updating brand EXACTLY:", error);
        return NextResponse.json({ error: "Failed to update brand", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: any
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const id = params.id;

        // Check if brand is attached to products
        const productsCount = await prisma.product.count({
            where: { brandId: id }
        });

        if (productsCount > 0) {
            return NextResponse.json({ error: "Cannot delete brand because it is attached to existing products." }, { status: 400 });
        }

        await prisma.brand.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Brand deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting brand:", error);
        return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
    }
}
