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

        const updateData = {
            aboutText_tr: data.aboutText_tr,
            aboutText_en: data.aboutText_en,
            phone: data.phone,
            email: data.email,
            address: data.address,
            // Content Management
            expertise_tr: data.expertise_tr ?? null,
            expertise_en: data.expertise_en ?? null,
            translations_tr: data.translations_tr ?? null,
            translations_en: data.translations_en ?? null,
            refNotice_tr: data.refNotice_tr ?? null,
            refNotice_en: data.refNotice_en ?? null,
            trustFeatures_tr: data.trustFeatures_tr ?? null,
            trustFeatures_en: data.trustFeatures_en ?? null,
            trustStats_tr: data.trustStats_tr ?? null,
            trustStats_en: data.trustStats_en ?? null,
            // Footer & Social
            footerDesc_tr: data.footerDesc_tr ?? null,
            footerDesc_en: data.footerDesc_en ?? null,
            footerQuickLinks: data.footerQuickLinks ?? null,
            footerColumns: data.footerColumns ?? null,
            instagramUrl: data.instagramUrl ?? null,
            linkedinUrl: data.linkedinUrl ?? null,
            twitterUrl: data.twitterUrl ?? null,
            youtubeUrl: data.youtubeUrl ?? null,
        } as any;

        let updatedSettings;
        if (existing) {
            updatedSettings = await prisma.setting.update({
                where: { id: existing.id },
                data: updateData
            });
        } else {
            updatedSettings = await prisma.setting.create({
                data: updateData
            });
        }

        return NextResponse.json(updatedSettings, { status: 200 });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
