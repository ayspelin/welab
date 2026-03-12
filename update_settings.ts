// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.setting.findFirst();
    
    if (existing) {
        await prisma.setting.update({
            where: { id: existing.id },
            data: { 
                address: 'WELAB LABORATUVAR CİHAZLARI TİC LTD STİ\nMUSTAFA KEMAL MAHALLESİ 2118 CADDE NO:4/A Maidan İş ve Yaşam Merkezi A/73\nCANKAYA/ANKARA', 
                email: 'info@welabtr.com' 
            }
        });
        console.log('Settings updated successfully');
    } else {
        await prisma.setting.create({
            data: { 
                address: 'WELAB LABORATUVAR CİHAZLARI TİC LTD STİ\nMUSTAFA KEMAL MAHALLESİ 2118 CADDE NO:4/A Maidan İş ve Yaşam Merkezi A/73\nCANKAYA/ANKARA', 
                email: 'info@welabtr.com' 
            }
        });
        console.log('Settings created successfully');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
