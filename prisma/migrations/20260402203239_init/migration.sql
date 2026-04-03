-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'ANALYST', 'ADMIN');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "RecordType" NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "records_type_idx" ON "records"("type");

-- CreateIndex
CREATE INDEX "records_category_idx" ON "records"("category");

-- CreateIndex
CREATE INDEX "records_date_idx" ON "records"("date");

-- CreateIndex
CREATE INDEX "records_userId_idx" ON "records"("userId");

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
