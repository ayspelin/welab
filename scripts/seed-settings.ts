import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Creating default settings record...");

    // Check if exists
    const existing = await prisma.setting.findFirst();
    if (!existing) {
        await prisma.setting.create({
            data: {
                aboutText: `
<h2>WeLab Hakkında</h2>
<p>WeLab, laboratuvar ve endüstriyel spektral analiz cihazları konusunda uzmanlaşmış bir teknoloji firmasıdır.</p>
<p>20 yılı aşkın tecrübemiz ve alanında lider global iş ortaklarımızla, Türkiye'deki araştırma merkezlerine, üniversitelere ve endüstriyel tesislere en ileri teknolojiyi sunuyoruz.</p>
                `,
                phone: "+90 216 123 45 67",
                email: "info@welab.com.tr",
                address: "Teknoloji Vadisi, Ar-Ge Binası No:1, İstanbul",
            }
        });
        console.log("Default setting created successfully!");
    } else {
        console.log("Settings already exist.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
