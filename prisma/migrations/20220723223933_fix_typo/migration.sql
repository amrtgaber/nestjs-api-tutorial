/*
  Warnings:

  - You are about to drop the column `lastNAme` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastNAme",
ADD COLUMN     "lastName" TEXT;
