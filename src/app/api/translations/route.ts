import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Deep merge utility
const mergeDeep = (target: any, source: any) => {
    if (!source) return target;
    const output = Object.assign({}, target);
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!(key in target)) {
                Object.assign(output, { [key]: source[key] });
            } else {
                output[key] = mergeDeep(target[key], source[key]);
            }
        } else {
            Object.assign(output, { [key]: source[key] });
        }
    }
    return output;
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Read base JSON files
        const trPath = path.join(process.cwd(), 'messages', 'tr.json');
        const enPath = path.join(process.cwd(), 'messages', 'en.json');
        
        const baseTr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
        const baseEn = JSON.parse(fs.readFileSync(enPath, 'utf8'));

        // Read DB overrides
        const settings = await prisma.setting.findFirst() as any;
        const dbTr = settings?.translations_tr || {};
        const dbEn = settings?.translations_en || {};

        // Merge to get current effective translations
        const effectiveTr = mergeDeep(baseTr, dbTr);
        const effectiveEn = mergeDeep(baseEn, dbEn);

        return NextResponse.json({ tr: effectiveTr, en: effectiveEn });
    } catch (error) {
        console.error("Error fetching translations:", error);
        return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { tr, en } = data;

        const existing = await prisma.setting.findFirst();

        if (existing) {
            await prisma.setting.update({
                where: { id: existing.id },
                data: {
                    translations_tr: tr,
                    translations_en: en
                } as any
            });
        } else {
            await prisma.setting.create({
                data: {
                    aboutText_en: "", // required fields dummy fallback
                    translations_tr: tr,
                    translations_en: en
                } as any
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving translations:", error);
        return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
    }
}
