import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cat = await prisma.category.create({
            data: { name_en: 'Lab Equipment ' + Date.now(), name_tr: 'Laboratuvar Ekipmanları' }
        });
        const brand = await prisma.brand.create({
            data: { name: 'Scitek ' + Date.now(), logoUrl: '/favicon.ico' }
        });
        const product = await prisma.product.create({
            data: {
                name_tr: 'Test Termostatik Su Banyosu',
                name_en: 'Thermostatic Water Bath',
                description_tr: 'Örnek açıklama metni.',
                description_en: 'Sample description text.',
                brandId: brand.id,
                categoryId: cat.id,
                technicalSpecs: [
                    { key_tr: "Kapasite", val_tr: "10L", key_en: "Capacity", val_en: "10L" },
                    { key_tr: "Voltaj", val_tr: "220V", key_en: "Voltage", val_en: "220V" }
                ],
                documents: {
                    create: [{
                        title: 'Catalog.pdf',
                        type: 'PDF',
                        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                    }]
                }
            }
        });
        return NextResponse.json({ success: true, productId: product.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
