import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// DELETE — remove a folder and move its documents to "Genel"
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await params;
        const folderName = decodeURIComponent(name);

        if (folderName === "Genel") {
            return NextResponse.json({ error: '"Genel" klasörü silinemez' }, { status: 400 });
        }

        // Move all documents in this folder to "Genel"
        await (prisma.document as any).updateMany({
            where: { category: folderName },
            data: { category: "Genel" },
        });

        // Delete the folder record
        await (prisma as any).documentFolder.deleteMany({
            where: { name: folderName },
        });

        // Ensure "Genel" folder exists as a record
        await (prisma as any).documentFolder.upsert({
            where: { name: "Genel" },
            update: {},
            create: { name: "Genel" },
        });

        return NextResponse.json({ message: `"${folderName}" klasörü silindi, belgeler "Genel"e taşındı.` });
    } catch (error) {
        console.error("Folder delete error:", error);
        return NextResponse.json({ error: "Klasör silinemedi" }, { status: 500 });
    }
}

// PATCH — update a folder (e.g. its image)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await params;
        const folderName = decodeURIComponent(name);

        const body = await req.json();
        const { imageUrl } = body;

        const updatedFolder = await (prisma as any).documentFolder.update({
            where: { name: folderName },
            data: { imageUrl: imageUrl !== undefined ? imageUrl : null },
        });

        return NextResponse.json(updatedFolder);
    } catch (error) {
        console.error("Folder update error:", error);
        return NextResponse.json({ error: "Klasör güncellenemedi" }, { status: 500 });
    }
}
