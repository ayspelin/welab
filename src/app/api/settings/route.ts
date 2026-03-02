import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const settings = await prisma.setting.findFirst();
        return NextResponse.json(settings || {});
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Find existing to update, or create
        const existing = await prisma.setting.findFirst();

        let updatedSettings;
        if (existing) {
            updatedSettings = await prisma.setting.update({
                where: { id: existing.id },
                data: {
                    aboutText: data.aboutText,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                }
            });
        } else {
            updatedSettings = await prisma.setting.create({
                data: {
                    aboutText: data.aboutText,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                }
            });
        }

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
