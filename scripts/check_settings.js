const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.siteSettings.findFirst();
    console.log(settings.footerColumns);
}

main().catch(console.error).finally(() => prisma.$disconnect());
