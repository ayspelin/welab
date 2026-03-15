-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "refNotice_en" TEXT,
ADD COLUMN     "refNotice_tr" TEXT,
ADD COLUMN     "trustFeatures_en" JSONB,
ADD COLUMN     "trustFeatures_tr" JSONB,
ADD COLUMN     "trustStats_en" JSONB,
ADD COLUMN     "trustStats_tr" JSONB;

-- CreateTable
CREATE TABLE "Dealer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);
