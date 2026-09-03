const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'okartal@welabtr.com';
  const password = 'WelabAdmin' + Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN',
      isApproved: true,
      emailVerified: true
    },
    create: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isApproved: true,
      emailVerified: true
    }
  });

  console.log('SUCCESS');
  console.log('Email:', user.email);
  console.log('Password:', password);
}

main()
  .catch(e => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
