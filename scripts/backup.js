const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Veritabanı yedeği başlatılıyor...");

  // Tüm tablolarımızın (modellerin) isimleri (schema.prisma'ya göre)
  const models = [
    'user',
    'brand',
    'category',
    'product',
    'productImage',
    'document',
    'documentFolder',
    'setting',
    'heroSlide',
    'reference',
    'event',
    'dealer',
    'service',
    'inquiry'
  ];

  const backupData = {};

  for (const model of models) {
    console.log(`📦 ${model} tablosu okunuyor...`);
    try {
      backupData[model] = await prisma[model].findMany();
    } catch (e) {
      console.warn(`⚠️ ${model} tablosu okunurken bir hata oluştu.`, e.message);
    }
  }

  // Yedeklerin konulacağı klasör
  const dirPath = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  // Dosya adını o anki tarih/saat ile oluşturuyoruz
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(dirPath, `backup-${timestamp}.json`);
  
  // JSON formatında dosyaya yazıyoruz
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

  console.log(`\n🎉 Yedekleme tamamlandı!`);
  console.log(`📂 Dosya konumu: ${filePath}`);
}

main()
  .catch((e) => {
    console.error("❌ Yedekleme sırasında genel bir hata oluştu:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
