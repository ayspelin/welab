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
                    aboutText_tr: data.aboutText_tr,
                    aboutText_en: data.aboutText_en,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    heroTitle_tr: data.heroTitle_tr,
                    heroTitle_en: data.heroTitle_en,
                    heroDesc_tr: data.heroDesc_tr,
                    heroDesc_en: data.heroDesc_en,
                    heroImageUrl: data.heroImageUrl,
                    heroBgImageUrl: data.heroBgImageUrl,
                }
            });
        } else {
            updatedSettings = await prisma.setting.create({
                data: {
                    aboutText_tr: data.aboutText_tr,
                    aboutText_en: data.aboutText_en,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    heroTitle_tr: data.heroTitle_tr,
                    heroTitle_en: data.heroTitle_en,
                    heroDesc_tr: data.heroDesc_tr,
                    heroDesc_en: data.heroDesc_en,
                    heroImageUrl: data.heroImageUrl,
                    heroBgImageUrl: data.heroBgImageUrl,
                }
            });
        }

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
