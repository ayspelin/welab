import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
        console.error("Lütfen email ve şifre girin.")
        console.error("Kullanım: npx tsx scripts/create-admin.ts <email> <şifre>")
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
        },
        create: {
            email,
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    })

    console.log(`Admin kullanıcısı başarıyla oluşturuldu: ${user.email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
