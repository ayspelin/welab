import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = "admin@test.com"
    const password = "password123"

    console.log(`Checking user: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error("USER NOT FOUND IN DB!");
        return;
    }

    console.log("User found:", user.email, "Role:", user.role)
    console.log("Stored hash:", user.passwordHash)

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
        console.log("✅ PASSWORD IS VALID!")
    } else {
        console.log("❌ PASSWORD MISMATCH!")
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
