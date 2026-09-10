import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PUT(
    req: NextRequest,
    context: RouteContext
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
    context: RouteContext
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const id = params.id;

        const brand = await prisma.brand.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!brand) {
            return NextResponse.json({ error: "Marka bulunamadı." }, { status: 404 });
        }

        if (brand._count.products > 0) {
            return NextResponse.json({
                error: `Bu markaya bağlı ${brand._count.products} ürün var. Markayı silmeden önce bu ürünleri başka bir markaya taşıyın veya ürünleri silin.`
            }, { status: 400 });
        }

        await prisma.brand.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Marka başarıyla silindi" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting brand:", error);
        return NextResponse.json({ error: "Marka silinemedi" }, { status: 500 });
    }
}
